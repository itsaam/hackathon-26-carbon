package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.CarbonResultDTO;
import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.SiteRepository;
import com.hackathon.carbon.service.CarbonCalculationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CarbonResultController {

    private final CarbonResultRepository carbonResultRepository;
    private final SiteRepository siteRepository;
    private final CarbonCalculationService carbonCalculationService;

    @GetMapping("/results")
    public ResponseEntity<List<CarbonResultDTO>> getAllResults() {
        List<CarbonResultDTO> results = carbonResultRepository.findAllByOrderByCalculatedAtDesc()
                .stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/sites/{siteId}/results")
    public ResponseEntity<List<CarbonResultDTO>> getResultsBySite(
            @PathVariable Long siteId,
            @RequestParam(value = "year", required = false) Integer year
    ) {
        return ResponseEntity.ok(getSiteResultsList(siteId, year));
    }

    /**
     * Alias CDC : GET /api/sites/{id}/history — même réponse que /api/sites/{id}/results (courbes d'évolution).
     */
    @GetMapping("/sites/{siteId}/history")
    public ResponseEntity<List<CarbonResultDTO>> getSiteHistory(
            @PathVariable Long siteId,
            @RequestParam(value = "year", required = false) Integer year
    ) {
        return ResponseEntity.ok(getSiteResultsList(siteId, year));
    }

    private List<CarbonResultDTO> getSiteResultsList(Long siteId, Integer year) {
        List<CarbonResult> raw = (year != null)
                ? carbonResultRepository.findBySiteIdAndYearOrderByCalculatedAtDesc(siteId, year)
                : carbonResultRepository.findBySiteIdOrderByCalculatedAtDesc(siteId);
        return raw.stream().map(this::toDTO).toList();
    }

    @GetMapping("/sites/{siteId}/results/summary")
    public ResponseEntity<List<Map<String, Object>>> getResultsSummaryBySite(
            @PathVariable Long siteId,
            @RequestParam(value = "year", required = false) Integer year
    ) {
        List<CarbonResult> raw = (year != null)
                ? carbonResultRepository.findBySiteIdAndYearOrderByCalculatedAtDesc(siteId, year)
                : carbonResultRepository.findBySiteIdOrderByCalculatedAtDesc(siteId);

        Map<YearMonth, List<CarbonResult>> grouped = raw.stream()
                .collect(Collectors.groupingBy(r -> {
                    var dt = r.getCalculatedAt();
                    return YearMonth.of(dt.getYear(), dt.getMonth());
                }));

        List<Map<String, Object>> summary = new ArrayList<>();
        grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    YearMonth ym = entry.getKey();
                    List<CarbonResult> list = entry.getValue();
                    double totalCo2 = list.stream()
                            .map(CarbonResult::getTotalCo2Kg)
                            .filter(v -> v != null)
                            .mapToDouble(Double::doubleValue)
                            .sum();
                    double avgCo2PerM2 = list.stream()
                            .map(CarbonResult::getCo2PerM2)
                            .filter(v -> v != null)
                            .mapToDouble(Double::doubleValue)
                            .average()
                            .orElse(0);
                    double avgCo2PerEmployee = list.stream()
                            .map(CarbonResult::getCo2PerEmployee)
                            .filter(v -> v != null)
                            .mapToDouble(Double::doubleValue)
                            .average()
                            .orElse(0);

                    summary.add(Map.of(
                            "label", ym.toString(),
                            "year", ym.getYear(),
                            "month", ym.getMonthValue(),
                            "totalCo2Kg", totalCo2,
                            "co2PerM2", avgCo2PerM2,
                            "co2PerEmployee", avgCo2PerEmployee
                    ));
                });

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/sites/{siteId}/results/latest")
    public ResponseEntity<CarbonResultDTO> getLatestResultBySite(@PathVariable Long siteId) {
        return carbonResultRepository.findFirstBySiteIdOrderByCalculatedAtDesc(siteId)
                .map(this::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/sites/{siteId}/results/calculate")
    public ResponseEntity<CarbonResultDTO> calculateForSite(
            @PathVariable Long siteId,
            @RequestBody(required = false) Map<String, Integer> body
    ) {
        int year = body != null && body.get("year") != null ? body.get("year") : java.time.LocalDate.now().getYear();

        var site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + siteId));

        var result = carbonCalculationService.calculateAndSaveForSite(site, year);
        return ResponseEntity.ok(toDTO(result));
    }

    @PostMapping("/sites/{siteId}/results/estimate")
    public ResponseEntity<CarbonResultDTO> estimateForSite(
            @PathVariable Long siteId,
            @RequestBody(required = false) Map<String, Double> body
    ) {
        var site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + siteId));

        Site scenarioSite = Site.builder()
                .id(site.getId())
                .surfaceM2(site.getSurfaceM2())
                .employeeCount(site.getEmployeeCount())
                .workstationCount(site.getWorkstationCount())
                .parkingBasement(site.getParkingBasement())
                .parkingUnderground(site.getParkingUnderground())
                .parkingOutdoor(site.getParkingOutdoor())
                .energyConsumptionKwh(site.getEnergyConsumptionKwh())
                .electricityConsumptionKwh(site.getElectricityConsumptionKwh())
                .gasConsumptionKwh(site.getGasConsumptionKwh())
                .fuelOilConsumptionKwh(site.getFuelOilConsumptionKwh())
                .districtHeatingConsumptionKwh(site.getDistrictHeatingConsumptionKwh())
                .renewableProductionKwh(site.getRenewableProductionKwh())
                .renewableSelfConsumptionRate(site.getRenewableSelfConsumptionRate())
                .build();

        if (body != null) {
            Double energyDeltaPct = body.getOrDefault("energyDeltaPercent", 0.0);
            Double renewableDeltaPct = body.getOrDefault("renewableDeltaPercent", 0.0);

            double factorEnergy = 1.0 + energyDeltaPct / 100.0;
            double factorRenewable = 1.0 + renewableDeltaPct / 100.0;

            scenarioSite.setElectricityConsumptionKwh(
                    scenarioSite.getElectricityConsumptionKwh() != null
                            ? scenarioSite.getElectricityConsumptionKwh() * factorEnergy
                            : null
            );
            scenarioSite.setGasConsumptionKwh(
                    scenarioSite.getGasConsumptionKwh() != null
                            ? scenarioSite.getGasConsumptionKwh() * factorEnergy
                            : null
            );
            scenarioSite.setFuelOilConsumptionKwh(
                    scenarioSite.getFuelOilConsumptionKwh() != null
                            ? scenarioSite.getFuelOilConsumptionKwh() * factorEnergy
                            : null
            );
            scenarioSite.setDistrictHeatingConsumptionKwh(
                    scenarioSite.getDistrictHeatingConsumptionKwh() != null
                            ? scenarioSite.getDistrictHeatingConsumptionKwh() * factorEnergy
                            : null
            );
            scenarioSite.setEnergyConsumptionKwh(
                    scenarioSite.getEnergyConsumptionKwh() != null
                            ? scenarioSite.getEnergyConsumptionKwh() * factorEnergy
                            : null
            );
            scenarioSite.setRenewableProductionKwh(
                    scenarioSite.getRenewableProductionKwh() != null
                            ? scenarioSite.getRenewableProductionKwh() * factorRenewable
                            : null
            );
        }

        var estimate = carbonCalculationService.estimateForSite(scenarioSite, null);
        return ResponseEntity.ok(toDTO(estimate));
    }

    private CarbonResultDTO toDTO(CarbonResult r) {
        return CarbonResultDTO.builder()
                .id(r.getId())
                .siteId(r.getSite() != null ? r.getSite().getId() : null)
                .constructionCo2Kg(r.getConstructionCo2Kg())
                .exploitationCo2Kg(r.getExploitationCo2Kg())
                .totalCo2Kg(r.getTotalCo2Kg())
                .co2PerM2(r.getCo2PerM2())
                .co2PerEmployee(r.getCo2PerEmployee())
                .periodStart(r.getPeriodStart())
                .periodEnd(r.getPeriodEnd())
                .year(r.getYear())
                .scope1Co2Kg(r.getScope1Co2Kg())
                .scope2Co2Kg(r.getScope2Co2Kg())
                .scope3Co2Kg(r.getScope3Co2Kg())
                .buildingStructureCo2Kg(r.getBuildingStructureCo2Kg())
                .parkingCo2Kg(r.getParkingCo2Kg())
                .energyUseCo2Kg(r.getEnergyUseCo2Kg())
                .otherCo2Kg(r.getOtherCo2Kg())
                .calculationVersion(r.getCalculationVersion())
                .factorsSource(r.getFactorsSource())
                .comment(r.getComment())
                .calculatedAt(r.getCalculatedAt())
                .build();
    }
}

