import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'demo',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'frontend-client',
});

export const keycloakInit = keycloak.init({
  onLoad: 'check-sso',
  pkceMethod: 'S256',
  checkLoginIframe: false,
});

export function login(username?: string) {
  return keycloak.login(username ? { loginHint: username } : undefined);
}

export function logout() {
  return keycloak.logout({ redirectUri: window.location.origin });
}

export async function getAccessToken() {
  await keycloak.updateToken(30);
  if (!keycloak.token)
    throw new Error('Your session has expired. Please sign in again.');
  return keycloak.token;
}
