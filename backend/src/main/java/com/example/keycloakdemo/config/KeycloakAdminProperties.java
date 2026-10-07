package com.example.keycloakdemo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.keycloak.admin")
public record KeycloakAdminProperties(
    String serverUrl,
    String realm,
    String adminRealm,
    String clientId,
    String username,
    String password
) {}
