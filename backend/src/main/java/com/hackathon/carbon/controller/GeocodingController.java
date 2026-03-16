package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.GeocodeResultDTO;
import com.hackathon.carbon.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/geocode")
@RequiredArgsConstructor
public class GeocodingController {

    private final GeocodingService geocodingService;

    @GetMapping("/search")
    public ResponseEntity<List<GeocodeResultDTO>> search(@RequestParam("q") String query) {
        String q = query == null ? "" : query.trim();
        if (q.length() < 3) {
            return ResponseEntity.badRequest().build();
        }
        List<GeocodeResultDTO> results = geocodingService.search(q);
        return ResponseEntity.ok(results);
    }
}

