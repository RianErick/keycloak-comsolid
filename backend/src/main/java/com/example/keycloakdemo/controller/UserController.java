package com.example.keycloakdemo.controller;

import com.example.keycloakdemo.controller.docs.UserControllerDocs;
import com.example.keycloakdemo.exception.UserNotFoundException;
import com.example.keycloakdemo.payload.query.UserQuery;
import com.example.keycloakdemo.payload.query.page.ApplicationPage;
import com.example.keycloakdemo.payload.request.UserRegisterRequest;
import com.example.keycloakdemo.payload.request.UserUpdateRequest;
import com.example.keycloakdemo.payload.response.UserResponse;
import com.example.keycloakdemo.security.annotation.PreAuthorizeUser;
import com.example.keycloakdemo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/users")
public class UserController implements UserControllerDocs {

    private final UserService userService;

    @Override
    @GetMapping
    public ResponseEntity<ApplicationPage<UserResponse>> search(@Valid @ParameterObject UserQuery query) {
        return ResponseEntity.ok(userService.search(query));
    }

    @Override
    @GetMapping("/{username}")
    public UserResponse find(@PathVariable String username) {
        return userService.find(username).orElseThrow(UserNotFoundException::new);
    }

    @Override
    @PreAuthorizeUser
    @GetMapping("/me")
    public UserResponse findSelf() {
        return userService.findSelf().orElseThrow(UserNotFoundException::new);
    }

    @Override
    @PostMapping
    public UserResponse register(@RequestBody @Valid UserRegisterRequest request) {
        return userService.register(request);
    }

    @Override
    @PreAuthorizeUser
    @PutMapping("/{username}")
    public ResponseEntity<Void> update(@PathVariable String username, @RequestBody @Valid UserUpdateRequest request) {
        userService.update(username, request);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PreAuthorizeUser
    @PatchMapping("/{username}/email")
    public ResponseEntity<Void> requestEmailUpdate(@PathVariable String username) {
        userService.requestEmailUpdate(username);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PreAuthorizeUser
    @PatchMapping("/{username}/email/verifications")
    public ResponseEntity<Void> resetVerificationEmail(@PathVariable String username) {
        userService.resetVerificationEmail(username);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PreAuthorizeUser
    @DeleteMapping("/{username}")
    public ResponseEntity<Void> delete(@PathVariable String username) {
        userService.delete(username);
        return ResponseEntity.noContent().build();
    }
}
