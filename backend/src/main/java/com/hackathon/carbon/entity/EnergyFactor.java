package com.hackathon.carbon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "energy_factors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnergyFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "energy_type", nullable = false)
    private String energyType;

    @Column(name = "emission_factor", nullable = false)
    private Double emissionFactor;

    @Column(nullable = false)
    @Builder.Default
    private String source = "ADEME";

    @Column(nullable = false)
    @Builder.Default
    private Integer year = 2024;
}
