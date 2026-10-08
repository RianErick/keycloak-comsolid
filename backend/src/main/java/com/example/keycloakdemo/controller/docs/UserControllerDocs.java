package com.example.keycloakdemo.controller.docs;

import com.example.keycloakdemo.payload.request.UserRegisterRequest;
import com.example.keycloakdemo.payload.request.UserUpdateRequest;
import com.example.keycloakdemo.payload.query.UserQuery;
import com.example.keycloakdemo.payload.query.page.ApplicationPage;
import com.example.keycloakdemo.payload.response.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;

@Tag(name = "Users", description = "User registration, search, and profile management")
public interface UserControllerDocs {

    @Operation(
        summary = "Search users (public)",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Users found",
                content = @Content(schema = @Schema(implementation = ApplicationPage.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid query parameters", content = @Content)
        }
    )
    ResponseEntity<ApplicationPage<UserResponse>> search(@Valid @ParameterObject UserQuery query);

    @Operation(
        summary = "Register a user",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(schema = @Schema(implementation = UserRegisterRequest.class))),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "User registered",
                content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid registration data", content = @Content),
            @ApiResponse(responseCode = "409", description = "Username or email already exists", content = @Content),
            @ApiResponse(responseCode = "502", description = "Keycloak request failed", content = @Content)
        })
    UserResponse register(@RequestBody @Valid UserRegisterRequest request);

    @Operation(
        summary = "Get the authenticated user's profile",
        security = @SecurityRequirement(name = "bearerAuth"),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "User profile",
                content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        })
    UserResponse findSelf();

    @Operation(
        summary = "Get a user by username (public)",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "User profile",
                content = @Content(schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
        })
    UserResponse find(@PathVariable String username);

    @Operation(
        summary = "Update a user",
        security = @SecurityRequirement(name = "bearerAuth"),
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(schema = @Schema(implementation = UserUpdateRequest.class))),
        responses = {
            @ApiResponse(responseCode = "204", description = "User updated", content = @Content),
            @ApiResponse(responseCode = "400", description = "Invalid user data", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content),
            @ApiResponse(responseCode = "409", description = "Username already exists", content = @Content)
        })
    ResponseEntity<Void> update(
        @PathVariable String username,
        @Valid @RequestBody UserUpdateRequest request
    );

    @Operation(
        summary = "Delete a user (self or admin only)",
        security = @SecurityRequirement(name = "bearerAuth"),
        responses = {
            @ApiResponse(responseCode = "204", description = "User deleted", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content),
            @ApiResponse(responseCode = "502", description = "Keycloak request failed", content = @Content)
        })
    ResponseEntity<Void> delete(@PathVariable String username);

    @Operation(
        summary = "Start the email change confirmation flow",
        security = @SecurityRequirement(name = "bearerAuth"),
        responses = {
            @ApiResponse(responseCode = "204", description = "Email change confirmation sent", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content),
            @ApiResponse(responseCode = "502", description = "Keycloak request failed", content = @Content)
        }
    )
    ResponseEntity<Void> requestEmailUpdate(@PathVariable String username);

    @Operation(
        summary = "Resend the email verification message (admin only)",
        security = @SecurityRequirement(name = "bearerAuth"),
        responses = {
            @ApiResponse(responseCode = "204", description = "Verification email sent", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content),
            @ApiResponse(responseCode = "409", description = "Email is already verified", content = @Content),
            @ApiResponse(responseCode = "502", description = "Keycloak request failed", content = @Content)
        })
    ResponseEntity<Void> resetVerificationEmail(@PathVariable String username);
}
