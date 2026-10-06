(() => {
  const cfg = window.APP_CONFIG;
  const storageKey = "kc-demo-tokens";
  const verifierKey = "kc-demo-pkce";

  const $ = (id) => document.getElementById(id);

  function oidcBase() {
    return `${cfg.keycloakUrl}/realms/${cfg.realm}/protocol/openid-connect`;
  }

  function redirectUri() {
    return `${window.location.origin}/`;
  }

  function toBase64Url(bytes) {
    let binary = "";
    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function randomString(size = 32) {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return toBase64Url(bytes);
  }

  async function sha256(value) {
    const data = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return toBase64Url(new Uint8Array(hash));
  }

  function readTokens() {
    const raw = sessionStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  }

  function saveTokens(tokens) {
    tokens.stored_at = Date.now();
    sessionStorage.setItem(storageKey, JSON.stringify(tokens));
  }

  function clearSession() {
    sessionStorage.removeItem(storageKey);
    sessionStorage.removeItem(verifierKey);
  }

  function decodeJwt(token) {
    let payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    while (payload.length % 4) {
      payload += "=";
    }
    const json = atob(payload);
    const bytes = Uint8Array.from(json, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function isExpired(tokens) {
    if (!tokens?.access_token) {
      return true;
    }
    const claims = decodeJwt(tokens.access_token);
    const skew = 20;
    return !claims.exp || claims.exp * 1000 <= Date.now() + skew * 1000;
  }

  async function exchangeToken(body) {
    const response = await fetch(`${oidcBase()}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || data.error || "Falha ao obter token");
    }
    saveTokens(data);
    return data;
  }

  async function handleRedirect() {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const code = params.get("code");

    if (error) {
      history.replaceState({}, document.title, "/");
      throw new Error(params.get("error_description") || error);
    }

    if (!code) {
      return readTokens();
    }

    const verifier = sessionStorage.getItem(verifierKey);
    history.replaceState({}, document.title, "/");
    if (!verifier) {
      throw new Error("code_verifier ausente. Tente entrar novamente.");
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: cfg.clientId,
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier
    });
    sessionStorage.removeItem(verifierKey);
    return exchangeToken(body);
  }

  async function refreshIfNeeded(tokens) {
    if (!tokens) {
      return null;
    }
    if (!isExpired(tokens)) {
      return tokens;
    }
    if (!tokens.refresh_token) {
      clearSession();
      return null;
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: cfg.clientId,
      refresh_token: tokens.refresh_token
    });

    try {
      return await exchangeToken(body);
    } catch {
      clearSession();
      return null;
    }
  }

  async function login() {
    const verifier = randomString(48);
    const challenge = await sha256(verifier);
    sessionStorage.setItem(verifierKey, verifier);

    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: redirectUri(),
      response_type: "code",
      scope: "openid profile email",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: randomString(16)
    });

    window.location.href = `${oidcBase()}/auth?${params}`;
  }

  function logout() {
    const tokens = readTokens();
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      post_logout_redirect_uri: redirectUri()
    });
    if (tokens?.id_token) {
      params.set("id_token_hint", tokens.id_token);
    }
    clearSession();
    window.location.href = `${oidcBase()}/logout?${params}`;
  }

  function realmRoles(claims) {
    return claims?.realm_access?.roles || [];
  }

  function renderUser(tokens) {
    const status = $("session-status");
    const fields = $("user-fields");
    const loginBtn = $("btn-login");
    const logoutBtn = $("btn-logout");
    const copyBtn = $("btn-copy");
    const tokenEmpty = $("token-empty");
    const tokenRaw = $("token-raw");
    const tokenClaims = $("token-claims");

    if (!tokens) {
      status.textContent = "Não autenticado";
      status.className = "";
      fields.classList.add("hidden");
      loginBtn.classList.remove("hidden");
      logoutBtn.classList.add("hidden");
      copyBtn.classList.add("hidden");
      tokenEmpty.classList.remove("hidden");
      tokenRaw.classList.add("hidden");
      tokenClaims.textContent = "—";
      return;
    }

    const claims = decodeJwt(tokens.access_token);
    status.textContent = `Autenticado como ${claims.preferred_username}`;
    status.className = "";
    fields.classList.remove("hidden");
    fields.innerHTML = `
      <dt>Nome</dt><dd>${claims.name || "—"}</dd>
      <dt>E-mail</dt><dd>${claims.email || "—"}</dd>
      <dt>Roles</dt><dd>${realmRoles(claims).join(", ") || "—"}</dd>
      <dt>Expira</dt><dd>${new Date(claims.exp * 1000).toLocaleString("pt-BR")}</dd>
    `;
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    copyBtn.classList.remove("hidden");
    tokenEmpty.classList.add("hidden");
    tokenRaw.classList.remove("hidden");
    tokenRaw.textContent = tokens.access_token;
    tokenClaims.textContent = JSON.stringify(claims, null, 2);
  }

  async function callApi(path, withAuth) {
    const meta = $("api-meta");
    const result = $("api-result");
    meta.classList.remove("hidden");
    meta.innerHTML = "Chamando...";
    result.textContent = "";

    const headers = { Accept: "application/json" };
    const tokens = withAuth ? await refreshIfNeeded(readTokens()) : null;
    if (withAuth && tokens?.access_token) {
      headers.Authorization = `Bearer ${tokens.access_token}`;
    }

    const started = performance.now();
    const response = await fetch(`${cfg.apiUrl}${path}`, { headers });
    const elapsed = Math.round(performance.now() - started);
    let body;
    try {
      body = await response.json();
    } catch {
      body = { error: "Resposta não-JSON" };
    }

    meta.innerHTML = `HTTP ${response.status} · ${elapsed} ms · ${withAuth ? "com token" : "sem token"}`;
    result.textContent = JSON.stringify(body, null, 2);

    if (withAuth) {
      renderUser(tokens);
    }
  }

  $("btn-login").addEventListener("click", login);
  $("btn-logout").addEventListener("click", logout);
  $("btn-copy").addEventListener("click", async () => {
    const tokens = readTokens();
    if (!tokens?.access_token) {
      return;
    }
    await navigator.clipboard.writeText(tokens.access_token);
    $("btn-copy").textContent = "Copiado";
    setTimeout(() => {
      $("btn-copy").textContent = "Copiar";
    }, 1200);
  });
  $("btn-public").addEventListener("click", () => callApi("/public", false));
  $("btn-me").addEventListener("click", () => callApi("/me", true));
  $("btn-admin").addEventListener("click", () => callApi("/admin", true));

  (async () => {
    try {
      const tokens = await refreshIfNeeded(await handleRedirect());
      renderUser(tokens);
    } catch (error) {
      $("session-status").textContent = error.message;
      $("session-status").className = "";
      $("btn-login").classList.remove("hidden");
    }
  })();
})();
