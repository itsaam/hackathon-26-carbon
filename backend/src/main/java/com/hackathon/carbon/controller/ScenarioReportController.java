package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.CarbonResultDTO;
import com.hackathon.carbon.dto.ScenarioRequestDTO;
import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.repository.SiteRepository;
import com.hackathon.carbon.service.CarbonCalculationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
import java.time.LocalDate;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class ScenarioReportController {

    private final SiteRepository siteRepository;
    private final CarbonCalculationService carbonCalculationService;

    @PostMapping("/{siteId}/scenario/report.pdf")
    public ResponseEntity<byte[]> exportScenarioReportPdf(
            @PathVariable Long siteId,
            @RequestBody ScenarioRequestDTO body
    ) {
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé avec l'ID : " + siteId));

        int inventoryYear = body.getInventoryYear() != null ? body.getInventoryYear() : LocalDate.now().getYear();

        // Point de départ : site réel
        CarbonResult base = carbonCalculationService.estimateForSite(site, inventoryYear);

        // Construction du site scénarisé (mêmes champs qu'en what-if)
        Site scenarioSite = Site.builder()
                .id(site.getId())
                .surfaceM2(site.getSurfaceM2())
                .employeeCount(site.getEmployeeCount())
                .workstationCount(site.getWorkstationCount())
                .parkingBasement(site.getParkingBasement())
                .parkingUnderground(site.getParkingUnderground())
                .parkingOutdoor(site.getParkingOutdoor())
                .energyConsumptionKwh(site.getEnergyConsumptionKwh())
                .electricityConsumptionKwh(site.getElectricityConsumptionKwh())
                .gasConsumptionKwh(site.getGasConsumptionKwh())
                .fuelOilConsumptionKwh(site.getFuelOilConsumptionKwh())
                .districtHeatingConsumptionKwh(site.getDistrictHeatingConsumptionKwh())
                .renewableProductionKwh(site.getRenewableProductionKwh())
                .renewableSelfConsumptionRate(site.getRenewableSelfConsumptionRate())
                .build();

        Double energyDeltaPct = body.getEnergyDeltaPercent() != null ? body.getEnergyDeltaPercent() : 0.0;
        Double renewableDeltaPct = body.getRenewableDeltaPercent() != null ? body.getRenewableDeltaPercent() : 0.0;

        double factorEnergy = 1.0 + energyDeltaPct / 100.0;
        double factorRenewable = 1.0 + renewableDeltaPct / 100.0;

        if (scenarioSite.getElectricityConsumptionKwh() != null) {
            scenarioSite.setElectricityConsumptionKwh(scenarioSite.getElectricityConsumptionKwh() * factorEnergy);
        }
        if (scenarioSite.getGasConsumptionKwh() != null) {
            scenarioSite.setGasConsumptionKwh(scenarioSite.getGasConsumptionKwh() * factorEnergy);
        }
        if (scenarioSite.getFuelOilConsumptionKwh() != null) {
            scenarioSite.setFuelOilConsumptionKwh(scenarioSite.getFuelOilConsumptionKwh() * factorEnergy);
        }
        if (scenarioSite.getDistrictHeatingConsumptionKwh() != null) {
            scenarioSite.setDistrictHeatingConsumptionKwh(scenarioSite.getDistrictHeatingConsumptionKwh() * factorEnergy);
        }
        if (scenarioSite.getEnergyConsumptionKwh() != null) {
            scenarioSite.setEnergyConsumptionKwh(scenarioSite.getEnergyConsumptionKwh() * factorEnergy);
        }
        if (scenarioSite.getRenewableProductionKwh() != null) {
            scenarioSite.setRenewableProductionKwh(scenarioSite.getRenewableProductionKwh() * factorRenewable);
        }

        CarbonResult scenario = carbonCalculationService.estimateForSite(scenarioSite, inventoryYear);

        byte[] pdf = buildScenarioPdf(site, base, scenario, body);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"site-" + siteId + "-scenario.pdf\"");
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }

    private byte[] buildScenarioPdf(Site site, CarbonResult base, CarbonResult scenario, ScenarioRequestDTO body) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 56, 56, 56, 56);
        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font h2Font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font smallMuted = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, new java.awt.Color(120, 120, 120));

            try {
                Image logo = Image.getInstance(getClass().getResource("/static/logo-capgemini.png"));
                logo.scaleToFit(100, 40);
                logo.setAlignment(Image.ALIGN_LEFT);
                doc.add(logo);
            } catch (Exception ignored) {
            }

            Paragraph brand = new Paragraph("Capgemini — CarbonTrack", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11));
            brand.setSpacingAfter(4);
            doc.add(brand);
            String label = body.getScenarioLabel() != null && !body.getScenarioLabel().isBlank()
                    ? body.getScenarioLabel()
                    : "Scénario énergie / renouvelable";

            Paragraph title = new Paragraph("Simulation d'empreinte carbone — " + site.getName(), titleFont);
            title.setSpacingAfter(4);
            doc.add(title);
            Paragraph sub = new Paragraph(label, smallMuted);
            sub.setSpacingAfter(16);
            doc.add(sub);

            // Section paramètres
            Paragraph hParams = new Paragraph("Paramètres du scénario", h2Font);
            hParams.setSpacingAfter(6);
            doc.add(hParams);
            doc.add(new Paragraph("Réduction consommation énergétique : " + (body.getEnergyDeltaPercent() != null ? body.getEnergyDeltaPercent() : 0.0) + " %", textFont));
            doc.add(new Paragraph("Augmentation production renouvelable : " + (body.getRenewableDeltaPercent() != null ? body.getRenewableDeltaPercent() : 0.0) + " %", textFont));
            doc.add(new Paragraph(" ", textFont));

            // Tableau KPIs
            if (body.isIncludeKpis()) {
                PdfPTable kpi = new PdfPTable(body.isIncludeComparison() ? 3 : 2);
                kpi.setWidthPercentage(100);
                kpi.setSpacingBefore(6);

                if (body.isIncludeComparison()) {
                    kpi.setWidths(new float[]{3f, 2f, 2f});
                    addHeader(kpi, "Indicateur");
                    addHeader(kpi, "Réel");
                    addHeader(kpi, "Scénario");
                } else {
                    kpi.setWidths(new float[]{3f, 2f});
                    addHeader(kpi, "Indicateur");
                    addHeader(kpi, "Scénario");
                }

                addRow(kpi, "CO₂ total (tCO₂e)",
                        (base.getTotalCo2Kg() != null ? base.getTotalCo2Kg() / 1000.0 : null),
                        (scenario.getTotalCo2Kg() != null ? scenario.getTotalCo2Kg() / 1000.0 : null),
                        body.isIncludeComparison(), textFont);
                addRow(kpi, "CO₂ / m² (kgCO₂e/m²)",
                        base.getCo2PerM2(), scenario.getCo2PerM2(),
                        body.isIncludeComparison(), textFont);
                addRow(kpi, "CO₂ / employé (kgCO₂e/emp)",
                        base.getCo2PerEmployee(), scenario.getCo2PerEmployee(),
                        body.isIncludeComparison(), textFont);

                Paragraph hKpi = new Paragraph("Indicateurs clés", h2Font);
                hKpi.setSpacingAfter(4);
                doc.add(hKpi);
                doc.add(kpi);
            }

            // Delta synthétique
            if (body.isIncludeComparison()
                    && base.getTotalCo2Kg() != null
                    && scenario.getTotalCo2Kg() != null) {
                double deltaT = (scenario.getTotalCo2Kg() - base.getTotalCo2Kg()) / 1000.0;
                String signe = deltaT <= 0 ? "réduction" : "augmentation";
                Paragraph synth = new Paragraph(
                        String.format("Le scénario représente une %s de %.2f tCO₂e par rapport à la situation actuelle.",
                                signe, Math.abs(deltaT)),
                        smallMuted
                );
                synth.setSpacingBefore(12);
                doc.add(synth);
            }

        } catch (DocumentException e) {
            return new byte[0];
        } finally {
            doc.close();
        }
        return baos.toByteArray();
    }

    private void addHeader(PdfPTable table, String text) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        PdfPCell cell = new PdfPCell(new Phrase(text, headerFont));
        cell.setBackgroundColor(new java.awt.Color(240, 244, 248));
        table.addCell(cell);
    }

    private void addRow(PdfPTable table, String label, Double base, Double scenario, boolean includeComparison, Font font) {
        table.addCell(new PdfPCell(new Phrase(label, font)));
        if (includeComparison) {
            table.addCell(new PdfPCell(new Phrase(format(base), font)));
            table.addCell(new PdfPCell(new Phrase(format(scenario), font)));
        } else {
            table.addCell(new PdfPCell(new Phrase(format(scenario), font)));
        }
    }

    private String format(Double v) {
        if (v == null) return "—";
        return String.format("%.3f", v);
    }
}

