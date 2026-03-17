package com.hackathon.carbon.service;

import com.hackathon.carbon.dto.weather.HourlyWeatherPointDTO;
import com.hackathon.carbon.dto.weather.TeleworkRecommendationDTO;
import com.hackathon.carbon.dto.weather.WeatherForecastDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TeleworkRecommendationService {

    private final WeatherService weatherService;

    public TeleworkRecommendationDTO recommend(double latitude, double longitude, LocalDate date, String timezone) {
        LocalDate target = (date == null) ? LocalDate.now() : date;
        WeatherForecastDTO forecast = weatherService.getHourlyForecast(latitude, longitude, timezone, 10);

        List<HourlyWeatherPointDTO> dayPoints = (forecast.hourly() == null ? List.<HourlyWeatherPointDTO>of() : forecast.hourly())
                .stream()
                .filter(p -> p != null && p.time() != null && p.time().startsWith(target.toString()))
                .toList();

        Double minTemp = dayPoints.stream()
                .map(HourlyWeatherPointDTO::temperatureC)
                .filter(Objects::nonNull)
                .min(Comparator.naturalOrder())
                .orElse(null);

        boolean iceRisk = dayPoints.stream().anyMatch(p -> isIceRisk(p));

        boolean advised = (minTemp != null && minTemp <= -8.0) || iceRisk;
        String reason = buildReason(target, minTemp, iceRisk);

        return TeleworkRecommendationDTO.builder()
                .teleworkAdvised(advised)
                .reason(reason)
                .date(target.toString())
                .minTemperatureC(minTemp)
                .iceRisk(iceRisk)
                .build();
    }

    private static boolean isIceRisk(HourlyWeatherPointDTO p) {
        if (p == null) return false;
        Double t = p.temperatureC();
        Double precipitation = firstNonNull(p.rainMm(), p.precipitationMm(), 0.0);
        if (t == null) return false;
        return t <= 0.0 && precipitation != null && precipitation >= 0.2;
    }

    private static Double firstNonNull(Double a, Double b, Double fallback) {
        if (a != null) return a;
        if (b != null) return b;
        return fallback;
    }

    private static String buildReason(LocalDate date, Double minTemp, boolean iceRisk) {
        if (minTemp == null && !iceRisk) {
            return "Données météo insuffisantes pour formuler une recommandation.";
        }
        if (iceRisk && minTemp != null) {
            return "Risque de verglas (précipitations avec température ≤ 0°C) et températures basses : télétravail conseillé.";
        }
        if (iceRisk) {
            return "Risque de verglas (précipitations avec température ≤ 0°C) : télétravail conseillé.";
        }
        if (minTemp != null && minTemp <= -12.0) {
            return "Températures extrêmes (≤ -12°C) : télétravail conseillé.";
        }
        if (minTemp != null && minTemp <= -8.0) {
            return "Températures très basses (≤ -8°C) : télétravail conseillé.";
        }
        return "Conditions météo a priori acceptables : présence sur site possible (surveillance recommandée).";
    }
}

