package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.dpe.DpeDocumentDTO;
import com.hackathon.carbon.service.DpeDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/sites/{siteId}/dpe")
@RequiredArgsConstructor
public class SiteDpeController {

    private final DpeDocumentService dpeDocumentService;

    @GetMapping
    public ResponseEntity<List<DpeDocumentDTO>> list(@PathVariable Long siteId) {
        return ResponseEntity.ok(dpeDocumentService.listForSite(siteId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DpeDocumentDTO> upload(
            @PathVariable Long siteId,
            @RequestPart("file") MultipartFile file
    ) throws Exception {
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().build();
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "dpe.pdf";
        String mime = file.getContentType() != null ? file.getContentType() : "application/pdf";
        byte[] bytes = file.getBytes();
        return ResponseEntity.ok(dpeDocumentService.uploadAndAnalyze(siteId, filename, mime, bytes));
    }

    @GetMapping("/{dpeId}/file")
    public ResponseEntity<byte[]> download(@PathVariable Long siteId, @PathVariable Long dpeId) {
        var doc = dpeDocumentService.requireForDownload(siteId, dpeId);
        String filename = doc.getFilename() != null ? doc.getFilename() : "dpe.pdf";
        String mime = doc.getMimeType() != null ? doc.getMimeType() : "application/pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename.replace("\"", "") + "\"")
                .contentType(MediaType.parseMediaType(mime))
                .body(doc.getPdfBytes());
    }
}

