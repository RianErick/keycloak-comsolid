package com.example.keycloakdemo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class KeycloakBadRequestException extends BaseException {
    public KeycloakBadRequestException() { super("Keycloak rejected the request"); }
}
