package com.hackathon.carbon.controller;

import com.hackathon.carbon.dto.SiteUserAccessUpdateRequestDTO;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/sites")
@RequiredArgsConstructor
public class AdminSiteController {

    private final UserRepository userRepository;
    private final SiteRepository siteRepository;

    @GetMapping("/{siteId}/user-access")
    public ResponseEntity<List<Long>> getSiteUserAccess(@PathVariable Long siteId) {
        requireAdmin();
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé"));

        List<Long> userIds = (site.getAllowedUsers() == null ? List.<User>of() : site.getAllowedUsers().stream().toList())
                .stream()
                .map(User::getId)
                .filter(id -> id != null)
                .distinct()
                .toList();

        return ResponseEntity.ok(userIds);
    }

    @PutMapping("/{siteId}/user-access")
    public ResponseEntity<Void> updateSiteUserAccess(
            @PathVariable Long siteId,
            @RequestBody SiteUserAccessUpdateRequestDTO request
    ) {
        requireAdmin();
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site non trouvé"));

        Set<Long> desired = new HashSet<>(request.getUserIds() != null ? request.getUserIds() : List.of());

        if (site.getAllowedUsers() == null) {
            site.setAllowedUsers(new HashSet<>());
        }

        // Toujours garder le propriétaire dans les accès (si présent)
        Long ownerId = site.getUser() != null ? site.getUser().getId() : null;
        if (ownerId != null) {
            desired.add(ownerId);
        }

        // Reconstruit la liste d'accès à partir des IDs désirés
        List<User> users = desired.isEmpty() ? List.of() : userRepository.findAllById(desired);
        site.setAllowedUsers(new HashSet<>(users));

        siteRepository.save(site);
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

