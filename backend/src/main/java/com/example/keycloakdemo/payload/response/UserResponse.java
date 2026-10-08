package com.example.keycloakdemo.payload.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private UUID keycloakId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
