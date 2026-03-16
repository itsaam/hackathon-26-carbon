package com.hackathon.carbon.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.carbon.entity.EnergyFactor;
import com.hackathon.carbon.entity.Material;
import com.hackathon.carbon.repository.EnergyFactorRepository;
import com.hackathon.carbon.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Client d'intégration vers la Base Carbone ADEME (ou source équivalente).
 *
 * Pour le hackathon, cette classe prépare l'architecture pour une intégration
 * temps réel ultérieure sans effectuer d'appel externe effectif.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdemeClient {

    private final MaterialRepository materialRepository;
    private final EnergyFactorRepository energyFactorRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.ademe.base-url:https://data.ademe.fr}")
    private String baseUrl;

    /**
     * Point d'entrée pour un rafraîchissement des facteurs d'émission
     * depuis la Base Carbone ADEME.
     *
     * Implémentation : appelle le catalogue ADEME puis le jeu de données
     * Base Carbone, filtre les entrées 2026 pertinentes et met à jour
     * les facteurs d'énergie en base.
     */
    public void refreshEmissionFactors() {
        long materialsCount = materialRepository.count();
        long energyFactorsCount = energyFactorRepository.count();

        log.info("Demande de rafraîchissement des facteurs ADEME reçue (baseUrl={}).", baseUrl);
        log.info("Données locales avant synchro : {} matériaux, {} facteurs énergie.", materialsCount, energyFactorsCount);

        try {
            WebClient client = WebClient.builder()
                    .baseUrl(baseUrl)
                    .codecs(configurer -> configurer
                            .defaultCodecs()
                            .maxInMemorySize(16 * 1024 * 1024))
                    .build();

            String catalogRaw = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/data-fair/api/v1/catalog/datasets")
                            // l'API Data Fair attend 'size' et non 'rows' pour le nombre de résultats
                            .queryParam("size", 200)
                            .build())
                    .accept(MediaType.ALL)
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(ex -> {
                        log.warn("Erreur lors de l'appel à l'API ADEME (catalogue) : {}", ex.getMessage());
                        return Mono.empty();
                    })
                    .block();

            if (catalogRaw == null || catalogRaw.isBlank()) {
                log.warn("Impossible de récupérer le catalogue ADEME (corps de réponse vide).");
                return;
            }

            JsonNode catalogNode;
            try {
                catalogNode = objectMapper.readTree(catalogRaw);
            } catch (Exception parseEx) {
                log.warn("Réponse catalogue ADEME non JSON ou inattendue. Extrait: {}", catalogRaw.substring(0, Math.min(300, catalogRaw.length())));
                return;
            }

            if (catalogNode == null || !catalogNode.has("results")) {
                log.warn("Impossible de récupérer le catalogue ADEME (réponse vide ou sans champ 'results').");
                return;
            }

            JsonNode resultsNode = catalogNode.get("results");
            log.info("Catalogue ADEME accessible : {} jeux de données référencés.", resultsNode.size());

            CatalogDataset baseCarbone = null;
            for (JsonNode n : resultsNode) {
                JsonNode dataset = n.has("dataset") ? n.get("dataset") : n;
                if (dataset == null) {
                    continue;
                }
                String slug = text(dataset, "slug");
                String title = text(dataset, "title");
                String id = text(dataset, "id");
                String href = text(dataset, "href");
                if (slug == null && title == null) {
                    continue;
                }
                String slugLower = slug != null ? slug.toLowerCase() : "";
                String titleLower = title != null ? title.toLowerCase() : "";
                String slugNormalized = slugLower.replace("-", " ");
                String titleNormalized = titleLower.replace("-", " ");
                if (slugNormalized.contains("base carbone") || titleNormalized.contains("base carbone")) {
                    baseCarbone = new CatalogDataset(id, slug, title, href);
                    break;
                }
            }

            if (baseCarbone == null) {
                log.warn("Jeu de données 'Base Carbone' non trouvé dans le catalogue ADEME. Jeux disponibles :");
                for (JsonNode n : resultsNode) {
                    JsonNode dataset = n.has("dataset") ? n.get("dataset") : n;
                    if (dataset == null) {
                        continue;
                    }
                    String id = text(dataset, "id");
                    String slug = text(dataset, "slug");
                    String title = text(dataset, "title");
                    log.warn(" - id={}, slug={}, title={}", id, slug, title);
                }
                return;
            }

            final CatalogDataset baseCarboneFinal = baseCarbone;

            log.info("Jeu de données Base Carbone trouvé : id={}, slug={}, href={}", baseCarboneFinal.id(), baseCarboneFinal.slug(), baseCarboneFinal.href());

            int imported = 0;
            int examined = 0;
            String nextUri = null;
            final int pageSize = 5000;
            final int maxPages = 5;

            for (int page = 0; page < maxPages; page++) {
                String linesRaw;
                if (nextUri == null) {
                    linesRaw = client.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/data-fair/api/v1/datasets/{id}/lines")
                                    .queryParam("size", pageSize)
                                    .build(baseCarboneFinal.id()))
                            .accept(MediaType.ALL)
                            .retrieve()
                            .bodyToMono(String.class)
                            .onErrorResume(ex -> {
                                log.warn("Erreur lors de la récupération des lignes Base Carbone : {}", ex.getMessage());
                                return Mono.empty();
                            })
                            .block();
                } else {
                    linesRaw = client.get()
                            .uri(nextUri)
                            .accept(MediaType.ALL)
                            .retrieve()
                            .bodyToMono(String.class)
                            .onErrorResume(ex -> {
                                log.warn("Erreur lors de la récupération des lignes Base Carbone (page) : {}", ex.getMessage());
                                return Mono.empty();
                            })
                            .block();
                }

                if (linesRaw == null || linesRaw.isBlank()) {
                    break;
                }

                JsonNode linesNode;
                try {
                    linesNode = objectMapper.readTree(linesRaw);
                } catch (Exception parseEx) {
                    log.warn("Réponse lignes Base Carbone non JSON. Extrait: {}", linesRaw.substring(0, Math.min(500, linesRaw.length())));
                    break;
                }

                if (linesNode == null || !linesNode.has("results")) {
                    break;
                }

                nextUri = linesNode.has("next") && !linesNode.get("next").isNull()
                        ? linesNode.get("next").asText()
                        : null;

                for (JsonNode resultNode : linesNode.get("results")) {
                JsonNode fields = resultNode.has("fields") ? resultNode.get("fields") : resultNode;
                if (fields == null) {
                    continue;
                }

                examined++;

                int year = extractYear(fields);
                // On conserve une antériorité large : de 2015 à 2035
                if (year < 2015 || year > 2035) {
                    continue;
                }

                String energyLabel = textAny(fields, "Nom_base_français", "nom_francais");
                if (energyLabel == null || energyLabel.isBlank()) {
                    continue;
                }

                String energyType = mapEnergyType(energyLabel);
                if (energyType == null) {
                    continue;
                }

                Double factorKgPerKwh = extractFactorKgPerKwh(fields);
                if (factorKgPerKwh == null) {
                    continue;
                }

                String country = textAny(fields, "Localisation_géographique", "pays");

                java.util.List<EnergyFactor> factors = energyFactorRepository.findByEnergyTypeAndYear(energyType, year);
                if (factors.isEmpty()) {
                    EnergyFactor created = EnergyFactor.builder()
                            .energyType(energyType)
                            .year(year)
                            .build();
                    factors = java.util.Collections.singletonList(created);
                } else if (factors.size() > 1) {
                    log.warn("Plusieurs facteurs énergie trouvés pour type='{}', année='{}' ({} enregistrements) – mise à jour de tous.", energyType, year, factors.size());
                }

                for (EnergyFactor factor : factors) {
                    factor.setEmissionFactor(factorKgPerKwh);
                    factor.setGwpPerKwh(factorKgPerKwh);
                    factor.setCountry(country);
                    factor.setSource("ADEME Base Carbone");
                    factor.setDataSourceUrl(baseCarboneFinal.href());
                    energyFactorRepository.save(factor);
                }
                imported++;
                }

                if (nextUri == null || nextUri.isBlank()) {
                    break;
                }
            }

            long afterEnergyFactorsCount = energyFactorRepository.count();
            log.info("Synchronisation ADEME terminée : {} lignes examinées, {} facteurs importés/mis à jour. Nouveau total de facteurs énergie : {}.",
                    examined, imported, afterEnergyFactorsCount);

        } catch (Exception e) {
            log.warn("Erreur inattendue lors de l'appel à l'API ADEME : {}", e.getMessage());
        }
    }

    /**
     * Rafraîchit les matériaux ACV à partir de la Base Carbone.
     *
     * Heuristique simple :
     * - Type_de_l'élément = Facteur d'émission
     * - Unité_français contient "kgco2e/kg"
     * - Localisation_géographique = France continentale
     * - Utilise Nom_base_français comme nom de matériau
     */
    public void refreshMaterials() {
        long before = materialRepository.count();
        log.info("Rafraîchissement des matériaux ADEME demandé. Matériaux existants : {}", before);

        try {
            WebClient client = WebClient.builder()
                    .baseUrl(baseUrl)
                    .codecs(configurer -> configurer
                            .defaultCodecs()
                            .maxInMemorySize(16 * 1024 * 1024))
                    .build();

            // On réutilise la découverte du dataset Base Carbone
            String catalogRaw = client.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/data-fair/api/v1/catalog/datasets")
                            .queryParam("size", 200)
                            .build())
                    .accept(MediaType.ALL)
                    .retrieve()
                    .bodyToMono(String.class)
                    .onErrorResume(ex -> {
                        log.warn("Erreur lors de l'appel à l'API ADEME (catalogue) pour les matériaux : {}", ex.getMessage());
                        return Mono.empty();
                    })
                    .block();

            if (catalogRaw == null || catalogRaw.isBlank()) {
                log.warn("Impossible de récupérer le catalogue ADEME pour les matériaux (corps vide).");
                return;
            }

            JsonNode catalogNode = objectMapper.readTree(catalogRaw);
            if (catalogNode == null || !catalogNode.has("results")) {
                log.warn("Catalogue ADEME matériaux sans champ 'results'.");
                return;
            }

            CatalogDataset baseCarbone = null;
            for (JsonNode n : catalogNode.get("results")) {
                JsonNode dataset = n.has("dataset") ? n.get("dataset") : n;
                if (dataset == null) continue;
                String slug = text(dataset, "slug");
                String title = text(dataset, "title");
                String id = text(dataset, "id");
                String href = text(dataset, "href");
                if (slug == null && title == null) continue;
                String slugLower = slug != null ? slug.toLowerCase() : "";
                String titleLower = title != null ? title.toLowerCase() : "";
                String slugNormalized = slugLower.replace("-", " ");
                String titleNormalized = titleLower.replace("-", " ");
                if (slugNormalized.contains("base carbone") || titleNormalized.contains("base carbone")) {
                    baseCarbone = new CatalogDataset(id, slug, title, href);
                    break;
                }
            }

            if (baseCarbone == null) {
                log.warn("Jeu 'Base Carbone' non trouvé pour le rafraîchissement des matériaux.");
                return;
            }

            final CatalogDataset baseCarboneFinal = baseCarbone;
            log.info("Import matériaux ADEME depuis jeu Base Carbone id={}, slug={}", baseCarboneFinal.id(), baseCarboneFinal.slug());

            int imported = 0;
            int examined = 0;
            String nextUri = null;
            final int pageSize = 5000;
            final int maxPages = 5;

            for (int page = 0; page < maxPages; page++) {
                String linesRaw;
                if (nextUri == null) {
                    linesRaw = client.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/data-fair/api/v1/datasets/{id}/lines")
                                    .queryParam("size", pageSize)
                                    .build(baseCarboneFinal.id()))
                            .accept(MediaType.ALL)
                            .retrieve()
                            .bodyToMono(String.class)
                            .onErrorResume(ex -> {
                                log.warn("Erreur lors de la récupération des lignes matériaux ADEME : {}", ex.getMessage());
                                return Mono.empty();
                            })
                            .block();
                } else {
                    linesRaw = client.get()
                            .uri(nextUri)
                            .accept(MediaType.ALL)
                            .retrieve()
                            .bodyToMono(String.class)
                            .onErrorResume(ex -> {
                                log.warn("Erreur lors de la récupération des lignes matériaux ADEME (page) : {}", ex.getMessage());
                                return Mono.empty();
                            })
                            .block();
                }

                if (linesRaw == null || linesRaw.isBlank()) {
                    break;
                }

                JsonNode linesNode = objectMapper.readTree(linesRaw);
                if (linesNode == null || !linesNode.has("results")) {
                    break;
                }

                nextUri = linesNode.has("next") && !linesNode.get("next").isNull()
                        ? linesNode.get("next").asText()
                        : null;

                for (JsonNode resultNode : linesNode.get("results")) {
                    JsonNode fields = resultNode.has("fields") ? resultNode.get("fields") : resultNode;
                    if (fields == null) continue;

                    examined++;

                    // On ne garde que les facteurs d'émission génériques, France continentale, en kgCO2e/kg
                    String typeElement = textAny(fields, "Type_de_l'élément", "Type_de_l_element");
                    if (typeElement == null || !typeElement.equalsIgnoreCase("Facteur d'émission")) {
                        continue;
                    }

                    String country = textAny(fields, "Localisation_géographique", "pays");
                    if (country == null || !country.equalsIgnoreCase("France continentale")) {
                        continue;
                    }

                    String unite = textAny(fields, "Unité_français", "Unité_anglais", "unite");
                    if (unite == null || !unite.toLowerCase().contains("kgco2e/kg")) {
                        continue;
                    }

                    String name = textAny(fields, "Nom_base_français", "Nom_base_anglais");
                    if (name == null || name.isBlank()) {
                        continue;
                    }
                    final String materialName = normalizeMaterialName(name);

                    String categoryCode = text(fields, "Code_de_la_catégorie");
                    String category = null;
                    String subCategory = null;
                    if (categoryCode != null && !categoryCode.isBlank()) {
                        String[] parts = categoryCode.split(">");
                        if (parts.length > 0) {
                            category = parts[0].trim();
                        }
                        // Uniquement matériaux de construction (bâtiment / biens d'équipement)
                        if (!isConstructionCategory(category, categoryCode)) {
                            continue;
                        }
                        if (parts.length > 1) {
                            subCategory = java.util.Arrays.stream(parts).skip(1).map(String::trim).collect(java.util.stream.Collectors.joining(" > "));
                        }
                    }

                    JsonNode valueNode = textNodeAny(fields, "Total_poste_non_décomposé", "total_poste_non_decompose");
                    if (valueNode == null || valueNode.isNull()) {
                        continue;
                    }
                    double gwpPerKg = valueNode.asDouble();
                    if (gwpPerKg < 0) {
                        continue;
                    }

                    int year = extractYear(fields);
                    final Integer refYear = year > 0 ? year : null;

                    java.util.List<Material> existingByName = materialRepository.findByName(materialName);
                    Material material;
                    if (!existingByName.isEmpty()) {
                        material = existingByName.get(0);
                    } else {
                        material = Material.builder()
                                .name(materialName)
                                .referenceYear(refYear)
                                .build();
                    }

                    material.setEmissionFactor(gwpPerKg);
                    material.setGwpPerKg(gwpPerKg);
                    material.setReferenceYear(refYear);
                    material.setUnit("kg");
                    material.setSource("ADEME Base Carbone");
                    material.setCategory(category);
                    material.setSubCategory(subCategory);
                    material.setDataSourceUrl(baseCarboneFinal.href());

                    materialRepository.save(material);
                    imported++;
                }

                if (nextUri == null || nextUri.isBlank()) {
                    break;
                }
            }

            long after = materialRepository.count();
            log.info("Synchronisation matériaux ADEME terminée : {} lignes examinées, {} matériaux importés/mis à jour. Nouveau total de matériaux : {}.",
                    examined, imported, after);

        } catch (Exception e) {
            log.warn("Erreur inattendue lors de l'import des matériaux ADEME : {}", e.getMessage());
        }
    }

    private static int extractYear(JsonNode fields) {
        JsonNode yearNode = textNodeAny(fields, "annee", "annee_donnees");
        if (yearNode != null && !yearNode.isNull()) {
            if (yearNode.isInt()) {
                return yearNode.intValue();
            }
            try {
                return Integer.parseInt(yearNode.asText());
            } catch (NumberFormatException ignored) {
            }
        }
        String period = textAny(fields, "Période_de_validité", "periode_de_validite");
        if (period != null && !period.isBlank()) {
            try {
                if (period.length() == 4) {
                    return Integer.parseInt(period);
                }
                if (period.length() >= 10 && period.charAt(2) == '/' && period.charAt(5) == '/') {
                    return Integer.parseInt(period.substring(6, 10));
                }
                if (period.length() >= 10 && period.charAt(4) == '-') {
                    return Integer.parseInt(period.substring(0, 4));
                }
                // Formats type "juin-24", "déc-17" : on prend les 2 derniers chiffres
                int dash = period.lastIndexOf('-');
                if (dash > 0 && period.length() - dash >= 3) {
                    String yy = period.substring(dash + 1).replaceAll("[^0-9]", "");
                    if (yy.length() == 2) {
                        int year2 = Integer.parseInt(yy);
                        return (year2 >= 0 && year2 <= 50) ? 2000 + year2 : 1900 + year2;
                    }
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return -1;
    }

    private static JsonNode textNodeAny(JsonNode node, String... fieldNames) {
        if (node == null) return null;
        for (String name : fieldNames) {
            if (node.has(name) && !node.get(name).isNull()) {
                return node.get(name);
            }
        }
        return null;
    }

    private static String text(JsonNode node, String fieldName) {
        if (node == null || !node.has(fieldName) || node.get(fieldName).isNull()) {
            return null;
        }
        String v = node.get(fieldName).asText();
        return v == null || v.isBlank() ? null : v;
    }

    /** Catégories Base Carbone considérées comme matériaux de construction (bâtiment). */
    private static boolean isConstructionCategory(String category, String categoryCode) {
        if (category == null || category.isBlank()) return false;
        String c = category.toLowerCase();
        String path = (categoryCode != null ? categoryCode : "").toLowerCase();
        if (c.contains("construction") || c.contains("bâtiment") || c.contains("batiment")
                || c.contains("fabrication") || c.contains("matériaux") || c.contains("materiaux")) {
            return true;
        }
        // Achats de biens > Biens d'équipement > ... (matériaux de construction)
        if (c.contains("achats de biens") && (path.contains("équipement") || path.contains("equipement")
                || path.contains("construction") || path.contains("bâtiment") || path.contains("batiment")
                || path.contains("matériaux") || path.contains("materiaux"))) {
            return true;
        }
        return false;
    }

    /** Enlève les guillemets superflus des noms ADEME (ex. """ Salade César """ -> Salade César). */
    private static String normalizeMaterialName(String name) {
        if (name == null) return null;
        String s = name.trim();
        while (s.startsWith("\"")) {
            s = s.substring(1).trim();
        }
        while (s.endsWith("\"")) {
            s = s.substring(0, s.length() - 1).trim();
        }
        s = s.replace("\"\"\"\"", "\"").replace("\"\"\"", "\"").replace("\"\"", "\"");
        return s.trim();
    }

    private static String textAny(JsonNode node, String... fieldNames) {
        if (node == null) return null;
        for (String name : fieldNames) {
            String v = text(node, name);
            if (v != null) return v;
        }
        return null;
    }

    private static Double extractFactorKgPerKwh(JsonNode fields) {
        JsonNode valueNode = textNodeAny(fields, "Total_poste_non_décomposé", "total_poste_non_decompose");
        if (valueNode == null || valueNode.isNull()) {
            return null;
        }
        double value = valueNode.asDouble();
        String unit = textAny(fields, "Unité_français", "Unité_anglais", "unite");
        if (unit == null) {
            return null;
        }
        String u = unit.toLowerCase();
        if (u.contains("kwh")) {
            return value;
        }
        if (u.contains("mwh")) {
            return value / 1000.0;
        }
        // Conversion depuis des énergies plus génériques
        // 1 GJ = 277,777... kWh
        if (u.contains("gj")) {
            return value / 277.7778;
        }
        // 1 MJ = 0,277777... kWh -> 1 / 3,6 kWh
        if (u.contains("mj")) {
            return value / 3600.0;
        }
        return null;
    }

    private static String mapEnergyType(String label) {
        String l = label.toLowerCase();
        if (l.contains("électricité") || l.contains("electricite")) {
            if (l.contains("france")) {
                return "Électricité France";
            }
            return "Électricité";
        }
        if (l.contains("gaz naturel")) {
            return "Gaz naturel";
        }
        if (l.contains("fioul domestique")) {
            return "Fioul domestique";
        }
        return null;
    }

    private record CatalogResponse(java.util.List<CatalogDataset> results) {
    }

    private record CatalogDataset(String id, String slug, String title, String href) {
    }
}

