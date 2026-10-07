package com.example.keycloakdemo.user;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserProfileRepository extends JpaRepository<AppUserProfile, UUID> {

    Optional<AppUserProfile> findByKeycloakUserId(UUID keycloakUserId);

    Optional<AppUserProfile> findByUsername(String username);

    boolean existsByUsername(String username);
}
