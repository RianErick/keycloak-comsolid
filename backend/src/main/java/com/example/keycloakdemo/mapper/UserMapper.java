package com.example.keycloakdemo.mapper;

import com.example.keycloakdemo.model.User;
import com.example.keycloakdemo.payload.request.UserUpdateRequest;
import com.example.keycloakdemo.payload.response.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

  public UserResponse toResponse(User user) {
    if (user == null) {
      return null;
    }

    return UserResponse.builder()
        .id(user.getId())
        .keycloakId(user.getKeycloakId())
        .username(user.getUsername())
        .email(user.getEmail())
        .firstName(user.getFirstName())
        .lastName(user.getLastName())
        .description(user.getDescription())
        .createdAt(user.getCreatedAt())
        .updatedAt(user.getUpdatedAt())
        .build();
  }

  public void update(User user, UserUpdateRequest request) {
    user.setUsername(request.getUsername());
    user.setFirstName(request.getFirstName().trim());
    user.setLastName(request.getLastName().trim());
    user.setDescription(request.getDescription());
  }
}
