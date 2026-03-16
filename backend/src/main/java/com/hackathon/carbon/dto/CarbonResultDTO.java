package com.hackathon.carbon.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CarbonResultDTO {
    private Long id;
    private Long siteId;
    private Double constructionCo2Kg;
    private Double exploitationCo2Kg;
    private Double totalCo2Kg;
    private Double co2PerM2;
    private Double co2PerEmployee;
    private LocalDateTime calculatedAt;
}
