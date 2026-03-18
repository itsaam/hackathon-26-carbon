package com.hackathon.carbon.service;

import com.hackathon.carbon.dto.llm.OllamaGenerateRequestDTO;
import com.hackathon.carbon.dto.llm.OllamaGenerateResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OllamaService {

    @Value("${app.ollama.baseUrl:http://127.0.0.1:11434}")
    private String baseUrl;

    @Value("${app.ollama.model:llama3.1:8b}")
    private String model;

    private final WebClient.Builder webClientBuilder;

    public String generate(String prompt) {
        WebClient client = webClientBuilder.baseUrl(baseUrl).build();
        OllamaGenerateRequestDTO req = OllamaGenerateRequestDTO.builder()
                .model(model)
                .prompt(prompt)
                .stream(false)
                .options(Map.of(
                        "temperature", 0.1,
                        "num_ctx", 8192
                ))
                .build();

        try {
            OllamaGenerateResponseDTO res = client.post()
                    .uri("/api/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(OllamaGenerateResponseDTO.class)
                    .timeout(Duration.ofSeconds(90))
                    .block();
            return res != null ? res.getResponse() : null;
        } catch (Exception e) {
            log.warn("Ollama generate failed: {}", e.getMessage());
            throw new IllegalStateException("Analyse LLM indisponible (Ollama): " + e.getMessage());
        }
    }
}

