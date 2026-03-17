package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.org.EmployeeDTO;
import com.hackathon.carbon.dto.org.ManagerDTO;
import com.hackathon.carbon.dto.org.UpsertEmployeeRequestDTO;
import com.hackathon.carbon.dto.org.UpsertManagerRequestDTO;
import com.hackathon.carbon.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/org")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/managers")
    public ResponseEntity<List<ManagerDTO>> listManagers() {
        return ResponseEntity.ok(organizationService.listManagers());
    }

    @PostMapping("/managers")
    public ResponseEntity<ManagerDTO> createManager(@Valid @RequestBody UpsertManagerRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(organizationService.createManager(dto));
    }

    @PutMapping("/managers/{id}")
    public ResponseEntity<ManagerDTO> updateManager(@PathVariable Long id, @Valid @RequestBody UpsertManagerRequestDTO dto) {
        return ResponseEntity.ok(organizationService.updateManager(id, dto));
    }

    @DeleteMapping("/managers/{id}")
    public ResponseEntity<Void> deleteManager(@PathVariable Long id) {
        organizationService.deleteManager(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeDTO>> listEmployees(@RequestParam(required = false) Long managerId) {
        return ResponseEntity.ok(organizationService.listEmployees(managerId));
    }

    @PostMapping("/employees")
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody UpsertEmployeeRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(organizationService.createEmployee(dto));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<EmployeeDTO> updateEmployee(@PathVariable Long id, @Valid @RequestBody UpsertEmployeeRequestDTO dto) {
        return ResponseEntity.ok(organizationService.updateEmployee(id, dto));
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        organizationService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}

