package com.hackathon.carbon.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.awt.image.BufferedImage;
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
        File input = new File(tmpDir, "dpe-" + id + ".png");
        File outBase = new File(tmpDir, "dpe-" + id);

        try {
            // Pré-traitement: décodage → grayscale + binarisation simple → PNG.
            // Améliore fortement Tesseract sur des photos (reflets, contraste faible).
            BufferedImage src = ImageIO.read(new ByteArrayInputStream(bytes));
            if (src == null) {
                // Fallback brut si ImageIO ne sait pas décoder le format.
                Files.write(input.toPath(), bytes);
            } else {
                BufferedImage pre = toBinarizedGrayscale(src);
                ImageIO.write(pre, "png", input);
            }

            // tesseract <input> <outBase> -l fra --dpi 300 --oem 1 --psm 6
            ProcessBuilder pb = new ProcessBuilder(
                    exe,
                    input.getAbsolutePath(),
                    outBase.getAbsolutePath(),
                    "-l", tesseractLang,
                    "--dpi", "300",
                    "--oem", "1",
                    "--psm", "6",
                    "-c", "preserve_interword_spaces=1"
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

    private static BufferedImage toBinarizedGrayscale(BufferedImage src) {
        int w = src.getWidth();
        int h = src.getHeight();

        // 1) Grayscale + histogram
        int[] hist = new int[256];
        int[][] gray = new int[h][w];
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int rgb = src.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                int v = (int) Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                if (v < 0) v = 0;
                if (v > 255) v = 255;
                gray[y][x] = v;
                hist[v]++;
            }
        }

        // 2) Otsu threshold
        int total = w * h;
        double sum = 0;
        for (int t = 0; t < 256; t++) sum += (double) t * hist[t];

        double sumB = 0;
        int wB = 0;
        int wF;
        double varMax = -1;
        int threshold = 160; // fallback
        for (int t = 0; t < 256; t++) {
            wB += hist[t];
            if (wB == 0) continue;
            wF = total - wB;
            if (wF == 0) break;
            sumB += (double) t * hist[t];
            double mB = sumB / wB;
            double mF = (sum - sumB) / wF;
            double varBetween = (double) wB * (double) wF * (mB - mF) * (mB - mF);
            if (varBetween > varMax) {
                varMax = varBetween;
                threshold = t;
            }
        }

        // 3) Binarize
        BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_BYTE_BINARY);
        int black = 0xFF000000;
        int white = 0xFFFFFFFF;
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int v = gray[y][x];
                out.setRGB(x, y, (v < threshold) ? black : white);
            }
        }
        return out;
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

