package com.hackathon.carbon.service;

import com.hackathon.carbon.dto.ocr.DpeOcrFieldDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DpeAnalysisService {

    private static final Pattern ADDRESS_BLOCK = Pattern.compile("Adresse\\s*:\\s*(.+?)(?:\\n\\s*\\(|\\n\\s*Type de bien\\s*:|\\n\\s*Année de construction\\s*:|\\n\\s*Surface habitable\\s*:)", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern TYPE_BIEN = Pattern.compile("Type de bien\\s*:\\s*(.+)", Pattern.CASE_INSENSITIVE);
    private static final Pattern ANNEE_CONSTRUCTION = Pattern.compile("Année de construction\\s*:\\s*(.+)", Pattern.CASE_INSENSITIVE);
    private static final Pattern SURFACE = Pattern.compile("Surface habitable\\s*:\\s*([0-9]+(?:[\\.,][0-9]+)?)\\s*m²", Pattern.CASE_INSENSITIVE);
    private static final Pattern ETABLI_LE = Pattern.compile("Etabli le\\s*:\\s*([0-9]{2}/[0-9]{2}/[0-9]{4})", Pattern.CASE_INSENSITIVE);
    private static final Pattern VALABLE_JUSQU = Pattern.compile("Valable jusqu[’']?au\\s*:\\s*([0-9]{2}/[0-9]{2}/[0-9]{4})", Pattern.CASE_INSENSITIVE);
    private static final Pattern COUTS = Pattern.compile("entre\\s*([0-9\\s]+)\\s*€\\s*et\\s*([0-9\\s]+)\\s*€\\s*par an", Pattern.CASE_INSENSITIVE);
    private static final Pattern CO2_AN = Pattern.compile("Ce logement émet\\s*([0-9\\s]+)\\s*kg\\s*de\\s*CO.?2\\s*par\\s*an", Pattern.CASE_INSENSITIVE);

    public List<DpeOcrFieldDTO> extractFields(String rawText) {
        String text = rawText == null ? "" : rawText;
        List<DpeOcrFieldDTO> fields = new ArrayList<>();

        addIfMatch(fields, "Établi le", match1(text, ETABLI_LE));
        addIfMatch(fields, "Valable jusqu’au", match1(text, VALABLE_JUSQU));

        String address = normalizeWhitespace(match1(text, ADDRESS_BLOCK));
        if (address != null) {
            fields.add(new DpeOcrFieldDTO("Adresse", address));
        }

        addIfMatch(fields, "Type de bien", match1(text, TYPE_BIEN));
        addIfMatch(fields, "Année de construction", match1(text, ANNEE_CONSTRUCTION));

        String surface = match1(text, SURFACE);
        if (surface != null) {
            fields.add(new DpeOcrFieldDTO("Surface habitable (m²)", surface.replace(",", ".")));
        }

        String coutMin = null;
        String coutMax = null;
        Matcher mCout = COUTS.matcher(text);
        if (mCout.find()) {
            coutMin = normalizeNumberSpaces(mCout.group(1));
            coutMax = normalizeNumberSpaces(mCout.group(2));
        }
        if (coutMin != null && coutMax != null) {
            fields.add(new DpeOcrFieldDTO("Coûts annuels estimés (€)", coutMin + " – " + coutMax));
        }

        String co2KgAn = match1(text, CO2_AN);
        if (co2KgAn != null) {
            fields.add(new DpeOcrFieldDTO("Émissions (kgCO₂/an)", normalizeNumberSpaces(co2KgAn)));
        }

        return fields;
    }

    private static void addIfMatch(List<DpeOcrFieldDTO> fields, String label, String value) {
        String v = normalizeWhitespace(value);
        if (v != null && !v.isBlank()) {
            fields.add(new DpeOcrFieldDTO(label, v));
        }
    }

    private static String match1(String text, Pattern p) {
        if (text == null) return null;
        Matcher m = p.matcher(text);
        if (!m.find()) return null;
        String g = m.group(1);
        return g != null ? g.trim() : null;
    }

    private static String normalizeWhitespace(String input) {
        if (input == null) return null;
        String s = input.replace('\u00A0', ' ');
        s = s.replaceAll("[\\t\\r]+", " ");
        s = s.replaceAll(" +", " ").trim();
        // conserve les retours ligne utiles (adresse sur 2 lignes)
        s = s.replaceAll(" *\\n *", "\n").trim();
        return s.isBlank() ? null : s;
    }

    private static String normalizeNumberSpaces(String input) {
        if (input == null) return null;
        return input.replace('\u00A0', ' ').replaceAll("\\s+", "").trim();
    }
}

