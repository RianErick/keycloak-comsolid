/// <reference types="vite/client" />

interface AppConfig {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  apiUrl: string;
}

interface Window {
  APP_CONFIG: AppConfig;
}
