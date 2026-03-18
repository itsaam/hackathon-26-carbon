package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.ocr.DpeOcrRequestDTO;
import com.hackathon.carbon.dto.ocr.DpeOcrResponseDTO;
import com.hackathon.carbon.service.DpeAnalysisService;
import com.hackathon.carbon.service.DpeOcrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
public class OcrController {

    private final DpeOcrService dpeOcrService;
    private final DpeAnalysisService dpeAnalysisService;

    @PostMapping("/dpe")
    public ResponseEntity<DpeOcrResponseDTO> ocrDpe(@RequestBody DpeOcrRequestDTO req) throws Exception {
        if (req == null) {
            return ResponseEntity.badRequest().build();
        }

        String rawText;
        if (req.getPdfBase64() != null && !req.getPdfBase64().isBlank()) {
            rawText = dpeOcrService.extractTextFromPdfBase64(req.getPdfBase64());
        } else if (req.getImageBase64() != null && !req.getImageBase64().isBlank()) {
            try {
                rawText = dpeOcrService.ocrImageBase64(req.getImageBase64());
            } catch (IllegalStateException e) {
                // OCR pas configuré sur le serveur
                return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                        .body(DpeOcrResponseDTO.builder()
                                .rawText("")
                                .fields(java.util.List.of(new com.hackathon.carbon.dto.ocr.DpeOcrFieldDTO(
                                        "Erreur",
                                        "OCR image non configuré sur le serveur. Installez Tesseract et définissez app.ocr.tesseractPath."
                                )))
                                .build());
            }
        } else {
            return ResponseEntity.badRequest().build();
        }

        var fields = dpeAnalysisService.extractFields(rawText);
        return ResponseEntity.ok(DpeOcrResponseDTO.builder()
                .rawText(rawText == null ? "" : rawText)
                .fields(fields)
                .build());
    }
}

