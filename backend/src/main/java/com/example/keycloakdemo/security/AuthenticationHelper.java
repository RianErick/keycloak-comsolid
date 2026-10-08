package com.example.keycloakdemo.security;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.example.keycloakdemo.exception.UserUnauthorizedException;
import lombok.experimental.UtilityClass;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@UtilityClass
public class AuthenticationHelper {

    public static Authentication getAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UserUnauthorizedException();
        }
        return authentication;
    }

    public static Jwt getJwt() {
        Authentication authentication = getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
            throw new UserUnauthorizedException();
        }
        return jwtAuthentication.getToken();
    }

    public static String getUsername() {
        String username = getAuthentication().getName();
        if (username == null || username.isBlank()) {
            throw new UserUnauthorizedException();
        }
        return username;
    }

    public static UUID getKeycloakId() {
        try {
            String subject = getJwt().getSubject();
            if (subject == null || subject.isBlank()) throw new IllegalArgumentException();
            return UUID.fromString(subject);
        } catch (IllegalArgumentException exception) {
            throw new UserUnauthorizedException();
        }
    }

    public static List<String> getJwtRoles() {
        Map<String, Object> realmAccess = getJwt().getClaim("realm_access");
        if (realmAccess == null || !(realmAccess.get("roles") instanceof List<?> roles)) {
            return List.of();
        }

        return roles.stream()
            .filter(String.class::isInstance)
            .map(String.class::cast)
            .toList();
    }
}
