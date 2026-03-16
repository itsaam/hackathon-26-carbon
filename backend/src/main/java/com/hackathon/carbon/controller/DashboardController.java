package com.hackathon.carbon.controller;

import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final SiteRepository siteRepository;
    private final CarbonResultRepository carbonResultRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        long nbSites = siteRepository.count();
        List<CarbonResult> results = carbonResultRepository.findAll();
        
        double totalCo2Kg = results.stream()
                .mapToDouble(r -> r.getTotalCo2Kg() != null ? r.getTotalCo2Kg() : 0.0)
                .sum();
        
        double avgCo2PerM2 = results.stream()
                .filter(r -> r.getCo2PerM2() != null)
                .mapToDouble(CarbonResult::getCo2PerM2)
                .average()
                .orElse(0.0);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("nbSites", nbSites);
        summary.put("totalCo2Kg", totalCo2Kg);
        summary.put("avgCo2PerM2", avgCo2PerM2);
        
        return ResponseEntity.ok(summary);
    }
}
