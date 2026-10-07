export interface TokenSet {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  stored_at?: number;
}

export interface JwtClaims {
  preferred_username?: string;
  name?: string;
  email?: string;
  sub?: string;
  iss?: string;
  exp?: number;
  iat?: number;
  realm_access?: {
    roles?: string[];
  };
  [key: string]: unknown;
}

export interface ApiCallResult {
  path: string;
  status: number;
  elapsed: number;
  withAuth: boolean;
  body: unknown;
  tokens?: TokenSet | null;
}

export interface AppProfile {
  id?: string;
  keycloakUserId?: string;
  username?: string;
  fullName?: string;
  department?: string;
  employeeCode?: string;
  customerTier?: string;
  internalNote?: string;
  createdAt?: string;
  source?: string;
}
