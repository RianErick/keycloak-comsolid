package com.example.keycloakdemo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class KeycloakForbiddenException extends BaseException {
    public KeycloakForbiddenException() { super("The client is not allowed to perform this operation in Keycloak"); }
}
