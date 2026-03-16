package com.hackathon.carbon.service;

import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.entity.EnergyFactor;
import com.hackathon.carbon.entity.Material;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.entity.SiteMaterial;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.EnergyFactorRepository;
import com.hackathon.carbon.repository.SiteMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarbonCalculationService {

    private final CarbonResultRepository carbonResultRepository;
    private final SiteMaterialRepository siteMaterialRepository;
    private final EnergyFactorRepository energyFactorRepository;

    /**
     * Calcule et persiste un nouveau CarbonResult pour un site donné
     * en se basant sur les matériaux associés et les consommations énergétiques.
     */
    @Transactional
    public CarbonResult calculateAndSaveForSite(Site site, Integer inventoryYear) {
        LocalDate nowDate = LocalDate.now();
        int year = inventoryYear != null ? inventoryYear : nowDate.getYear();

        double constructionCo2Kg = calculateConstructionEmissions(site);
        double exploitationCo2Kg = calculateExploitationEmissions(site, year);
        double totalCo2Kg = constructionCo2Kg + exploitationCo2Kg;

        Double co2PerM2 = null;
        if (site.getSurfaceM2() != null && site.getSurfaceM2() > 0) {
            co2PerM2 = totalCo2Kg / site.getSurfaceM2();
        }

        Double co2PerEmployee = null;
        if (site.getEmployeeCount() != null && site.getEmployeeCount() > 0) {
            co2PerEmployee = totalCo2Kg / site.getEmployeeCount();
        }

        CarbonResult result = CarbonResult.builder()
                .site(site)
                .constructionCo2Kg(constructionCo2Kg)
                .exploitationCo2Kg(exploitationCo2Kg)
                .totalCo2Kg(totalCo2Kg)
                .co2PerM2(co2PerM2)
                .co2PerEmployee(co2PerEmployee)
                .periodStart(LocalDate.of(year, 1, 1))
                .periodEnd(LocalDate.of(year, 12, 31))
                .year(year)
                .buildingStructureCo2Kg(constructionCo2Kg)
                .energyUseCo2Kg(exploitationCo2Kg)
                .calculationVersion("v1.0-simple-factors")
                .factorsSource("ADEME / valeurs par défaut")
                .comment("Calcul automatique basé sur les données du site et les facteurs d'émission enregistrés")
                .calculatedAt(LocalDateTime.now())
                .build();

        return carbonResultRepository.save(result);
    }

    /**
     * Calcule un résultat théorique sans le persister (scénario \"what-if\").
     */
    public CarbonResult estimateForSite(Site site, Integer inventoryYear) {
        LocalDate nowDate = LocalDate.now();
        int year = inventoryYear != null ? inventoryYear : nowDate.getYear();

        double constructionCo2Kg = calculateConstructionEmissions(site);
        double exploitationCo2Kg = calculateExploitationEmissions(site, year);
        double totalCo2Kg = constructionCo2Kg + exploitationCo2Kg;

        Double co2PerM2 = null;
        if (site.getSurfaceM2() != null && site.getSurfaceM2() > 0) {
            co2PerM2 = totalCo2Kg / site.getSurfaceM2();
        }

        Double co2PerEmployee = null;
        if (site.getEmployeeCount() != null && site.getEmployeeCount() > 0) {
            co2PerEmployee = totalCo2Kg / site.getEmployeeCount();
        }

        return CarbonResult.builder()
                .site(site)
                .constructionCo2Kg(constructionCo2Kg)
                .exploitationCo2Kg(exploitationCo2Kg)
                .totalCo2Kg(totalCo2Kg)
                .co2PerM2(co2PerM2)
                .co2PerEmployee(co2PerEmployee)
                .periodStart(LocalDate.of(year, 1, 1))
                .periodEnd(LocalDate.of(year, 12, 31))
                .year(year)
                .buildingStructureCo2Kg(constructionCo2Kg)
                .energyUseCo2Kg(exploitationCo2Kg)
                .calculationVersion("v1.0-simple-factors")
                .factorsSource("ADEME / valeurs par défaut")
                .comment("Scénario what-if non enregistré")
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    private double calculateConstructionEmissions(Site site) {
        List<SiteMaterial> siteMaterials = siteMaterialRepository.findBySiteId(site.getId());

        return siteMaterials.stream()
                .mapToDouble(sm -> {
                    Material material = sm.getMaterial();
                    double quantityKg = sm.getQuantity() != null ? sm.getQuantity() : 0.0;
                    Double gwpPerKg = material.getGwpPerKg();
                    if (gwpPerKg == null && material.getEmissionFactor() != null) {
                        // Si le facteur est fourni en kgCO2e/tonne, le convertir en kgCO2e/kg
                        gwpPerKg = material.getEmissionFactor() / 1000.0;
                    }
                    if (gwpPerKg == null) {
                        return 0.0;
                    }
                    return quantityKg * gwpPerKg;
                })
                .sum();
    }

    private double calculateExploitationEmissions(Site site, int year) {
        List<EnergyFactor> factors = energyFactorRepository.findByYear(year);

        double electricityFactor = findFactorForEnergyType(factors, "electricity");
        double gasFactor = findFactorForEnergyType(factors, "gas");
        double fuelOilFactor = findFactorForEnergyType(factors, "fuel_oil");
        double districtHeatingFactor = findFactorForEnergyType(factors, "district_heating");

        double electricityKwh = defaultZero(site.getElectricityConsumptionKwh() != null
                ? site.getElectricityConsumptionKwh()
                : site.getEnergyConsumptionKwh());
        double gasKwh = defaultZero(site.getGasConsumptionKwh());
        double fuelOilKwh = defaultZero(site.getFuelOilConsumptionKwh());
        double districtHeatingKwh = defaultZero(site.getDistrictHeatingConsumptionKwh());

        double electricityCo2 = electricityKwh * electricityFactor;
        double gasCo2 = gasKwh * gasFactor;
        double fuelOilCo2 = fuelOilKwh * fuelOilFactor;
        double districtHeatingCo2 = districtHeatingKwh * districtHeatingFactor;

        double total = electricityCo2 + gasCo2 + fuelOilCo2 + districtHeatingCo2;

        Double renewableProductionKwh = site.getRenewableProductionKwh();
        Double selfConsumptionRate = site.getRenewableSelfConsumptionRate();
        if (renewableProductionKwh != null && selfConsumptionRate != null) {
            double avoidedKwh = renewableProductionKwh * selfConsumptionRate;
            total -= avoidedKwh * electricityFactor;
        }

        return Math.max(total, 0.0);
    }

    private double findFactorForEnergyType(List<EnergyFactor> factors, String energyType) {
        return factors.stream()
                .filter(f -> energyType.equalsIgnoreCase(f.getEnergyType()))
                .findFirst()
                .map(f -> {
                    if (f.getGwpPerKwh() != null) {
                        return f.getGwpPerKwh();
                    }
                    if (f.getEmissionFactor() != null) {
                        // Si le facteur est déjà en kgCO2e/kWh, l'utiliser tel quel
                        return f.getEmissionFactor();
                    }
                    return 0.0;
                })
                .orElse(0.0);
    }

    private double defaultZero(Double value) {
        return value != null ? value : 0.0;
    }
}
