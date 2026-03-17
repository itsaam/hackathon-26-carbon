package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.SiteAccessUpdateRequestDTO;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.entity.User;
import com.hackathon.carbon.repository.SiteRepository;
import com.hackathon.carbon.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSiteAccessController {

    private final UserRepository userRepository;
    private final SiteRepository siteRepository;

    @GetMapping("/users/{userId}/site-access")
    public ResponseEntity<List<Long>> getUserSiteAccess(@PathVariable Long userId) {
        requireAdmin();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        // Retourne tous les sites où l'utilisateur a accès via la table site_access
        List<Long> siteIds = siteRepository.findAccessibleByUserId(user.getId()).stream()
                .map(Site::getId)
                .toList();

        return ResponseEntity.ok(siteIds);
    }

    @PutMapping("/users/{userId}/site-access")
    public ResponseEntity<Void> updateUserSiteAccess(
            @PathVariable Long userId,
            @RequestBody SiteAccessUpdateRequestDTO request
    ) {
        requireAdmin();

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        Set<Long> desired = new HashSet<>(request.getSiteIds() != null ? request.getSiteIds() : List.of());

        List<Site> allSites = siteRepository.findAll();
        for (Site site : allSites) {
            boolean isOwner = site.getUser() != null && site.getUser().getId() != null
                    && site.getUser().getId().equals(targetUser.getId());

            if (site.getAllowedUsers() == null) {
                site.setAllowedUsers(new HashSet<>());
            }

            boolean shouldHave = desired.contains(site.getId()) || isOwner;

            if (shouldHave) {
                site.getAllowedUsers().add(targetUser);
            } else {
                // Ne retire pas le propriétaire
                site.getAllowedUsers().removeIf(u -> u.getId() != null && u.getId().equals(targetUser.getId()));
            }
        }

        siteRepository.saveAll(allSites);
        return ResponseEntity.noContent().build();
    }

    private void requireAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non authentifié");
        }

        User current = userRepository.findByEmail(auth.getName()).orElse(null);
        if (current == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non authentifié");
        }
        if (current.getRole() == null || !"ADMIN".equalsIgnoreCase(current.getRole())) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Accès admin requis");
        }
    }
}

