package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.MaterialDTO;
import com.hackathon.carbon.entity.Material;
import com.hackathon.carbon.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialRepository materialRepository;

    @GetMapping
    public ResponseEntity<List<MaterialDTO>> getAllMaterials() {
        List<MaterialDTO> materials = materialRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(materials);
    }

    @PostMapping("/admin")
    public ResponseEntity<MaterialDTO> createMaterial(@RequestBody MaterialDTO dto) {
        Material material = Material.builder()
                .name(dto.getName())
                .emissionFactor(dto.getEmissionFactor())
                .unit(dto.getUnit())
                .source(dto.getSource())
                .category(dto.getCategory())
                .subCategory(dto.getSubCategory())
                .density(dto.getDensity())
                .lifeCycleStageCovered(dto.getLifeCycleStageCovered())
                .gwpPerKg(dto.getGwpPerKg())
                .referenceYear(dto.getReferenceYear())
                .dataSourceUrl(dto.getDataSourceUrl())
                .build();
        material = materialRepository.save(material);
        return ResponseEntity.ok(toDTO(material));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<MaterialDTO> updateMaterial(@PathVariable Long id, @RequestBody MaterialDTO dto) {
        Material material = materialRepository.findById(id).orElseThrow();
        material.setName(dto.getName());
        material.setEmissionFactor(dto.getEmissionFactor());
        material.setUnit(dto.getUnit());
        material.setSource(dto.getSource());
        material.setCategory(dto.getCategory());
        material.setSubCategory(dto.getSubCategory());
        material.setDensity(dto.getDensity());
        material.setLifeCycleStageCovered(dto.getLifeCycleStageCovered());
        material.setGwpPerKg(dto.getGwpPerKg());
        material.setReferenceYear(dto.getReferenceYear());
        material.setDataSourceUrl(dto.getDataSourceUrl());
        material = materialRepository.save(material);
        return ResponseEntity.ok(toDTO(material));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private MaterialDTO toDTO(Material material) {
        MaterialDTO dto = new MaterialDTO();
        dto.setId(material.getId());
        dto.setName(material.getName());
        dto.setEmissionFactor(material.getEmissionFactor());
        dto.setUnit(material.getUnit());
        dto.setSource(material.getSource());
        dto.setCategory(material.getCategory());
        dto.setSubCategory(material.getSubCategory());
        dto.setDensity(material.getDensity());
        dto.setLifeCycleStageCovered(material.getLifeCycleStageCovered());
        dto.setGwpPerKg(material.getGwpPerKg());
        dto.setReferenceYear(material.getReferenceYear());
        dto.setDataSourceUrl(material.getDataSourceUrl());
        return dto;
    }
}
