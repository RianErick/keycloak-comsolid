package com.example.keycloakdemo.security;

import com.example.keycloakdemo.exception.UserModificationForbiddenException;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;
import lombok.experimental.UtilityClass;

@UtilityClass
public class AuthorizationHelper {

  public static void validateResourceAccess(
      UUID expectedKeycloakId, Supplier<? extends RuntimeException> exceptionSupplier) {
    UUID keycloakId = AuthenticationHelper.getKeycloakId();
    List<String> roles = AuthenticationHelper.getJwtRoles();
    if (!expectedKeycloakId.equals(keycloakId) && !roles.contains("admin")) {
      throw exceptionSupplier.get();
    }
  }

  public static void validateResourceAccess(UUID expectedKeycloakId) {
    validateResourceAccess(expectedKeycloakId, UserModificationForbiddenException::new);
  }
}
