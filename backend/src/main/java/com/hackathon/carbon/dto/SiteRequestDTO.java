package com.hackathon.carbon.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SiteRequestDTO {

    @NotBlank(message = "Le nom du site est obligatoire")
    private String name;

    @NotNull(message = "La surface est obligatoire")
    @Min(value = 1, message = "La surface doit être supérieure à 0")
    private Double surfaceM2;

    private Integer parkingUnderground;
    private Integer parkingBasement;
    private Integer parkingOutdoor;

    @NotNull(message = "La consommation d'énergie est obligatoire")
    private Double energyConsumptionKwh;

    @NotNull(message = "Le nombre d'employés est obligatoire")
    @Min(value = 1, message = "Le nombre d'employés doit être supérieur à 0")
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
}
