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
import java.util.Locale;
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
        ExploitationEmissions exploitation = calculateExploitationEmissions(site, year);
        double exploitationCo2Kg = exploitation.totalCo2Kg();
        double totalCo2Kg = constructionCo2Kg + exploitationCo2Kg;

        double scope1Co2Kg = exploitation.gasCo2Kg() + exploitation.fuelOilCo2Kg();
        double scope2Co2Kg = exploitation.electricityCo2Kg() + exploitation.districtHeatingCo2Kg();
        double scope3Co2Kg = constructionCo2Kg;

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
                .scope1Co2Kg(scope1Co2Kg)
                .scope2Co2Kg(scope2Co2Kg)
                .scope3Co2Kg(scope3Co2Kg)
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
        ExploitationEmissions exploitation = calculateExploitationEmissions(site, year);
        double exploitationCo2Kg = exploitation.totalCo2Kg();
        double totalCo2Kg = constructionCo2Kg + exploitationCo2Kg;

        double scope1Co2Kg = exploitation.gasCo2Kg() + exploitation.fuelOilCo2Kg();
        double scope2Co2Kg = exploitation.electricityCo2Kg() + exploitation.districtHeatingCo2Kg();
        double scope3Co2Kg = constructionCo2Kg;

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
                .scope1Co2Kg(scope1Co2Kg)
                .scope2Co2Kg(scope2Co2Kg)
                .scope3Co2Kg(scope3Co2Kg)
                .buildingStructureCo2Kg(constructionCo2Kg)
                .energyUseCo2Kg(exploitationCo2Kg)
                .calculationVersion("v1.0-simple-factors")
                .factorsSource("ADEME / valeurs par défaut")
                .comment("Scénario what-if non enregistré")
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * CDC : CO₂_construction = Σ (quantité_tonnes × facteur_kgCO₂e/tonne).
     * Unités supportées (via SiteMaterial.unit) : tonne/t, kg, m3 (si densité connue).
     * Material.emissionFactor est en kgCO₂e/tonne (Base Carbone), et/ou Material.gwpPerKg en kgCO₂e/kg.
     */
    private double calculateConstructionEmissions(Site site) {
        List<SiteMaterial> siteMaterials = siteMaterialRepository.findBySiteId(site.getId());

        return siteMaterials.stream()
                .mapToDouble(sm -> {
                    Material material = sm.getMaterial();
                    double quantity = sm.getQuantity() != null ? sm.getQuantity() : 0.0;
                    if (quantity <= 0.0 || material == null) {
                        return 0.0;
                    }

                    String unit = normalizeUnit(sm.getUnit(), material.getUnit());

                    // 1) Prefer direct kg-based factors if available
                    if (material.getGwpPerKg() != null) {
                        Double qtyKg = toKg(quantity, unit, material);
                        return qtyKg != null ? qtyKg * material.getGwpPerKg() : 0.0;
                    }

                    // 2) Fallback to Base Carbone style (kgCO2e/tonne)
                    if (material.getEmissionFactor() != null) {
                        Double qtyTonnes = toTonnes(quantity, unit, material);
                        return qtyTonnes != null ? qtyTonnes * material.getEmissionFactor() : 0.0;
                    }

                    return 0.0;
                })
                .sum();
    }

    private ExploitationEmissions calculateExploitationEmissions(Site site, int year) {
        List<EnergyFactor> factors = energyFactorRepository.findByYear(year);
        if (factors == null || factors.isEmpty()) {
            factors = energyFactorRepository.findTopByOrderByYearDesc()
                    .map(List::of)
                    .orElse(List.of());
        }

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

        // Renouvelable : on diminue la part d'électricité réseau (évite un delta uniquement sur le total)
        double netElectricityKwh = electricityKwh;
        Double renewableProductionKwh = site.getRenewableProductionKwh();
        Double selfConsumptionRate = site.getRenewableSelfConsumptionRate();
        if (renewableProductionKwh != null && selfConsumptionRate != null) {
            double avoidedKwh = renewableProductionKwh * selfConsumptionRate;
            netElectricityKwh = Math.max(electricityKwh - avoidedKwh, 0.0);
        }

        double electricityCo2 = netElectricityKwh * electricityFactor;
        double gasCo2 = gasKwh * gasFactor;
        double fuelOilCo2 = fuelOilKwh * fuelOilFactor;
        double districtHeatingCo2 = districtHeatingKwh * districtHeatingFactor;

        double total = electricityCo2 + gasCo2 + fuelOilCo2 + districtHeatingCo2;

        double totalNonNegative = Math.max(total, 0.0);

        return new ExploitationEmissions(
                totalNonNegative,
                electricityCo2,
                gasCo2,
                fuelOilCo2,
                districtHeatingCo2
        );
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

    private String normalizeUnit(String siteMaterialUnit, String materialUnit) {
        String u = siteMaterialUnit != null ? siteMaterialUnit : materialUnit;
        if (u == null) return "tonne";
        u = u.trim().toLowerCase(Locale.ROOT);
        if (u.equals("t") || u.equals("ton") || u.equals("tons")) return "tonne";
        if (u.equals("tonnes")) return "tonne";
        if (u.equals("kgs")) return "kg";
        if (u.equals("m^3")) return "m3";
        return u;
    }

    private Double toTonnes(double quantity, String unit, Material material) {
        return switch (unit) {
            case "tonne" -> quantity;
            case "kg" -> quantity / 1000.0;
            case "m3" -> {
                if (material != null && material.getDensity() != null && material.getDensity() > 0) {
                    yield (quantity * material.getDensity()) / 1000.0;
                }
                yield null;
            }
            default -> null;
        };
    }

    private Double toKg(double quantity, String unit, Material material) {
        return switch (unit) {
            case "kg" -> quantity;
            case "tonne" -> quantity * 1000.0;
            case "m3" -> {
                if (material != null && material.getDensity() != null && material.getDensity() > 0) {
                    yield quantity * material.getDensity();
                }
                yield null;
            }
            default -> null;
        };
    }

    private record ExploitationEmissions(
            double totalCo2Kg,
            double electricityCo2Kg,
            double gasCo2Kg,
            double fuelOilCo2Kg,
            double districtHeatingCo2Kg
    ) {
    }
}
