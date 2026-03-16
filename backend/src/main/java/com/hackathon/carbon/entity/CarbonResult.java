package com.hackathon.carbon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();
    }
}
