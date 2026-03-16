package com.hackathon.carbon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "carbon_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(name = "construction_co2_kg")
    private Double constructionCo2Kg;

    @Column(name = "exploitation_co2_kg")
    private Double exploitationCo2Kg;

    @Column(name = "total_co2_kg")
    private Double totalCo2Kg;

    @Column(name = "co2_per_m2")
    private Double co2PerM2;

    @Column(name = "co2_per_employee")
    private Double co2PerEmployee;

    // Période et granularité
    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "inventory_year")
    private Integer year;

    // Découpage par scope ou catégories
    @Column(name = "scope1_co2_kg")
    private Double scope1Co2Kg;

    @Column(name = "scope2_co2_kg")
    private Double scope2Co2Kg;

    @Column(name = "scope3_co2_kg")
    private Double scope3Co2Kg;

    @Column(name = "building_structure_co2_kg")
    private Double buildingStructureCo2Kg;

    @Column(name = "parking_co2_kg")
    private Double parkingCo2Kg;

    @Column(name = "energy_use_co2_kg")
    private Double energyUseCo2Kg;

    @Column(name = "other_co2_kg")
    private Double otherCo2Kg;

    // Métadonnées de calcul
    @Column(name = "calculation_version")
    private String calculationVersion;

    @Column(name = "factors_source")
    private String factorsSource;

    @Column(name = "comment", length = 2000)
    private String comment;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();
    }
}
