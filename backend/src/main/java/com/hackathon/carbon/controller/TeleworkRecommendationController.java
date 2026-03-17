package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.weather.TeleworkRecommendationDTO;
import com.hackathon.carbon.service.TeleworkRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class TeleworkRecommendationController {

    private final TeleworkRecommendationService teleworkRecommendationService;

    @GetMapping("/telework")
    public ResponseEntity<TeleworkRecommendationDTO> telework(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String timezone
    ) {
        LocalDate parsedDate = null;
        if (date != null && !date.isBlank()) {
            parsedDate = LocalDate.parse(date);
        }
        return ResponseEntity.ok(teleworkRecommendationService.recommend(latitude, longitude, parsedDate, timezone));
    }
}

