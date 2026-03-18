package com.hackathon.carbon.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScenarioRequestDTO {

    private Double energyDeltaPercent;
    private Double renewableDeltaPercent;

    /**
     * Année d'inventaire utilisée pour récupérer les facteurs énergie (ex: 2024).
     * Si null, le backend choisit l'année la plus récente disponible.
     */
    private Integer inventoryYear;

    private String scenarioLabel;
    private boolean includeComparison = true;
    private boolean includeKpis = true;
}

