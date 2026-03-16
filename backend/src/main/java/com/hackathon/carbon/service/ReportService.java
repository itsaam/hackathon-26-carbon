package com.hackathon.carbon.service;

import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.SiteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SiteRepository siteRepository;
    private final CarbonResultRepository carbonResultRepository;

    public byte[] generateSiteReport(Long siteId, Integer year) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + siteId));

        List<CarbonResult> results = (year != null)
                ? carbonResultRepository.findBySiteIdAndYearOrderByCalculatedAtDesc(siteId, year)
                : carbonResultRepository.findBySiteIdOrderByCalculatedAtDesc(siteId);

        StringBuilder sb = new StringBuilder();
        sb.append("Rapport d'empreinte carbone du site\n\n");
        sb.append("Site : ").append(site.getName()).append("\n");
        sb.append("Adresse : ")
                .append(site.getAddressLine1() != null ? site.getAddressLine1() : "")
                .append(site.getPostalCode() != null ? " " + site.getPostalCode() : "")
                .append(site.getCity() != null ? " " + site.getCity() : "")
                .append(site.getCountry() != null ? ", " + site.getCountry() : "")
                .append("\n\n");

        if (results.isEmpty()) {
            sb.append("Aucun résultat de calcul disponible pour ce site.\n");
        } else {
            DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            sb.append("Historique des calculs :\n");
            for (CarbonResult r : results) {
                sb.append("- Calcul du ")
                        .append(r.getCalculatedAt().format(df))
                        .append(" : total=")
                        .append(r.getTotalCo2Kg() != null ? String.format("%.2f kgCO2e", r.getTotalCo2Kg()) : "N/A")
                        .append(", construction=")
                        .append(r.getConstructionCo2Kg() != null ? String.format("%.2f kgCO2e", r.getConstructionCo2Kg()) : "N/A")
                        .append(", exploitation=")
                        .append(r.getExploitationCo2Kg() != null ? String.format("%.2f kgCO2e", r.getExploitationCo2Kg()) : "N/A")
                        .append("\n");
            }

            CarbonResult latest = results.get(0);
            sb.append("\nDernier résultat détaillé :\n");
            sb.append("Période : ").append(latest.getPeriodStart()).append(" -> ").append(latest.getPeriodEnd()).append("\n");
            sb.append("CO2 total : ").append(latest.getTotalCo2Kg()).append(" kgCO2e\n");
            sb.append("CO2 / m2 : ").append(latest.getCo2PerM2()).append(" kgCO2e/m2\n");
            sb.append("CO2 / employé : ").append(latest.getCo2PerEmployee()).append(" kgCO2e/emp\n");
            sb.append("Méthodologie : ").append(latest.getCalculationVersion()).append(" (").append(latest.getFactorsSource()).append(")\n");
            if (latest.getComment() != null) {
                sb.append("Commentaire : ").append(latest.getComment()).append("\n");
            }
        }

        sb.append("\nCe rapport texte est généré automatiquement par la plateforme CarbonTrack.\n");
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}

