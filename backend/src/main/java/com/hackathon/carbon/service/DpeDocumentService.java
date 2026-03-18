package com.hackathon.carbon.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.carbon.dto.dpe.DpeDocumentDTO;
import com.hackathon.carbon.entity.DpeDocument;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.entity.User;
import com.hackathon.carbon.repository.DpeDocumentRepository;
import com.hackathon.carbon.repository.SiteRepository;
import com.hackathon.carbon.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DpeDocumentService {

    private final DpeDocumentRepository dpeDocumentRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;
    private final DpeOcrService dpeOcrService;
    private final DpeLlmAnalysisService dpeLlmAnalysisService;
    private final ObjectMapper objectMapper;

    @Transactional
    public DpeDocumentDTO uploadAndAnalyze(Long siteId, String filename, String mimeType, byte[] pdfBytes) throws Exception {
        User user = requireCurrentUser();
        Site site = requireAccessibleSite(siteId, user);

        String pdfBase64 = java.util.Base64.getEncoder().encodeToString(pdfBytes);
        String rawText = dpeOcrService.extractTextFromPdfBase64(pdfBase64);
        Map<String, Object> analysis = dpeLlmAnalysisService.analyzeFromText(rawText);

        String llmJson = objectMapper.writeValueAsString(analysis);
        String address = analysis.get("adresse") instanceof String ? (String) analysis.get("adresse") : null;
        Double surface = toDouble(analysis.get("surfaceHabitableM2"));

        DpeDocument doc = DpeDocument.builder()
                .site(site)
                .user(user)
                .filename(filename != null ? filename : "dpe.pdf")
                .mimeType(mimeType != null ? mimeType : "application/pdf")
                .pdfBytes(pdfBytes)
                .rawText(rawText)
                .llmJson(llmJson)
                .address(address)
                .surfaceM2(surface)
                .build();
        doc = dpeDocumentRepository.save(doc);

        return toDTO(doc, analysis);
    }

    @Transactional(readOnly = true)
    public List<DpeDocumentDTO> listForSite(Long siteId) {
        User user = requireCurrentUser();
        requireAccessibleSite(siteId, user);
        return dpeDocumentRepository.findBySiteIdOrderByUploadedAtDesc(siteId)
                .stream()
                .map(doc -> toDTO(doc, parseJsonSafe(doc.getLlmJson())))
                .toList();
    }

    @Transactional(readOnly = true)
    public DpeDocument requireForDownload(Long siteId, Long dpeId) {
        User user = requireCurrentUser();
        requireAccessibleSite(siteId, user);
        return dpeDocumentRepository.findByIdAndSiteId(dpeId, siteId)
                .orElseThrow(() -> new EntityNotFoundException("DPE introuvable"));
    }

    private DpeDocumentDTO toDTO(DpeDocument doc, Map<String, Object> analysis) {
        return DpeDocumentDTO.builder()
                .id(doc.getId())
                .siteId(doc.getSite() != null ? doc.getSite().getId() : null)
                .filename(doc.getFilename())
                .mimeType(doc.getMimeType())
                .uploadedAt(doc.getUploadedAt())
                .address(doc.getAddress())
                .surfaceM2(doc.getSurfaceM2())
                .analysis(analysis)
                .build();
    }

    private User requireCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalArgumentException("Non authentifié");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
    }

    private Site requireAccessibleSite(Long siteId, User user) {
        Site site = siteRepository.findByIdWithUserAndAllowedUsers(siteId).stream().findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé"));
        if (user == null) return site;
        if ("ADMIN".equalsIgnoreCase(user.getRole())) return site;
        Long uid = user.getId();
        boolean owner = site.getUser() != null && Objects.equals(site.getUser().getId(), uid);
        boolean allowed = site.getAllowedUsers() != null && site.getAllowedUsers().stream()
                .filter(Objects::nonNull)
                .anyMatch(u -> Objects.equals(u.getId(), uid));
        if (!owner && !allowed) {
            throw new IllegalArgumentException("Accès refusé");
        }
        return site;
    }

    private Map<String, Object> parseJsonSafe(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Map.of("raw", json);
        }
    }

    private static Double toDouble(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.doubleValue();
        if (v instanceof String s) {
            try {
                return Double.parseDouble(s.replace(",", ".").trim());
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }
}

