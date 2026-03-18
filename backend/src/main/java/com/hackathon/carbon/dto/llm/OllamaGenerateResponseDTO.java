package com.hackathon.carbon.dto.llm;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OllamaGenerateResponseDTO {
    private String response;
    private Boolean done;
    private String model;
}

