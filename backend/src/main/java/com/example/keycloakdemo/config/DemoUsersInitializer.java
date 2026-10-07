package com.example.keycloakdemo.config;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.example.keycloakdemo.keycloak.KeycloakRegistrationService;
import com.example.keycloakdemo.user.AppUserProfileService;

@Component
public class DemoUsersInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoUsersInitializer.class);

    private final KeycloakRegistrationService keycloakRegistrationService;
    private final AppUserProfileService profileService;

    public DemoUsersInitializer(
        KeycloakRegistrationService keycloakRegistrationService,
        AppUserProfileService profileService
    ) {
        this.keycloakRegistrationService = keycloakRegistrationService;
        this.profileService = profileService;
    }

    @Override
    public void run(ApplicationArguments args) {
        waitForKeycloakAdmin();
        seed("alice", "Alice Silva", "Atendimento", "EMP-ALICE", "silver", "Conta demo · sem MFA");
        seed("bob", "Bob Santos", "TI / Segurança", "EMP-BOB-ADM", "gold", "Conta demo · role admin no realm");
    }

    private void waitForKeycloakAdmin() {
        for (int attempt = 1; attempt <= 8; attempt++) {
            try {
                if (keycloakRegistrationService.findKeycloakUserId("alice").isPresent()) {
                    return;
                }
            } catch (Exception ignored) {
                // Keycloak Admin API ainda não está pronta.
            }
            sleep(1500L);
        }
        log.warn("Keycloak Admin API não respondeu a tempo; perfis demo podem ficar pendentes.");
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    private void seed(
        String username,
        String fullName,
        String department,
        String employeeCode,
        String tier,
        String note
    ) {
        try {
            UUID keycloakId = keycloakRegistrationService.findKeycloakUserId(username).orElse(null);
            if (keycloakId == null) {
                log.warn("Usuário demo {} não encontrado no Keycloak; perfil local não criado.", username);
                return;
            }
            profileService.ensureDemoProfile(keycloakId, username, fullName, department, employeeCode, tier, note);
        } catch (Exception ex) {
            log.warn("Falha ao sincronizar perfil demo de {}: {}", username, ex.getMessage());
        }
    }
}
