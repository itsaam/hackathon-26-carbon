package com.hackathon.carbon.controller;

import com.hackathon.carbon.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/{siteId}/report.pdf")
    public ResponseEntity<byte[]> getSiteReport(
            @PathVariable Long siteId,
            @RequestParam(value = "year", required = false) Integer year
    ) {
        byte[] content = reportService.generateSiteReport(siteId, year);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"site-" + siteId + "-report.pdf\"");
        return ResponseEntity.ok()
                .headers(headers)
                .body(content);
    }
}

