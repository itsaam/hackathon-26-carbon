package com.hackathon.carbon.service;

import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.entity.EnergyFactor;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.repository.CarbonResultRepository;
import com.hackathon.carbon.repository.EnergyFactorRepository;
import com.hackathon.carbon.repository.SiteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SiteRepository siteRepository;
    private final CarbonResultRepository carbonResultRepository;
    private final EnergyFactorRepository energyFactorRepository;

    public byte[] generateSiteReport(Long siteId, Integer year) {
        String text = generateSiteReportText(siteId, year);
        return text.getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateSiteReportPdf(Long siteId, Integer year) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + siteId));

        List<CarbonResult> results = (year != null)
                ? carbonResultRepository.findBySiteIdAndYearOrderByCalculatedAtDesc(siteId, year)
                : carbonResultRepository.findBySiteIdOrderByCalculatedAtDesc(siteId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        // Marges un peu plus larges pour un rendu plus aéré
        Document doc = new Document(PageSize.A4, 56, 56, 56, 56);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font h2Font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font smallMuted = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, new java.awt.Color(120, 120, 120));

            // Logo Capgemini (optionnel si présent dans les ressources)
            try {
                Image logo = Image.getInstance(getClass().getResource("/static/logo-capgemini.png"));
                logo.scaleToFit(100, 40);
                logo.setAlignment(Image.ALIGN_LEFT);
                doc.add(logo);
            } catch (Exception ignored) {
                // pas bloquant si le logo n'est pas trouvé
            }

            Paragraph brand = new Paragraph("Capgemini — CarbonTrack", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11));
            brand.setSpacingAfter(4);
            doc.add(brand);

            Paragraph title = new Paragraph("Rapport d'empreinte carbone du site", titleFont);
            title.setSpacingAfter(16);
            doc.add(title);

            // Informations générales
            Paragraph hInfo = new Paragraph("Informations générales", h2Font);
            hInfo.setSpacingAfter(6);
            doc.add(hInfo);

            doc.add(new Paragraph("Site : " + site.getName(), textFont));
            StringBuilder sbAddr = new StringBuilder();
            if (site.getAddressLine1() != null) sbAddr.append(site.getAddressLine1());
            if (site.getPostalCode() != null) sbAddr.append(" ").append(site.getPostalCode());
            if (site.getCity() != null) sbAddr.append(" ").append(site.getCity());
            if (site.getCountry() != null) sbAddr.append(", ").append(site.getCountry());
            Paragraph addr = new Paragraph("Adresse : " + sbAddr, textFont);
            addr.setSpacingAfter(12);
            doc.add(addr);

            if (results.isEmpty()) {
                doc.add(new Paragraph("Aucun résultat de calcul disponible pour ce site.", textFont));
            } else {
                DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

                // Tableau historique
                Paragraph hHist = new Paragraph("Historique des calculs", h2Font);
                hHist.setSpacingAfter(6);
                doc.add(hHist);
                PdfPTable table = new PdfPTable(4);
                table.setWidthPercentage(100);
                table.setSpacingBefore(4);
                table.setSpacingAfter(18);
                table.setWidths(new float[]{3f, 2f, 2f, 2f});

                addHeaderCell(table, "Date de calcul");
                addHeaderCell(table, "Total (kgCO₂e)");
                addHeaderCell(table, "Construction");
                addHeaderCell(table, "Exploitation");

                for (CarbonResult r : results) {
                    table.addCell(new PdfPCell(new Phrase(r.getCalculatedAt().format(df), textFont)));
                    table.addCell(new PdfPCell(new Phrase(formatNumber(r.getTotalCo2Kg()), textFont)));
                    table.addCell(new PdfPCell(new Phrase(formatNumber(r.getConstructionCo2Kg()), textFont)));
                    table.addCell(new PdfPCell(new Phrase(formatNumber(r.getExploitationCo2Kg()), textFont)));
                }
                doc.add(table);

                // Détail dernier résultat
                CarbonResult latest = results.get(0);
                Paragraph hLast = new Paragraph("Dernier résultat détaillé", h2Font);
                hLast.setSpacingAfter(4);
                doc.add(hLast);

                Paragraph period = new Paragraph("Période : " + latest.getPeriodStart() + " → " + latest.getPeriodEnd(), textFont);
                period.setSpacingAfter(8);
                doc.add(period);

                PdfPTable kpi = new PdfPTable(2);
                kpi.setWidthPercentage(100);
                kpi.setSpacingBefore(2);
                kpi.setWidths(new float[]{3f, 2f});
                addHeaderCell(kpi, "Indicateur");
                addHeaderCell(kpi, "Valeur");
                addKpiRow(kpi, "CO₂ total", formatNumber(latest.getTotalCo2Kg()) + " kgCO₂e", textFont);
                addKpiRow(kpi, "CO₂ / m²", formatNumber(latest.getCo2PerM2()) + " kgCO₂e/m²", textFont);
                addKpiRow(kpi, "CO₂ / employé", formatNumber(latest.getCo2PerEmployee()) + " kgCO₂e/emp", textFont);
                doc.add(kpi);

                // Un peu d'air avant la section suivante
                doc.add(new Paragraph(" ", textFont));

                // Pseudo graphique barres Construction vs Exploitation
                double consT = (latest.getConstructionCo2Kg() != null ? latest.getConstructionCo2Kg() : 0) / 1000.0;
                double explT = (latest.getExploitationCo2Kg() != null ? latest.getExploitationCo2Kg() : 0) / 1000.0;
                double max = Math.max(consT, explT);

                PdfPTable barTable = new PdfPTable(2);
                barTable.setWidthPercentage(100);
                barTable.setSpacingBefore(4);
                barTable.setWidths(new float[]{2f, 5f});
                addHeaderCell(barTable, "Poste");
                addHeaderCell(barTable, "Répartition (approx.)");
                addBarRow(barTable, "Construction", consT, max);
                addBarRow(barTable, "Exploitation", explT, max);
                doc.add(barTable);

                doc.add(new Paragraph(" ", textFont));
                String meth = "Méthodologie : " + (latest.getCalculationVersion() != null ? latest.getCalculationVersion() : "—")
                        + " (" + (latest.getFactorsSource() != null ? latest.getFactorsSource() : "—") + ")";
                doc.add(new Paragraph(meth, smallMuted));
                if (latest.getComment() != null) {
                    doc.add(new Paragraph("Commentaire : " + latest.getComment(), smallMuted));
                }
            }

            String factorsNote = buildFactorsNote();
            Paragraph note = new Paragraph(factorsNote, smallMuted);
            note.setSpacingBefore(16);
            doc.add(note);

        } catch (DocumentException e) {
            return new byte[0];
        } finally {
            doc.close();
        }
        return baos.toByteArray();
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
        sb.append("<p class=\"muted\">").append(escape(buildFactorsNote())).append("</p>");
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

        sb.append("\n").append(buildFactorsNote()).append("\n");
        return sb.toString();
    }

    private String buildFactorsNote() {
        EnergyFactor latest = energyFactorRepository.findTopByOrderByYearDesc().orElse(null);
        if (latest == null) {
            return "Ce rapport a été généré automatiquement par la plateforme CarbonTrack. Les facteurs d'émission enregistrés n'ont pas de méta-données de millésime disponibles.";
        }
        int year = latest.getYear() != null ? latest.getYear() : 0;
        String source = latest.getSource() != null ? latest.getSource() : "ADEME";
        String freshness = year >= java.time.Year.now().getValue() - 1
                ? "Facteurs considérés comme à jour pour l'année de référence."
                : "Attention : les facteurs d'émission sont potentiellement obsolètes par rapport à l'année courante.";
        return "Ce rapport a été généré automatiquement par la plateforme CarbonTrack en utilisant des facteurs d'émission "
                + source + " (millésime " + year + "). " + freshness;
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

    private void addHeaderCell(PdfPTable table, String text) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        PdfPCell cell = new PdfPCell(new Phrase(text, headerFont));
        cell.setBackgroundColor(new java.awt.Color(243, 245, 249));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addKpiRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, font));
        c1.setPadding(6);
        c1.setBorderWidth(0.4f);
        c1.setBorderColor(new java.awt.Color(230, 234, 240));
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(value, font));
        c2.setHorizontalAlignment(PdfPCell.ALIGN_RIGHT);
        c2.setPadding(6);
        c2.setBorderWidth(0.4f);
        c2.setBorderColor(new java.awt.Color(230, 234, 240));
        table.addCell(c2);
    }

    private void addBarRow(PdfPTable table, String label, double value, double max) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 9);
        PdfPCell labelCell = new PdfPCell(new Phrase(
                label + " (" + String.format("%.1f", value) + " tCO₂e)", font));
        labelCell.setPadding(4);
        labelCell.setBorderWidth(0.3f);
        labelCell.setBorderColor(new java.awt.Color(235, 238, 245));
        table.addCell(labelCell);

        int barWidth = max > 0 ? (int) (150 * (value / max)) : 1;
        PdfPCell barCell = new PdfPCell();
        barCell.setPadding(3);
        barCell.setBorderWidth(0.3f);
        barCell.setBorderColor(new java.awt.Color(235, 238, 245));

        StringBuilder barText = new StringBuilder();
        int blocks = Math.max(1, barWidth / 6);
        for (int i = 0; i < blocks; i++) {
            barText.append("█");
        }
        barCell.setPhrase(new Phrase(barText.toString(), FontFactory.getFont(FontFactory.HELVETICA, 8, new java.awt.Color(56, 189, 248))));
        table.addCell(barCell);
    }
}

