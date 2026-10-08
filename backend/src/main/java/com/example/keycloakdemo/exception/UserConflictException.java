package com.example.keycloakdemo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class UserConflictException extends BaseException {

  private static final String DEFAULT_ERROR_MESSAGE =
      "A user with this username or email already exists";

  public UserConflictException() {
    super(DEFAULT_ERROR_MESSAGE);
  }
}
