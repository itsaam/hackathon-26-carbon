package com.hackathon.carbon.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.carbon.dto.GeocodeResultDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GeocodingService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.geocoding.nominatim-base-url:https://nominatim.openstreetmap.org}")
    private String nominatimBaseUrl;

    @Value("${app.geocoding.user-agent:carbon-hackathon-26-demo}")
    private String userAgent;

    public List<GeocodeResultDTO> search(String query) {
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = nominatimBaseUrl
                    + "/search?format=json&addressdetails=1&limit=5&q=" + encoded;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", userAgent)
                    .header("Accept-Language", "fr")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return List.of();
            }

            JsonNode root = objectMapper.readTree(response.body());
            List<GeocodeResultDTO> results = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    JsonNode addr = node.path("address");
                    String houseNumber = addr.path("house_number").asText("");
                    String road = firstNonEmpty(
                            addr.path("road").asText(""),
                            addr.path("pedestrian").asText(""),
                            addr.path("footway").asText("")
                    );
                    String street = (houseNumber + " " + road).trim();
                    String display = node.path("display_name").asText("");

                    String label = street.isEmpty() ? display : street + " — " + display;

                    GeocodeResultDTO dto = GeocodeResultDTO.builder()
                            .label(label)
                            .street(street.isEmpty() ? display : street)
                            .postalCode(addr.path("postcode").asText(""))
                            .city(firstNonEmpty(
                                    addr.path("city").asText(""),
                                    addr.path("town").asText(""),
                                    addr.path("village").asText("")
                            ))
                            .country(addr.path("country").asText(""))
                            .lat(parseDouble(node.path("lat").asText(null)))
                            .lon(parseDouble(node.path("lon").asText(null)))
                            .build();
                    results.add(dto);
                }
            }
            return results;
        } catch (IOException | InterruptedException e) {
            return List.of();
        }
    }

    private String firstNonEmpty(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return "";
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

