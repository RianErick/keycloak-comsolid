package com.example.keycloakdemo.keycloak;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import com.example.keycloakdemo.api.RegisterRequest;
import com.example.keycloakdemo.config.KeycloakAdminProperties;

@Service
public class KeycloakRegistrationService {

    private final KeycloakAdminProperties props;
    private final RestClient restClient;

    public KeycloakRegistrationService(KeycloakAdminProperties props) {
        this.props = props;
        this.restClient = RestClient.builder().build();
    }

    public UUID register(RegisterRequest request) {
        String token = adminAccessToken();
        String userId = createUser(token, request);
        assignRealmRole(token, userId, "user");
        return UUID.fromString(userId);
    }

    public Optional<UUID> findKeycloakUserId(String username) {
        String token = adminAccessToken();
        List<?> users = restClient.get()
            .uri(props.serverUrl() + "/admin/realms/" + props.realm() + "/users?username={username}&exact=true", username)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .body(List.class);

        if (users == null || users.isEmpty()) {
            return Optional.empty();
        }
        Object first = users.get(0);
        if (!(first instanceof Map<?, ?> map) || map.get("id") == null) {
            return Optional.empty();
        }
        return Optional.of(UUID.fromString(map.get("id").toString()));
    }

    private String adminAccessToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", props.clientId());
        form.add("username", props.username());
        form.add("password", props.password());

        Map<?, ?> body = restClient.post()
            .uri(props.serverUrl() + "/realms/" + props.adminRealm() + "/protocol/openid-connect/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(Map.class);

        if (body == null || body.get("access_token") == null) {
            throw new IllegalStateException("Não foi possível autenticar no Keycloak Admin.");
        }
        return body.get("access_token").toString();
    }

    private String createUser(String token, RegisterRequest request) {
        NameParts name = splitName(request.name());
        Map<String, Object> payload = Map.of(
            "username", request.username(),
            "firstName", name.firstName(),
            "lastName", name.lastName(),
            "email", request.username() + "@demo.local",
            "emailVerified", true,
            "enabled", true,
            "requiredActions", List.of("CONFIGURE_TOTP"),
            "credentials", List.of(Map.of(
                "type", "password",
                "value", request.password(),
                "temporary", false
            ))
        );

        try {
            return restClient.post()
                .uri(props.serverUrl() + "/admin/realms/" + props.realm() + "/users")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + token)
                .body(payload)
                .exchange((req, res) -> {
                    if (res.getStatusCode().value() == HttpStatus.CONFLICT.value()) {
                        throw new UsernameTakenException();
                    }
                    if (res.getStatusCode().isError()) {
                        throw new IllegalStateException("Keycloak rejeitou o cadastro (HTTP " + res.getStatusCode().value() + ").");
                    }
                    URI location = res.getHeaders().getLocation();
                    if (location == null) {
                        throw new IllegalStateException("Keycloak não retornou o id do usuário.");
                    }
                    String path = location.getPath();
                    return path.substring(path.lastIndexOf('/') + 1);
                });
        } catch (HttpClientErrorException.Conflict ex) {
            throw new UsernameTakenException();
        }
    }

    private void assignRealmRole(String token, String userId, String roleName) {
        Map<?, ?> role = restClient.get()
            .uri(props.serverUrl() + "/admin/realms/" + props.realm() + "/roles/" + roleName)
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .body(Map.class);

        if (role == null) {
            throw new IllegalStateException("Role " + roleName + " não encontrada no realm.");
        }

        restClient.post()
            .uri(props.serverUrl() + "/admin/realms/" + props.realm() + "/users/" + userId + "/role-mappings/realm")
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + token)
            .body(List.of(role))
            .retrieve()
            .toBodilessEntity();
    }

    private static NameParts splitName(String name) {
        String trimmed = name.trim();
        int space = trimmed.indexOf(' ');
        if (space <= 0) {
            return new NameParts(trimmed, ".");
        }
        return new NameParts(trimmed.substring(0, space), trimmed.substring(space + 1).trim());
    }

    private record NameParts(String firstName, String lastName) {}

    public static class UsernameTakenException extends RuntimeException {
        public UsernameTakenException() {
            super("Este usuário já existe.");
        }
    }
}
