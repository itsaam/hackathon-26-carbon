package com.hackathon.carbon.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DpeOcrResponseDTO {
    private String rawText;
    private List<DpeOcrFieldDTO> fields;
}

