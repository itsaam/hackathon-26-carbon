package com.hackathon.carbon.dto.org;

import lombok.Builder;

@Builder
public record EmployeeDTO(
        Long id,
        Long managerId,
        String firstName,
        String lastName,
        String email
) {
}

