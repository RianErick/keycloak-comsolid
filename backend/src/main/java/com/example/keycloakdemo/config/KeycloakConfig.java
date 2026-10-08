package com.example.keycloakdemo.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UsersResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

  @Value("${app.keycloak.server-url}")
  private String serverUrl;

  @Value("${app.keycloak.realm}")
  private String realm;

  @Value("${app.keycloak.client-id}")
  private String clientId;

  @Value("${app.keycloak.client-secret}")
  private String clientSecret;

  @Bean
  Keycloak keycloak() {
    return KeycloakBuilder.builder()
        .serverUrl(serverUrl)
        .realm(realm)
        .clientId(clientId)
        .clientSecret(clientSecret)
        .grantType("client_credentials")
        .build();
  }

  @Bean
  UsersResource usersResource(Keycloak keycloak) {
    return keycloak.realm(realm).users();
  }
}
