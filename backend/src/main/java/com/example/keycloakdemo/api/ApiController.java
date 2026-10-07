package com.example.keycloakdemo.api;

import java.time.Instant;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.keycloakdemo.user.AppUserProfile;
import com.example.keycloakdemo.user.AppUserProfileService;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final AppUserProfileService profileService;

    public ApiController(AppUserProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/public")
    public Map<String, Object> publicEndpoint() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Endpoint público. Não exige token.");
        body.put("timestamp", Instant.now().toString());
        return body;
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Você está autenticado. O backend validou o JWT do Keycloak.");
        body.put("username", jwt.getClaimAsString("preferred_username"));
        body.put("email", jwt.getClaimAsString("email"));
        body.put("name", jwt.getClaimAsString("name"));
        body.put("subject", jwt.getSubject());
        body.put("issuer", jwt.getIssuer() != null ? jwt.getIssuer().toString() : null);
        body.put("roles", realmRoles(jwt));
        body.put("issuedAt", jwt.getIssuedAt());
        body.put("expiresAt", jwt.getExpiresAt());

        AppUserProfile profile = profileService.findByKeycloakUserId(UUID.fromString(jwt.getSubject()));
        body.put("appProfile", profileService.toResponse(profile));
        if (profile != null) {
            body.put(
                "message",
                "JWT validado no Keycloak. Perfil local encontrado no PostgreSQL do backend (via keycloakUserId)."
            );
        }
        return body;
    }

    @GetMapping("/admin")
    public Map<String, Object> admin(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Acesso administrativo concedido (role admin no realm).");
        body.put("username", jwt.getClaimAsString("preferred_username"));
        body.put("roles", realmRoles(jwt));
        AppUserProfile profile = profileService.findByKeycloakUserId(UUID.fromString(jwt.getSubject()));
        body.put("appProfile", profileService.toResponse(profile));
        return body;
    }

    @SuppressWarnings("unchecked")
    private List<String> realmRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null) {
            return List.of();
        }
        Object roles = realmAccess.get("roles");
        if (roles instanceof Collection<?> collection) {
            return collection.stream().map(Object::toString).toList();
        }
        return List.of();
    }
}
