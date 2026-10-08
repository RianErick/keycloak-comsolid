package com.example.keycloakdemo.service;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import com.example.keycloakdemo.exception.UserConflictException;
import com.example.keycloakdemo.exception.UserNotFoundException;
import com.example.keycloakdemo.mapper.UserMapper;
import com.example.keycloakdemo.model.User;
import com.example.keycloakdemo.payload.query.UserQuery;
import com.example.keycloakdemo.payload.query.page.ApplicationPage;
import com.example.keycloakdemo.payload.request.UserRegisterRequest;
import com.example.keycloakdemo.payload.request.UserUpdateRequest;
import com.example.keycloakdemo.payload.response.UserResponse;
import com.example.keycloakdemo.repository.UserRepository;
import com.example.keycloakdemo.security.AuthenticationHelper;
import com.example.keycloakdemo.security.AuthorizationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    @Transactional(readOnly = true)
    public ApplicationPage<UserResponse> search(UserQuery query) {
        return new ApplicationPage<>(
            userRepository.search(query, query.getPageable()).map(userMapper::toResponse)
        );
    }

    @Transactional(readOnly = true)
    public Optional<UserResponse> find(String username) {
        return userRepository.findByUsername(username).map(userMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Optional<UserResponse> findSelf() {
        return userRepository
            .findByKeycloakId(AuthenticationHelper.getKeycloakId())
            .map(userMapper::toResponse);
    }

    @Transactional
    public UserResponse register(UserRegisterRequest request) {
        if (userRepository.existsConflict(request.getUsername(), request.getEmail(), null)) {
            throw new UserConflictException();
        }

        UUID keycloakId = keycloakService.register(request);
        User user = Objects.requireNonNull(User.builder()
            .keycloakId(keycloakId)
            .username(request.getUsername())
            .email(request.getEmail())
            .firstName(request.getFirstName().trim())
            .lastName(request.getLastName().trim())
            .build());

        try {
            user = userRepository.saveAndFlush(user);
            return userMapper.toResponse(user);
        } catch (RuntimeException saveException) {
            try {
                keycloakService.delete(keycloakId);
            } catch (RuntimeException cleanupException) {
                log.error(
                    "Could not remove Keycloak user {} after local registration failed",
                    keycloakId,
                    cleanupException
                );
            }

            throw saveException;
        }
    }

    @Transactional
    public void update(String username, UserUpdateRequest request) {
        User user = userRepository.findByUsername(username).orElseThrow(UserNotFoundException::new);
        AuthorizationHelper.validateResourceAccess(user.getKeycloakId());
        if (userRepository.existsConflict(request.getUsername(), null, user.getId())) {
            throw new UserConflictException();
        }

        userMapper.update(user, request);
        userRepository.saveAndFlush(user);
        keycloakService.update(user.getKeycloakId(), request);
    }

    @Transactional
    public void delete(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(UserNotFoundException::new);
        AuthorizationHelper.validateResourceAccess(user.getKeycloakId());
        keycloakService.delete(user.getKeycloakId());
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public void changeEmail(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(UserNotFoundException::new);
        AuthorizationHelper.validateResourceAccess(user.getKeycloakId());
        keycloakService.changeEmail(user.getKeycloakId());
    }
}
