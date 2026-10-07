export function formatExpiry(exp?: number) {
  if (!exp) {
    return "—";
  }
  return new Date(exp * 1000).toLocaleString("pt-BR");
}

export function remainingLabel(exp?: number, now = Date.now()) {
  if (!exp) {
    return null;
  }
  const left = Math.max(0, Math.floor((exp * 1000 - now) / 1000));
  if (left <= 0) {
    return "expirado";
  }
  const minutes = Math.floor(left / 60);
  const seconds = Math.floor(left % 60);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function apiHint(status: number, path: string) {
  if (status === 401) {
    return "Token ausente ou inválido.";
  }
  if (status === 403) {
    return "Autenticado, mas sem a role admin.";
  }
  if (status === 200 && path === "/admin") {
    return "Role admin aceita pelo backend.";
  }
  if (status === 200 && path === "/me") {
    return "JWT validado. O backend leu o titular.";
  }
  if (status === 200 && path === "/public") {
    return "Endpoint livre, sem Authorization.";
  }
  return null;
}

export function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}
