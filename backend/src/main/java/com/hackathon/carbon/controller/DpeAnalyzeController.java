package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.dpe.DpeAnalyzeRequestDTO;
import com.hackathon.carbon.dto.dpe.DpeAnalyzeResponseDTO;
import com.hackathon.carbon.service.DpeLlmAnalysisService;
import com.hackathon.carbon.service.DpeOcrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dpe")
@RequiredArgsConstructor
public class DpeAnalyzeController {

    private final DpeOcrService dpeOcrService;
    private final DpeLlmAnalysisService dpeLlmAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<DpeAnalyzeResponseDTO> analyze(@RequestBody DpeAnalyzeRequestDTO req) {
        if (req == null) return ResponseEntity.badRequest().build();

        String rawText = null;
        try {
            if (req.getRawText() != null && !req.getRawText().isBlank()) {
                rawText = req.getRawText();
            } else if (req.getPdfBase64() != null && !req.getPdfBase64().isBlank()) {
                rawText = dpeOcrService.extractTextFromPdfBase64(req.getPdfBase64());
            } else {
                return ResponseEntity.badRequest().build();
            }

            var data = dpeLlmAnalysisService.analyzeFromText(rawText);
            return ResponseEntity.ok(DpeAnalyzeResponseDTO.builder()
                    .rawText(rawText == null ? "" : rawText)
                    .data(data)
                    .build());
        } catch (Exception e) {
            // On renvoie 200 pour affichage direct mobile
            return ResponseEntity.ok(DpeAnalyzeResponseDTO.builder()
                    .rawText(rawText == null ? "" : rawText)
                    .data(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Erreur analyse DPE"))
                    .build());
        }
    }
}

