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
    public ResponseEntity<DpeOcrResponseDTO> ocrDpe(@RequestBody DpeOcrRequestDTO req) {
        if (req == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String rawText;
            if (req.getPdfBase64() != null && !req.getPdfBase64().isBlank()) {
                rawText = dpeOcrService.extractTextFromPdfBase64(req.getPdfBase64());
            } else if (req.getImageBase64() != null && !req.getImageBase64().isBlank()) {
                rawText = dpeOcrService.ocrImageBase64(req.getImageBase64());
            } else {
                return ResponseEntity.badRequest().build();
            }

            var fields = dpeAnalysisService.extractFields(rawText);
            return ResponseEntity.ok(DpeOcrResponseDTO.builder()
                    .rawText(rawText == null ? "" : rawText)
                    .fields(fields)
                    .build());
        } catch (IllegalStateException e) {
            // Cas typique: OCR non configuré ou tesseract en échec.
            return ResponseEntity.ok(DpeOcrResponseDTO.builder()
                    .rawText("")
                    .fields(java.util.List.of(new com.hackathon.carbon.dto.ocr.DpeOcrFieldDTO(
                            "Erreur OCR",
                            e.getMessage() != null ? e.getMessage() : "Erreur OCR"
                    )))
                    .build());
        } catch (Exception e) {
            // On renvoie 200 avec un message lisible par l'app mobile (plutôt qu'un 500 générique).
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.ok(DpeOcrResponseDTO.builder()
                    .rawText("")
                    .fields(java.util.List.of(new com.hackathon.carbon.dto.ocr.DpeOcrFieldDTO(
                            "Erreur serveur",
                            msg
                    )))
                    .build());
        }
    }
}

