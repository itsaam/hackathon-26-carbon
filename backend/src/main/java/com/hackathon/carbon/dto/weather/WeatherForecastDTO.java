package com.hackathon.carbon.dto.weather;

import lombok.Builder;

import java.util.List;

@Builder
public record WeatherForecastDTO(
        Double latitude,
        Double longitude,
        String timezone,
        List<HourlyWeatherPointDTO> hourly
) {
}

