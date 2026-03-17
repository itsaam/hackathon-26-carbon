package com.hackathon.carbon.dto.org;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpsertManagerRequestDTO(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email
) {
}

