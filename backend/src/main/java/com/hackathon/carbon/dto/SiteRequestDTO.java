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
}
