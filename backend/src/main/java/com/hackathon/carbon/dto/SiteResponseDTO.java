package com.hackathon.carbon.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SiteResponseDTO {
    private Long id;
    private String name;
    private Double surfaceM2;
    private Integer parkingUnderground;
    private Integer parkingBasement;
    private Integer parkingOutdoor;
    private Double energyConsumptionKwh;
    private Integer employeeCount;
    private Integer workstationCount;
    // Localisation et identification
    private String addressLine1;
    private String addressLine2;
    private String postalCode;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private String internalCode;
    private String externalCode;
    // Typologie et usage
    private String buildingType;
    private String usageType;
    private Integer yearOfConstruction;
    private Integer yearOfRenovation;
    private Integer floorsCount;
    private Double heatedAreaM2;
    private Double cooledAreaM2;
    // Profil d'occupation
    private Integer occupancyDaysPerWeek;
    private Integer occupancyHoursPerDay;
    private Double averageOccupancyRate;
    // Données énergétiques détaillées
    private Double electricityConsumptionKwh;
    private Double gasConsumptionKwh;
    private Double fuelOilConsumptionKwh;
    private Double districtHeatingConsumptionKwh;
    private Double renewableProductionKwh;
    private Double renewableSelfConsumptionRate;
    // Informations complémentaires
    private String activityDescription;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double lastCo2Total;
}
