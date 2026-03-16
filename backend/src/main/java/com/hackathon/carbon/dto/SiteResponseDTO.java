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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double lastCo2Total;
}
