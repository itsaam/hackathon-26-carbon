package com.hackathon.carbon.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DpeLlmAnalysisService {

    private final OllamaService ollamaService;
    private final ObjectMapper objectMapper;

    public Map<String, Object> analyzeFromText(String rawText) {
        String text = rawText == null ? "" : rawText.trim();
        if (text.isBlank()) {
            return Map.of("error", "Texte DPE vide.");
        }

        String prompt = buildPrompt(text);
        String out = ollamaService.generate(prompt);
        if (out == null || out.isBlank()) {
            return Map.of("error", "Réponse vide du modèle.");
        }

        String json = extractJsonObject(out);
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            // fallback : renvoyer le brut pour debug côté client
            return Map.of(
                    "error", "Impossible de parser le JSON du modèle.",
                    "rawModelOutput", out
            );
        }
    }

    private static String buildPrompt(String text) {
        // Important: demander uniquement du JSON pour parsing fiable.
        return """
Tu es un extracteur de données et générateur de conseils pour un DPE (Diagnostic de Performance Énergétique) français.

À partir du TEXTE ci-dessous, extrais les champs et réponds UNIQUEMENT avec un JSON valide (sans markdown, sans texte autour).

Champs attendus (laisser null si introuvable):
{
  "adresse": string|null,
  "typeBien": string|null,
  "anneeConstruction": string|null,
  "surfaceHabitableM2": number|null,
  "etabliLe": string|null,
  "valableJusquAu": string|null,
  "coutAnnuelMinEur": number|null,
  "coutAnnuelMaxEur": number|null,
  "emissionsKgCo2ParAn": number|null,
  "numeroAdeme": string|null,
  "resume": string,
  "conseils": string[]
}

Règles:
- Les nombres doivent être des nombres JSON (pas de texte, pas d'unité).
- Les dates au format JJ/MM/AAAA si possible.
- Pour l'adresse, concatène les lignes.
- Le champ "resume" doit être court (1 à 3 phrases) et utile pour un écran \"détail site\".
- Le champ "conseils" doit contenir 3 à 7 conseils actionnables, basés sur ce qui est présent dans le DPE.
- Si tu manques d'infos, propose des conseils génériques adaptés (isolation, chauffage, ECS, ventilation, réglages, etc.).

TEXTE:
\"\"\"%s\"\"\"
""".formatted(text);
    }

    private static String extractJsonObject(String s) {
        String t = s.trim();
        int start = t.indexOf('{');
        int end = t.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return t.substring(start, end + 1).trim();
        }
        // Sinon, on renvoie tel quel (ça fera échouer le parse mais on récupère rawModelOutput).
        return t;
    }
}

