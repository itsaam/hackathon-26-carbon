package com.hackathon.carbon.dto.weather;

import lombok.Builder;

@Builder
public record TeleworkRecommendationDTO(
        boolean teleworkAdvised,
        String reason,
        String date,
        Double minTemperatureC,
        boolean iceRisk
) {
}

