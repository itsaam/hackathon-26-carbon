package com.hackathon.carbon.controller;

import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.SiteRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
public class CompareController {

    private final SiteRepository siteRepository;
    private final CarbonResultRepository carbonResultRepository;

    @GetMapping("/sites")
    public ResponseEntity<List<CompareSiteDTO>> compareSites(
            @RequestParam("ids") String ids,
            @RequestParam(value = "year", required = false) Integer year
    ) {
        List<Long> siteIds = Arrays.stream(ids.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .toList();

        List<CompareSiteDTO> results = new ArrayList<>();

        for (Long siteId : siteIds) {
            var siteOpt = siteRepository.findById(siteId);
            if (siteOpt.isEmpty()) continue;

            CarbonResult result;
            if (year != null) {
                List<CarbonResult> list = carbonResultRepository.findBySiteIdAndYearOrderByCalculatedAtDesc(siteId, year);
                if (list.isEmpty()) continue;
                result = list.get(0);
            } else {
                result = carbonResultRepository.findFirstBySiteIdOrderByCalculatedAtDesc(siteId).orElse(null);
                if (result == null) continue;
            }

            double totalCo2Kg = result.getTotalCo2Kg() != null ? result.getTotalCo2Kg() : 0.0;
            Double perM2 = result.getCo2PerM2();
            Double perEmployee = result.getCo2PerEmployee();
            double construction = result.getBuildingStructureCo2Kg() != null
                    ? result.getBuildingStructureCo2Kg()
                    : (result.getConstructionCo2Kg() != null ? result.getConstructionCo2Kg() : 0.0);
            double exploitation = result.getEnergyUseCo2Kg() != null
                    ? result.getEnergyUseCo2Kg()
                    : (result.getExploitationCo2Kg() != null ? result.getExploitationCo2Kg() : 0.0);

            results.add(CompareSiteDTO.builder()
                    .siteId(siteId)
                    .siteName(siteOpt.get().getName())
                    .year(result.getYear())
                    .totalCo2Kg(totalCo2Kg)
                    .co2PerM2(perM2)
                    .co2PerEmployee(perEmployee)
                    .constructionCo2Kg(construction)
                    .exploitationCo2Kg(exploitation)
                    .build());
        }

        return ResponseEntity.ok(results);
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class CompareSiteDTO {
        private Long siteId;
        private String siteName;
        private Integer year;
        private Double totalCo2Kg;
        private Double co2PerM2;
        private Double co2PerEmployee;
        private Double constructionCo2Kg;
        private Double exploitationCo2Kg;
    }
}

