package com.example.keycloakdemo.service;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import com.example.keycloakdemo.exception.UserAlreadyVerifiedException;
import com.example.keycloakdemo.exception.strategy.KeycloakExceptionStrategy;
import com.example.keycloakdemo.payload.request.UserRegisterRequest;
import com.example.keycloakdemo.payload.request.UserUpdateRequest;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeycloakService {

    private final UsersResource usersResource;

    public UUID register(UserRegisterRequest request) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEnabled(true);
        user.setRequiredActions(List.of("CONFIGURE_TOTP"));

        CredentialRepresentation password = new CredentialRepresentation();
        password.setType(CredentialRepresentation.PASSWORD);
        password.setValue(request.getPassword());
        password.setTemporary(false);
        user.setCredentials(List.of(password));

        try (Response response = usersResource.create(user)) {
            if (response.getStatus() != Response.Status.CREATED.getStatusCode()) {
                throw KeycloakExceptionStrategy.of(response.getStatus());
            }

            URI location = response.getLocation();
            if (location == null || location.getPath() == null || location.getPath().isBlank()) {
                throw KeycloakExceptionStrategy.of(502);
            }

            String path = location.getPath();
            String id = path.substring(path.lastIndexOf('/') + 1);
            try {
                return UUID.fromString(id);
            } catch (IllegalArgumentException e) {
                log.error("Keycloak returned an invalid user ID", e);
                throw KeycloakExceptionStrategy.of(502);
            }
        } catch (WebApplicationException | ProcessingException e) {
            throw KeycloakExceptionStrategy.of(e);
        }
    }

    public void update(UUID keycloakId, UserUpdateRequest request) {
        try {
            UserRepresentation user = new UserRepresentation();
            user.setUsername(request.getUsername());
            user.setFirstName(request.getFirstName().trim());
            user.setLastName(request.getLastName().trim());
            usersResource.get(keycloakId.toString()).update(user);
        } catch (WebApplicationException | ProcessingException e) {
            throw KeycloakExceptionStrategy.of(e);
        }
    }

    public void requestEmailUpdate(UUID keycloakId) {
        try {
            usersResource.get(keycloakId.toString()).executeActionsEmail(List.of("UPDATE_EMAIL"));
        } catch (WebApplicationException | ProcessingException e) {
            throw KeycloakExceptionStrategy.of(e);
        }
    }

    public void sendVerificationEmail(UUID keycloakId) {
        try {
            UserResource userResource = usersResource.get(keycloakId.toString());
            UserRepresentation user = userResource.toRepresentation();
            if (Boolean.TRUE.equals(user.isEmailVerified())) {
                throw new UserAlreadyVerifiedException();
            }

            userResource.sendVerifyEmail();
        } catch (WebApplicationException | ProcessingException e) {
            throw KeycloakExceptionStrategy.of(e);
        }
    }

    public void delete(UUID keycloakId) {
        try {
            usersResource.get(keycloakId.toString()).remove();
        } catch (WebApplicationException | ProcessingException e) {
            throw KeycloakExceptionStrategy.of(e);
        }
    }

}
