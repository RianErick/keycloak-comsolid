package com.example.keycloakdemo.repository;

import com.example.keycloakdemo.model.User;
import com.example.keycloakdemo.payload.query.UserQuery;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {

    @Query("""
        SELECT u FROM User u
        WHERE (:#{#query.username} IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :#{#query.username}, '%')))
          AND (:#{#query.email} IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :#{#query.email}, '%')))
          AND (:#{#query.firstName} IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :#{#query.firstName}, '%')))
          AND (:#{#query.lastName} IS NULL OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :#{#query.lastName}, '%')))
          AND (:#{#query.createdAfter} IS NULL OR u.createdAt >= :#{#query.createdAfter == null ? null : #query.createdAfter.atStartOfDay()})
          AND (:#{#query.createdBefore} IS NULL OR u.createdAt < :#{#query.createdBefore == null ? null : #query.createdBefore.plusDays(1).atStartOfDay()})
        """)
    Page<User> search(@Param("query") UserQuery query, Pageable pageable);

    Optional<User> findByKeycloakId(UUID keycloakId);
    Optional<User> findByUsername(String username);

    @Query("""
        SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END
        FROM User u
        WHERE (u.username = :username OR (:email IS NOT NULL AND u.email = :email))
          AND (:excludedId IS NULL OR u.id <> :excludedId)
        """)
    boolean existsConflict(
        @Param("username") String username,
        @Param("email") String email,
        @Param("excludedId") UUID excludedId
    );
}
