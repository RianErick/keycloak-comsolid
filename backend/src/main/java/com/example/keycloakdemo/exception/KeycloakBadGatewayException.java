package com.example.keycloakdemo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class KeycloakBadGatewayException extends BaseException {
  public KeycloakBadGatewayException() {
    super("Failed to communicate with Keycloak");
  }
}
