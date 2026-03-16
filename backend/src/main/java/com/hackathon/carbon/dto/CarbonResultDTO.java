package com.hackathon.carbon.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CarbonResultDTO {
    private Long id;
    private Long siteId;
    private Double constructionCo2Kg;
    private Double exploitationCo2Kg;
    private Double totalCo2Kg;
    private Double co2PerM2;
    private Double co2PerEmployee;
    // Période et granularité
    private java.time.LocalDate periodStart;
    private java.time.LocalDate periodEnd;
    private Integer year;
    // Découpage par scope / catégories
    private Double scope1Co2Kg;
    private Double scope2Co2Kg;
    private Double scope3Co2Kg;
    private Double buildingStructureCo2Kg;
    private Double parkingCo2Kg;
    private Double energyUseCo2Kg;
    private Double otherCo2Kg;
    // Métadonnées de calcul
    private String calculationVersion;
    private String factorsSource;
    private String comment;
    private LocalDateTime calculatedAt;
}
