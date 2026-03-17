package com.hackathon.carbon.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.carbon.dto.weather.HourlyWeatherPointDTO;
import com.hackathon.carbon.dto.weather.WeatherForecastDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService {

    private static final String OPEN_METEO_BASE_URL = "https://api.open-meteo.com";

    private final ObjectMapper objectMapper;

    public WeatherForecastDTO getHourlyForecast(double latitude, double longitude, String timezone, int forecastDays) {
        int days = Math.max(1, Math.min(forecastDays, 16));
        String tz = (timezone == null || timezone.isBlank()) ? "Europe/Paris" : timezone;

        WebClient client = WebClient.builder()
                .baseUrl(OPEN_METEO_BASE_URL)
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(8 * 1024 * 1024))
                .build();

        String raw = client.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/forecast")
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam("hourly", "temperature_2m,precipitation,rain,snowfall")
                        .queryParam("timezone", tz)
                        .queryParam("forecast_days", days)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(ex -> {
                    log.warn("Erreur Open-Meteo: {}", ex.getMessage());
                    return Mono.empty();
                })
                .block();

        if (raw == null || raw.isBlank()) {
            return WeatherForecastDTO.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .timezone(tz)
                    .hourly(List.of())
                    .build();
        }

        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode hourly = root.get("hourly");
            if (hourly == null || hourly.isNull()) {
                return WeatherForecastDTO.builder()
                        .latitude(root.has("latitude") ? root.get("latitude").asDouble(latitude) : latitude)
                        .longitude(root.has("longitude") ? root.get("longitude").asDouble(longitude) : longitude)
                        .timezone(root.has("timezone") ? root.get("timezone").asText(tz) : tz)
                        .hourly(List.of())
                        .build();
            }

            List<String> times = toStringList(hourly.get("time"));
            List<Double> temps = toDoubleList(hourly.get("temperature_2m"));
            List<Double> prec = toDoubleList(hourly.get("precipitation"));
            List<Double> rain = toDoubleList(hourly.get("rain"));
            List<Double> snow = toDoubleList(hourly.get("snowfall"));

            int n = maxSize(times, temps, prec, rain, snow);
            List<HourlyWeatherPointDTO> points = new ArrayList<>(n);
            for (int i = 0; i < n; i++) {
                points.add(HourlyWeatherPointDTO.builder()
                        .time(getOrNull(times, i))
                        .temperatureC(getOrNull(temps, i))
                        .precipitationMm(getOrNull(prec, i))
                        .rainMm(getOrNull(rain, i))
                        .snowfallCm(getOrNull(snow, i))
                        .build());
            }

            return WeatherForecastDTO.builder()
                    .latitude(root.has("latitude") ? root.get("latitude").asDouble(latitude) : latitude)
                    .longitude(root.has("longitude") ? root.get("longitude").asDouble(longitude) : longitude)
                    .timezone(root.has("timezone") ? root.get("timezone").asText(tz) : tz)
                    .hourly(points)
                    .build();
        } catch (Exception e) {
            log.warn("Parse Open-Meteo impossible: {}", e.getMessage());
            return WeatherForecastDTO.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .timezone(tz)
                    .hourly(List.of())
                    .build();
        }
    }

    private static int maxSize(List<?>... lists) {
        int m = 0;
        for (List<?> l : lists) {
            if (l != null) {
                m = Math.max(m, l.size());
            }
        }
        return m;
    }

    private static <T> T getOrNull(List<T> list, int idx) {
        if (list == null || idx < 0 || idx >= list.size()) return null;
        return list.get(idx);
    }

    private static List<String> toStringList(JsonNode node) {
        if (node == null || node.isNull() || !node.isArray()) return List.of();
        List<String> out = new ArrayList<>(node.size());
        for (JsonNode n : node) {
            out.add(n.isNull() ? null : n.asText());
        }
        return out;
    }

    private static List<Double> toDoubleList(JsonNode node) {
        if (node == null || node.isNull() || !node.isArray()) return List.of();
        List<Double> out = new ArrayList<>(node.size());
        for (JsonNode n : node) {
            out.add(n == null || n.isNull() ? null : n.asDouble());
        }
        return out;
    }
}

