package com.hackathon.carbon.controller;

import com.hackathon.carbon.service.AdemeClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints d'administration liés à l'intégration ADEME.
 *
 * Permet de déclencher manuellement un rafraîchissement des facteurs
 * d'émission depuis la Base Carbone ADEME (ou source équivalente).
 */
@RestController
@RequestMapping("/api/admin/ademe")
@RequiredArgsConstructor
public class AdemeAdminController {

    private final AdemeClient ademeClient;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/refresh-factors")
    public ResponseEntity<Void> refreshFactors() {
        ademeClient.refreshEmissionFactors();
        return ResponseEntity.accepted().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/refresh-materials")
    public ResponseEntity<Void> refreshMaterials() {
        ademeClient.refreshMaterials();
        return ResponseEntity.accepted().build();
    }
}

