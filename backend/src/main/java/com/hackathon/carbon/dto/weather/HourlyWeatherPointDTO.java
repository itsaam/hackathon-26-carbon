package com.hackathon.carbon.dto.weather;

import lombok.Builder;

@Builder
public record HourlyWeatherPointDTO(
        String time,
        Double temperatureC,
        Double precipitationMm,
        Double rainMm,
        Double snowfallCm
) {
}

