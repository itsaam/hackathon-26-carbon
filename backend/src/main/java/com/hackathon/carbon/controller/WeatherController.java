package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.weather.WeatherForecastDTO;
import com.hackathon.carbon.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/forecast")
    public ResponseEntity<WeatherForecastDTO> getForecast(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) String timezone,
            @RequestParam(defaultValue = "7") int forecastDays
    ) {
        return ResponseEntity.ok(weatherService.getHourlyForecast(latitude, longitude, timezone, forecastDays));
    }
}

