package com.hackathon.carbon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "site_materials", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"site_id", "material_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(nullable = false)
    private Double quantity;

    @Column(name = "unit")
    private String unit;

    @Column(name = "area_m2")
    private Double areaM2;

    @Column(name = "volume_m3")
    private Double volumeM3;

    @Column(name = "life_cycle_stage")
    private String lifeCycleStage;
}
