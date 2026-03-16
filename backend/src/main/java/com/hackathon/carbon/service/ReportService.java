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
        String text = generateSiteReportText(siteId, year);
        return text.getBytes(StandardCharsets.UTF_8);
    }

    public String generateSiteReportHtml(Long siteId, Integer year) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + siteId));

        List<CarbonResult> results = (year != null)
                ? carbonResultRepository.findBySiteIdAndYearOrderByCalculatedAtDesc(siteId, year)
                : carbonResultRepository.findBySiteIdOrderByCalculatedAtDesc(siteId);

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html lang=\"fr\"><head><meta charset=\"UTF-8\" />");
        sb.append("<title>Rapport carbone – ").append(escape(site.getName())).append("</title>");
        sb.append("<style>");
        sb.append("body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0b1220;color:#e5e7eb;padding:32px;}");
        sb.append("h1,h2,h3{color:#f9fafb;margin-bottom:8px;}");
        sb.append("section{margin-bottom:24px;padding:16px;border-radius:12px;background:rgba(15,23,42,0.85);border:1px solid rgba(148,163,184,0.35);}");
        sb.append("table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px;}");
        sb.append("th,td{padding:8px 10px;border-bottom:1px solid rgba(51,65,85,0.9);text-align:right;}");
        sb.append("th:first-child,td:first-child{text-align:left;}");
        sb.append("th{background:rgba(15,23,42,0.9);color:#e5e7eb;font-weight:600;}");
        sb.append(".tag{display:inline-flex;padding:2px 8px;border-radius:999px;font-size:11px;background:rgba(34,197,94,0.12);color:#4ade80;}");
        sb.append(".muted{color:#9ca3af;font-size:13px;}");
        sb.append("</style></head><body>");

        sb.append("<h1>Rapport d'empreinte carbone du site</h1>");

        sb.append("<section>");
        sb.append("<h2>Informations générales</h2>");
        sb.append("<p><strong>Site :</strong> ").append(escape(site.getName())).append("</p>");
        sb.append("<p><strong>Adresse :</strong> ")
                .append(escape(site.getAddressLine1()))
                .append(site.getPostalCode() != null ? " " + escape(site.getPostalCode()) : "")
                .append(site.getCity() != null ? " " + escape(site.getCity()) : "")
                .append(site.getCountry() != null ? ", " + escape(site.getCountry()) : "")
                .append("</p>");
        sb.append("<p class=\"muted\">Ce rapport HTML est une base pour un futur export PDF plus riche.</p>");
        sb.append("</section>");

        if (results.isEmpty()) {
            sb.append("<section><p>Aucun résultat de calcul disponible pour ce site.</p></section>");
        } else {
            DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            sb.append("<section>");
            sb.append("<h2>Historique des calculs</h2>");
            sb.append("<table><thead><tr>");
            sb.append("<th>Date de calcul</th><th>Total (kgCO₂e)</th><th>Construction</th><th>Exploitation</th>");
            sb.append("</tr></thead><tbody>");
            for (CarbonResult r : results) {
                sb.append("<tr>");
                sb.append("<td>").append(r.getCalculatedAt().format(df)).append("</td>");
                sb.append("<td>").append(formatNumber(r.getTotalCo2Kg())).append("</td>");
                sb.append("<td>").append(formatNumber(r.getConstructionCo2Kg())).append("</td>");
                sb.append("<td>").append(formatNumber(r.getExploitationCo2Kg())).append("</td>");
                sb.append("</tr>");
            }
            sb.append("</tbody></table>");
            sb.append("</section>");

            CarbonResult latest = results.get(0);
            sb.append("<section>");
            sb.append("<h2>Dernier résultat détaillé</h2>");
            sb.append("<p><span class=\"tag\">Période analysée</span></p>");
            sb.append("<p>")
                    .append(escape(String.valueOf(latest.getPeriodStart())))
                    .append(" → ")
                    .append(escape(String.valueOf(latest.getPeriodEnd())))
                    .append("</p>");

            sb.append("<table><tbody>");
            sb.append("<tr><th>CO₂ total</th><td>")
                    .append(formatNumber(latest.getTotalCo2Kg()))
                    .append(" kgCO₂e</td></tr>");
            sb.append("<tr><th>CO₂ / m²</th><td>")
                    .append(formatNumber(latest.getCo2PerM2()))
                    .append(" kgCO₂e/m²</td></tr>");
            sb.append("<tr><th>CO₂ / employé</th><td>")
                    .append(formatNumber(latest.getCo2PerEmployee()))
                    .append(" kgCO₂e/emp</td></tr>");
            sb.append("</tbody></table>");

            sb.append("<p class=\"muted\">Méthodologie : ")
                    .append(escape(latest.getCalculationVersion()))
                    .append(" (")
                    .append(escape(latest.getFactorsSource()))
                    .append(")</p>");
            if (latest.getComment() != null) {
                sb.append("<p class=\"muted\">Commentaire : ").append(escape(latest.getComment())).append("</p>");
            }
            sb.append("</section>");
        }

        sb.append("<section>");
        sb.append("<h3>Note</h3>");
        sb.append("<p class=\"muted\">Ce rapport est généré automatiquement par la plateforme CarbonTrack et peut servir de base à un rapport PDF institutionnel.</p>");
        sb.append("</section>");

        sb.append("</body></html>");
        return sb.toString();
    }

    private String generateSiteReportText(Long siteId, Integer year) {
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
        return sb.toString();
    }

    private String escape(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private String formatNumber(Double value) {
        if (value == null) return "N/A";
        return String.format("%.2f", value);
    }
}

