package com.hackathon.carbon.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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

    /**
     * Utilisateurs autorisés à accéder à ce site (hors admins, qui ont accès global).
     * Utilisé pour filtrer les listes et protéger l'accès aux détails.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "site_access",
            joinColumns = @JoinColumn(name = "site_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> allowedUsers = new HashSet<>();

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

    // Localisation et identification
    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "city")
    private String city;

    @Column(name = "country")
    private String country;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "internal_code")
    private String internalCode;

    @Column(name = "external_code")
    private String externalCode;

    // Typologie et usage
    @Column(name = "building_type")
    private String buildingType;

    @Column(name = "usage_type")
    private String usageType;

    @Column(name = "year_of_construction")
    private Integer yearOfConstruction;

    @Column(name = "year_of_renovation")
    private Integer yearOfRenovation;

    @Column(name = "floors_count")
    private Integer floorsCount;

    @Column(name = "heated_area_m2")
    private Double heatedAreaM2;

    @Column(name = "cooled_area_m2")
    private Double cooledAreaM2;

    // Profil d'occupation
    @Column(name = "occupancy_days_per_week")
    private Integer occupancyDaysPerWeek;

    @Column(name = "occupancy_hours_per_day")
    private Integer occupancyHoursPerDay;

    @Column(name = "average_occupancy_rate")
    private Double averageOccupancyRate;

    // Données énergétiques détaillées
    @Column(name = "electricity_consumption_kwh")
    private Double electricityConsumptionKwh;

    @Column(name = "gas_consumption_kwh")
    private Double gasConsumptionKwh;

    @Column(name = "fuel_oil_consumption_kwh")
    private Double fuelOilConsumptionKwh;

    @Column(name = "district_heating_consumption_kwh")
    private Double districtHeatingConsumptionKwh;

    @Column(name = "renewable_production_kwh")
    private Double renewableProductionKwh;

    @Column(name = "renewable_self_consumption_rate")
    private Double renewableSelfConsumptionRate;

    // Informations complémentaires
    @Column(name = "open_since")
    private LocalDate openSince;

    @Column(name = "activity_description", length = 2000)
    private String activityDescription;

    @Column(name = "notes", length = 4000)
    private String notes;

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
