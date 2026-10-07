import { decodeJwtPayload } from "./lib/jwt";
import type { JwtClaims, TokenSet } from "./types";

const storageKey = "kc-demo-tokens";
const verifierKey = "kc-demo-pkce";

export function config() {
  return window.APP_CONFIG;
}

function oidcBase() {
  const { keycloakUrl, realm } = config();
  return `${keycloakUrl}/realms/${realm}/protocol/openid-connect`;
}

function redirectUri() {
  return `${window.location.origin}/`;
}

function toBase64Url(bytes: Uint8Array) {
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

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return toBase64Url(new Uint8Array(hash));
}

export function readTokens(): TokenSet | null {
  const raw = sessionStorage.getItem(storageKey);
  return raw ? (JSON.parse(raw) as TokenSet) : null;
}

function saveTokens(tokens: TokenSet) {
  tokens.stored_at = Date.now();
  sessionStorage.setItem(storageKey, JSON.stringify(tokens));
}

export function clearSession() {
  sessionStorage.removeItem(storageKey);
  sessionStorage.removeItem(verifierKey);
}

export function decodeJwt(token: string): JwtClaims {
  return decodeJwtPayload(token);
}

export function realmRoles(claims: JwtClaims) {
  return claims.realm_access?.roles ?? [];
}

function isExpired(tokens: TokenSet) {
  if (!tokens.access_token) {
    return true;
  }
  const claims = decodeJwt(tokens.access_token);
  const skew = 20;
  return !claims.exp || claims.exp * 1000 <= Date.now() + skew * 1000;
}

async function exchangeToken(body: URLSearchParams) {
  const response = await fetch(`${oidcBase()}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = (await response.json()) as TokenSet & {
    error?: string;
    error_description?: string;
  };
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Falha ao obter token");
  }
  saveTokens(data);
  return data;
}

export async function handleRedirect() {
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
    client_id: config().clientId,
    code,
    redirect_uri: redirectUri(),
    code_verifier: verifier
  });
  sessionStorage.removeItem(verifierKey);
  return exchangeToken(body);
}

export async function refreshIfNeeded(tokens: TokenSet | null) {
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
    client_id: config().clientId,
    refresh_token: tokens.refresh_token
  });

  try {
    return await exchangeToken(body);
  } catch {
    clearSession();
    return null;
  }
}

export async function login() {
  const verifier = randomString(48);
  const challenge = await sha256(verifier);
  sessionStorage.setItem(verifierKey, verifier);

  const params = new URLSearchParams({
    client_id: config().clientId,
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid profile email",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: randomString(16)
  });

  window.location.href = `${oidcBase()}/auth?${params}`;
}

export function logout() {
  const tokens = readTokens();
  const params = new URLSearchParams({
    client_id: config().clientId,
    post_logout_redirect_uri: redirectUri()
  });
  if (tokens?.id_token) {
    params.set("id_token_hint", tokens.id_token);
  }
  clearSession();
  window.location.href = `${oidcBase()}/logout?${params}`;
}

export async function callApi(path: string, withAuth: boolean) {
  const headers: Record<string, string> = { Accept: "application/json" };
  const tokens = withAuth ? await refreshIfNeeded(readTokens()) : null;
  if (withAuth && tokens?.access_token) {
    headers.Authorization = `Bearer ${tokens.access_token}`;
  }

  const started = performance.now();
  const response = await fetch(`${config().apiUrl}${path}`, { headers });
  const elapsed = Math.round(performance.now() - started);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = { error: "Resposta não-JSON" };
  }

  return { path, status: response.status, elapsed, withAuth, body, tokens };
}
