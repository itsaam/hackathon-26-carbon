package com.hackathon.carbon.dto.dpe;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DpeAnalyzeRequestDTO {
    private String pdfBase64;
    private String rawText;
}

