package com.hackathon.carbon.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScenarioRequestDTO {

    private Double energyDeltaPercent;
    private Double renewableDeltaPercent;

    private String scenarioLabel;
    private boolean includeComparison = true;
    private boolean includeKpis = true;
}

