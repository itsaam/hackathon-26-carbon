package com.hackathon.carbon.service;

import com.hackathon.carbon.dto.BreakdownDTO;
import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.entity.Material;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.entity.SiteMaterial;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.SiteMaterialRepository;
import com.hackathon.carbon.repository.SiteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BreakdownService {

    private final SiteRepository siteRepository;
    private final CarbonResultRepository carbonResultRepository;
    private final SiteMaterialRepository siteMaterialRepository;

    /**
     * Répartition par catégorie (construction / exploitation) et par matériau pour un site.
     * Conforme CDC : GET /api/sites/{id}/breakdown.
     */
    public BreakdownDTO getBreakdown(Long siteId) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + siteId));

        double constructionCo2Kg = 0.0;
        double exploitationCo2Kg = 0.0;
        double totalCo2Kg = 0.0;

        var latestResult = carbonResultRepository.findFirstBySiteIdOrderByCalculatedAtDesc(siteId);
        if (latestResult.isPresent()) {
            CarbonResult r = latestResult.get();
            constructionCo2Kg = r.getConstructionCo2Kg() != null ? r.getConstructionCo2Kg() : 0.0;
            exploitationCo2Kg = r.getExploitationCo2Kg() != null ? r.getExploitationCo2Kg() : 0.0;
            totalCo2Kg = r.getTotalCo2Kg() != null ? r.getTotalCo2Kg() : (constructionCo2Kg + exploitationCo2Kg);
        }

        List<SiteMaterial> siteMaterials = siteMaterialRepository.findBySiteId(siteId);
        List<BreakdownDTO.MaterialBreakdownItem> materials = siteMaterials.stream()
                .map(this::toMaterialBreakdownItem)
                .sorted(Comparator.comparing(BreakdownDTO.MaterialBreakdownItem::getCo2Kg).reversed())
                .collect(Collectors.toList());

        return BreakdownDTO.builder()
                .constructionCo2Kg(constructionCo2Kg)
                .exploitationCo2Kg(exploitationCo2Kg)
                .totalCo2Kg(totalCo2Kg)
                .materials(materials)
                .build();
    }

    /**
     * SiteMaterial.quantity est en kg ; Material.emissionFactor en kgCO₂e/tonne.
     * co2Kg = quantity_kg × (emissionFactor / 1000) = quantity_tonnes × emissionFactor.
     */
    private BreakdownDTO.MaterialBreakdownItem toMaterialBreakdownItem(SiteMaterial sm) {
        Material material = sm.getMaterial();
        double quantityKg = sm.getQuantity() != null ? sm.getQuantity() : 0.0;
        double quantityTonnes = quantityKg / 1000.0;
        Double factor = material.getEmissionFactor();
        if (factor == null) {
            factor = material.getGwpPerKg() != null ? material.getGwpPerKg() * 1000.0 : 0.0;
        }
        double gwpPerKg = factor / 1000.0;
        double co2Kg = quantityKg * gwpPerKg;

        return BreakdownDTO.MaterialBreakdownItem.builder()
                .materialName(material.getName())
                .quantityKg(quantityKg)
                .quantityTonnes(quantityTonnes)
                .co2Kg(co2Kg)
                .build();
    }
}
