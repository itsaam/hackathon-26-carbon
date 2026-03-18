package com.hackathon.carbon.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Base64;
import java.util.UUID;

@Service
public class DpeOcrService {

    /**
     * Chemin vers l'exécutable tesseract (optionnel).
     * Exemple Windows: C:\\Program Files\\Tesseract-OCR\\tesseract.exe
     * Exemple Linux: /usr/bin/tesseract
     */
    @Value("${app.ocr.tesseractPath:}")
    private String tesseractPath;

    @Value("${app.ocr.lang:fra}")
    private String tesseractLang;

    public String extractTextFromPdfBase64(String pdfBase64) throws IOException {
        byte[] bytes = Base64.getDecoder().decode(cleanBase64(pdfBase64));
        try (PDDocument doc = PDDocument.load(new ByteArrayInputStream(bytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    /**
     * OCR d'une image base64 via l'exécutable tesseract si disponible.
     * Si tesseract n'est pas configuré, lève une IllegalStateException.
     */
    public String ocrImageBase64(String imageBase64) throws IOException, InterruptedException {
        String exe = (tesseractPath == null) ? "" : tesseractPath.trim();
        if (exe.isBlank()) {
            throw new IllegalStateException("OCR non configuré (app.ocr.tesseractPath manquant).");
        }

        byte[] bytes = Base64.getDecoder().decode(cleanBase64(imageBase64));
        File tmpDir = new File(System.getProperty("java.io.tmpdir"));
        String id = UUID.randomUUID().toString();
        File input = new File(tmpDir, "dpe-" + id + ".img");
        File outBase = new File(tmpDir, "dpe-" + id);

        try {
            Files.write(input.toPath(), bytes);

            // tesseract <input> <outBase> -l fra --dpi 300
            ProcessBuilder pb = new ProcessBuilder(
                    exe,
                    input.getAbsolutePath(),
                    outBase.getAbsolutePath(),
                    "-l", tesseractLang,
                    "--dpi", "300"
            );
            pb.redirectErrorStream(true);
            Process p = pb.start();
            byte[] log = p.getInputStream().readAllBytes();
            int code = p.waitFor();
            if (code != 0) {
                String msg = new String(log, StandardCharsets.UTF_8);
                throw new IllegalStateException("OCR tesseract en échec: " + msg);
            }

            File outTxt = new File(outBase.getAbsolutePath() + ".txt");
            if (!outTxt.exists()) {
                throw new IllegalStateException("OCR tesseract: sortie introuvable.");
            }
            return Files.readString(outTxt.toPath(), StandardCharsets.UTF_8);
        } finally {
            // cleanup best-effort
            try { Files.deleteIfExists(input.toPath()); } catch (Exception ignored) {}
            try { Files.deleteIfExists(new File(outBase.getAbsolutePath() + ".txt").toPath()); } catch (Exception ignored) {}
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

