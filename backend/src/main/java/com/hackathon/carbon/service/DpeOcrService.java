package com.hackathon.carbon.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class DpeOcrService {

    public String extractTextFromPdfBase64(String pdfBase64) throws IOException {
        byte[] bytes = Base64.getDecoder().decode(cleanBase64(pdfBase64));
        try (PDDocument doc = PDDocument.load(new ByteArrayInputStream(bytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private static String cleanBase64(String b64) {
        if (b64 == null) return "";
        String s = b64.trim();
        int comma = s.indexOf(',');
        if (s.startsWith("data:") && comma >= 0) {
            s = s.substring(comma + 1);
        }
        return s;
    }
}

