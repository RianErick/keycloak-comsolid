CREATE TABLE app_user_profile (
    id UUID PRIMARY KEY,
    keycloak_user_id UUID NOT NULL UNIQUE,
    username VARCHAR(64) NOT NULL UNIQUE,
    full_name VARCHAR(160) NOT NULL,
    department VARCHAR(80) NOT NULL,
    employee_code VARCHAR(32) NOT NULL UNIQUE,
    customer_tier VARCHAR(32) NOT NULL,
    internal_note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_user_profile_keycloak_user_id ON app_user_profile (keycloak_user_id);
