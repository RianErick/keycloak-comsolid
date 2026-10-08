package com.example.keycloakdemo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class KeycloakConflictException extends BaseException {
    public KeycloakConflictException() { super("A user with this username already exists"); }
}
