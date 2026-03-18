package com.hackathon.carbon.dto.dpe;

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
public class DpeAnalyzeResponseDTO {
    private String rawText;
    private Map<String, Object> data;
}

