package com.example.keycloakdemo.api;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.keycloakdemo.keycloak.KeycloakRegistrationService;
import com.example.keycloakdemo.keycloak.KeycloakRegistrationService.UsernameTakenException;
import com.example.keycloakdemo.user.AppUserProfile;
import com.example.keycloakdemo.user.AppUserProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/public")
public class RegistrationController {

    private final KeycloakRegistrationService registrationService;
    private final AppUserProfileService profileService;

    public RegistrationController(
        KeycloakRegistrationService registrationService,
        AppUserProfileService profileService
    ) {
        this.registrationService = registrationService;
        this.profileService = profileService;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody @Valid RegisterRequest request) {
        var keycloakUserId = registrationService.register(request);
        AppUserProfile profile;
        try {
            profile = profileService.createFromRegistration(keycloakUserId, request);
        } catch (RuntimeException ex) {
            registrationService.deleteUser(keycloakUserId);
            throw ex;
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Usuário criado. No primeiro login o Keycloak exige configurar MFA (OTP).");
        body.put("username", request.username());
        body.put("mfa", "CONFIGURE_TOTP");
        body.put("keycloakUserId", keycloakUserId);
        body.put("appProfile", profileService.toResponse(profile));
        return body;
    }

    @ExceptionHandler(UsernameTakenException.class)
    ResponseEntity<Map<String, String>> usernameTaken(UsernameTakenException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }
}
