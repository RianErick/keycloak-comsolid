package com.example.keycloakdemo.exception.strategy;

import java.util.function.Supplier;

import com.example.keycloakdemo.exception.KeycloakBadGatewayException;
import com.example.keycloakdemo.exception.KeycloakBadRequestException;
import com.example.keycloakdemo.exception.KeycloakConflictException;
import com.example.keycloakdemo.exception.KeycloakForbiddenException;
import com.example.keycloakdemo.exception.KeycloakNotFoundException;

public enum KeycloakExceptionStrategy {
    BAD_REQUEST(400, KeycloakBadRequestException::new),
    FORBIDDEN(403, KeycloakForbiddenException::new),
    NOT_FOUND(404, KeycloakNotFoundException::new),
    CONFLICT(409, KeycloakConflictException::new);

    private final int statusCode;
    private final Supplier<RuntimeException> exceptionSupplier;

    KeycloakExceptionStrategy(int statusCode, Supplier<RuntimeException> exceptionSupplier) {
        this.statusCode = statusCode;
        this.exceptionSupplier = exceptionSupplier;
    }

    public static RuntimeException of(int statusCode) {
        for (KeycloakExceptionStrategy strategy : values()) {
            if (strategy.statusCode == statusCode) return strategy.exceptionSupplier.get();
        }
        return new KeycloakBadGatewayException();
    }
}
