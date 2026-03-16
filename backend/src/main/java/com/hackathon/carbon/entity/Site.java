package com.hackathon.carbon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "surface_m2")
    private Double surfaceM2;

    @Column(name = "parking_underground")
    @Builder.Default
    private Integer parkingUnderground = 0;

    @Column(name = "parking_basement")
    @Builder.Default
    private Integer parkingBasement = 0;

    @Column(name = "parking_outdoor")
    @Builder.Default
    private Integer parkingOutdoor = 0;

    @Column(name = "energy_consumption_kwh")
    private Double energyConsumptionKwh;

    @Column(name = "employee_count")
    private Integer employeeCount;

    @Column(name = "workstation_count")
    @Builder.Default
    private Integer workstationCount = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
