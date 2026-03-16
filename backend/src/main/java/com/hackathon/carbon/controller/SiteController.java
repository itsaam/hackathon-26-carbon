package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.SiteRequestDTO;
import com.hackathon.carbon.dto.SiteResponseDTO;
import com.hackathon.carbon.service.SiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @PostMapping
    public ResponseEntity<SiteResponseDTO> createSite(@Valid @RequestBody SiteRequestDTO dto) {
        SiteResponseDTO response = siteService.createSite(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SiteResponseDTO>> getAllSites() {
        List<SiteResponseDTO> sites = siteService.getAllSites();
        return ResponseEntity.ok(sites);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteResponseDTO> getSiteById(@PathVariable Long id) {
        SiteResponseDTO site = siteService.getSiteById(id);
        return ResponseEntity.ok(site);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteResponseDTO> updateSite(
            @PathVariable Long id,
            @Valid @RequestBody SiteRequestDTO dto) {
        SiteResponseDTO response = siteService.updateSite(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id) {
        siteService.deleteSite(id);
        return ResponseEntity.noContent().build();
    }
}
