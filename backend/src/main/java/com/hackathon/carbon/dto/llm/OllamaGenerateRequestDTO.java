package com.hackathon.carbon.dto.llm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OllamaGenerateRequestDTO {
    private String model;
    private String prompt;
    private Boolean stream;
    private Map<String, Object> options;
}

