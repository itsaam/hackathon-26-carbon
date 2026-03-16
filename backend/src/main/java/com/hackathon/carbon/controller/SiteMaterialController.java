package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.SiteCompositionDTO;
import com.hackathon.carbon.entity.Material;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.entity.SiteMaterial;
import com.hackathon.carbon.repository.MaterialRepository;
import com.hackathon.carbon.repository.SiteMaterialRepository;
import com.hackathon.carbon.repository.SiteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteMaterialController {

    private final SiteRepository siteRepository;
    private final MaterialRepository materialRepository;
    private final SiteMaterialRepository siteMaterialRepository;

    @PostMapping("/{siteId}/composition")
    public ResponseEntity<Void> saveComposition(
            @PathVariable Long siteId,
            @RequestBody SiteCompositionDTO dto
    ) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + siteId));

        // Supprime l'existante pour repartir propre
        siteMaterialRepository.deleteAll(siteMaterialRepository.findBySiteId(siteId));

        // IDs d'après ta table materials (1=béton armé, 2=acier primaire, 4=verre plat, 5=bois résineux)
        createIfPositive(site, 1L, dto.getConcreteTons());
        createIfPositive(site, 2L, dto.getSteelTons());
        createIfPositive(site, 4L, dto.getGlassTons());
        createIfPositive(site, 5L, dto.getWoodTons());

        return ResponseEntity.noContent().build();
    }

    private void createIfPositive(Site site, Long materialId, Double tons) {
        if (tons == null || tons <= 0) {
            return;
        }

        Optional<Material> matOpt = materialRepository.findById(materialId);
        if (matOpt.isEmpty()) {
            return;
        }

        double quantityKg = tons * 1000.0;

        SiteMaterial sm = SiteMaterial.builder()
                .site(site)
                .material(matOpt.get())
                .quantity(quantityKg)
                .unit("kg")
                .lifeCycleStage("construction")
                .build();
        siteMaterialRepository.save(sm);
    }
}

