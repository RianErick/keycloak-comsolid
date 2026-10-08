package com.example.keycloakdemo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class UserAlreadyVerifiedException extends BaseException {

    public UserAlreadyVerifiedException() {
        super("The user's email is already verified");
    }
}
