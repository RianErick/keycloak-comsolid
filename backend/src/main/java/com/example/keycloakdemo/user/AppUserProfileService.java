package com.example.keycloakdemo.user;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.keycloakdemo.api.RegisterRequest;

@Service
public class AppUserProfileService {

    private final AppUserProfileRepository repository;

    public AppUserProfileService(AppUserProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public AppUserProfile createFromRegistration(UUID keycloakUserId, RegisterRequest request) {
        if (repository.existsByUsername(request.username())) {
            throw new IllegalStateException("Perfil local já existe para este usuário.");
        }

        AppUserProfile profile = new AppUserProfile();
        profile.setKeycloakUserId(keycloakUserId);
        profile.setUsername(request.username());
        profile.setFullName(request.name().trim());
        profile.setDepartment("Operações");
        profile.setEmployeeCode(nextEmployeeCode());
        profile.setCustomerTier("standard");
        profile.setInternalNote("Cadastro via portal demo · vínculo Keycloak " + keycloakUserId);
        return repository.save(profile);
    }

    @Transactional
    public AppUserProfile ensureDemoProfile(
        UUID keycloakUserId,
        String username,
        String fullName,
        String department,
        String employeeCode,
        String customerTier,
        String internalNote
    ) {
        return repository.findByKeycloakUserId(keycloakUserId).orElseGet(() -> {
            AppUserProfile profile = new AppUserProfile();
            profile.setKeycloakUserId(keycloakUserId);
            profile.setUsername(username);
            profile.setFullName(fullName);
            profile.setDepartment(department);
            profile.setEmployeeCode(employeeCode);
            profile.setCustomerTier(customerTier);
            profile.setInternalNote(internalNote);
            return repository.save(profile);
        });
    }

    public AppUserProfile findByKeycloakUserId(UUID keycloakUserId) {
        return repository.findByKeycloakUserId(keycloakUserId).orElse(null);
    }

    public Map<String, Object> toResponse(AppUserProfile profile) {
        if (profile == null) {
            return null;
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", profile.getId());
        body.put("keycloakUserId", profile.getKeycloakUserId());
        body.put("username", profile.getUsername());
        body.put("fullName", profile.getFullName());
        body.put("department", profile.getDepartment());
        body.put("employeeCode", profile.getEmployeeCode());
        body.put("customerTier", profile.getCustomerTier());
        body.put("internalNote", profile.getInternalNote());
        body.put("createdAt", profile.getCreatedAt());
        body.put("source", "postgresql-backend");
        return body;
    }

    private String nextEmployeeCode() {
        return "EMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
