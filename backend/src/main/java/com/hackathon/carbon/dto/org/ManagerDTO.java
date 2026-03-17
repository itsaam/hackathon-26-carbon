package com.hackathon.carbon.dto.org;

import lombok.Builder;

import java.util.List;

@Builder
public record ManagerDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        List<EmployeeDTO> employees
) {
}

