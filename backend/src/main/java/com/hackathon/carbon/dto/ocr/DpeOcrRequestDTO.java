package com.hackathon.carbon.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DpeOcrRequestDTO {
    /**
     * Image encodée en base64 (PNG/JPEG), sans préfixe data:.
     */
    private String imageBase64;

    /**
     * PDF encodé en base64 (optionnel).
     */
    private String pdfBase64;
}

