import type { JwtClaims } from "../types";

function decodePart(part: string): unknown {
  let normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) {
    normalized += "=";
  }
  const json = atob(normalized);
  const bytes = Uint8Array.from(json, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function splitJwt(token: string) {
  const [header = "", payload = "", signature = ""] = token.split(".");
  return { header, payload, signature };
}

export function decodeJwtHeader(token: string): Record<string, unknown> {
  const { header } = splitJwt(token);
  if (!header) {
    return {};
  }
  return decodePart(header) as Record<string, unknown>;
}

export function decodeJwtPayload(token: string): JwtClaims {
  const { payload } = splitJwt(token);
  if (!payload) {
    return {};
  }
  return decodePart(payload) as JwtClaims;
}
