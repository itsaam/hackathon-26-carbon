package com.hackathon.carbon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "emission_factor", nullable = false)
    private Double emissionFactor;

    @Column(nullable = false)
    @Builder.Default
    private String unit = "tonne";

    @Column(nullable = false)
    @Builder.Default
    private String source = "ADEME";

    // Catégorisation et données ACV
    @Column(name = "category")
    private String category;

    @Column(name = "sub_category")
    private String subCategory;

    @Column(name = "density_kg_m3")
    private Double density;

    @Column(name = "life_cycle_stage_covered")
    private String lifeCycleStageCovered;

    @Column(name = "gwp_per_kg")
    private Double gwpPerKg;

    @Column(name = "reference_year")
    private Integer referenceYear;

    @Column(name = "data_source_url", length = 1000)
    private String dataSourceUrl;
}
