package com.example.keycloakdemo.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Informe o nome.")
    @Size(max = 120, message = "Nome muito longo.")
    String name,

    @NotBlank(message = "Informe o usuário.")
    @Size(min = 3, max = 50, message = "Usuário deve ter entre 3 e 50 caracteres.")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Usuário só pode conter letras, números, ponto, hífen e underscore.")
    String username,

    @NotBlank(message = "Informe a senha.")
    @Size(min = 8, max = 128, message = "Senha deve ter pelo menos 8 caracteres.")
    String password
) {}
