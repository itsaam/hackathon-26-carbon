package com.hackathon.carbon.controller;

import com.hackathon.carbon.entity.EnergyFactor;
import com.hackathon.carbon.repository.EnergyFactorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/energy-factors")
@RequiredArgsConstructor
public class EnergyFactorController {

    private final EnergyFactorRepository energyFactorRepository;

    @GetMapping
    public ResponseEntity<List<EnergyFactor>> getAll() {
        return ResponseEntity.ok(energyFactorRepository.findAll());
    }

    @PostMapping("/admin")
    public ResponseEntity<EnergyFactor> create(@RequestBody EnergyFactor factor) {
        return ResponseEntity.ok(energyFactorRepository.save(factor));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<EnergyFactor> update(@PathVariable Long id, @RequestBody EnergyFactor factor) {
        EnergyFactor existing = energyFactorRepository.findById(id).orElseThrow();
        existing.setEnergyType(factor.getEnergyType());
        existing.setEmissionFactor(factor.getEmissionFactor());
        existing.setCountry(factor.getCountry());
        existing.setRegion(factor.getRegion());
        existing.setSource(factor.getSource());
        existing.setYear(factor.getYear());
        existing.setGwpPerKwh(factor.getGwpPerKwh());
        existing.setDataSourceUrl(factor.getDataSourceUrl());
        return ResponseEntity.ok(energyFactorRepository.save(existing));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        energyFactorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

