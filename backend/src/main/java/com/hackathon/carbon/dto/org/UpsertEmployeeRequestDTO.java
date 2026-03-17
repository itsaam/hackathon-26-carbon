package com.hackathon.carbon.dto.org;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpsertEmployeeRequestDTO(
        @NotNull Long managerId,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email
) {
}

