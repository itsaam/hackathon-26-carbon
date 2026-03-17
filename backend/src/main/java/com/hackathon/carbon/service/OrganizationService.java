package com.hackathon.carbon.service;

import com.hackathon.carbon.dto.org.EmployeeDTO;
import com.hackathon.carbon.dto.org.ManagerDTO;
import com.hackathon.carbon.dto.org.UpsertEmployeeRequestDTO;
import com.hackathon.carbon.dto.org.UpsertManagerRequestDTO;
import com.hackathon.carbon.entity.Employee;
import com.hackathon.carbon.entity.Manager;
import com.hackathon.carbon.repository.EmployeeRepository;
import com.hackathon.carbon.repository.ManagerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final ManagerRepository managerRepository;
    private final EmployeeRepository employeeRepository;

    public List<ManagerDTO> listManagers() {
        return managerRepository.findAll().stream()
                .sorted(Comparator.comparing(Manager::getLastName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(this::toManagerDTO)
                .toList();
    }

    public ManagerDTO getManager(Long id) {
        Manager manager = managerRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Manager introuvable"));
        return toManagerDTO(manager);
    }

    @Transactional
    public ManagerDTO createManager(UpsertManagerRequestDTO dto) {
        try {
            Manager manager = Manager.builder()
                    .firstName(dto.firstName().trim())
                    .lastName(dto.lastName().trim())
                    .email(dto.email().trim().toLowerCase())
                    .build();
            return toManagerDTO(managerRepository.save(manager));
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Email manager déjà utilisé");
        }
    }

    @Transactional
    public ManagerDTO updateManager(Long id, UpsertManagerRequestDTO dto) {
        Manager manager = managerRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Manager introuvable"));
        manager.setFirstName(dto.firstName().trim());
        manager.setLastName(dto.lastName().trim());
        manager.setEmail(dto.email().trim().toLowerCase());
        try {
            return toManagerDTO(managerRepository.save(manager));
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Email manager déjà utilisé");
        }
    }

    @Transactional
    public void deleteManager(Long id) {
        if (!managerRepository.existsById(id)) {
            throw new EntityNotFoundException("Manager introuvable");
        }
        managerRepository.deleteById(id);
    }

    public List<EmployeeDTO> listEmployees(Long managerId) {
        if (managerId == null) {
            return employeeRepository.findAll().stream().map(this::toEmployeeDTO).toList();
        }
        return employeeRepository.findByManagerId(managerId).stream().map(this::toEmployeeDTO).toList();
    }

    @Transactional
    public EmployeeDTO createEmployee(UpsertEmployeeRequestDTO dto) {
        Manager manager = managerRepository.findById(dto.managerId()).orElseThrow(() -> new EntityNotFoundException("Manager introuvable"));
        try {
            Employee employee = Employee.builder()
                    .manager(manager)
                    .firstName(dto.firstName().trim())
                    .lastName(dto.lastName().trim())
                    .email(dto.email().trim().toLowerCase())
                    .build();
            return toEmployeeDTO(employeeRepository.save(employee));
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Email employé déjà utilisé");
        }
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, UpsertEmployeeRequestDTO dto) {
        Employee employee = employeeRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Employé introuvable"));
        Manager manager = managerRepository.findById(dto.managerId()).orElseThrow(() -> new EntityNotFoundException("Manager introuvable"));
        employee.setManager(manager);
        employee.setFirstName(dto.firstName().trim());
        employee.setLastName(dto.lastName().trim());
        employee.setEmail(dto.email().trim().toLowerCase());
        try {
            return toEmployeeDTO(employeeRepository.save(employee));
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Email employé déjà utilisé");
        }
    }

    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new EntityNotFoundException("Employé introuvable");
        }
        employeeRepository.deleteById(id);
    }

    private ManagerDTO toManagerDTO(Manager m) {
        List<EmployeeDTO> employees = (m.getEmployees() == null ? List.<Employee>of() : m.getEmployees()).stream()
                .sorted(Comparator.comparing(Employee::getLastName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(this::toEmployeeDTO)
                .toList();
        return ManagerDTO.builder()
                .id(m.getId())
                .firstName(m.getFirstName())
                .lastName(m.getLastName())
                .email(m.getEmail())
                .employees(employees)
                .build();
    }

    private EmployeeDTO toEmployeeDTO(Employee e) {
        return EmployeeDTO.builder()
                .id(e.getId())
                .managerId(e.getManager() != null ? e.getManager().getId() : null)
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .email(e.getEmail())
                .build();
    }
}

