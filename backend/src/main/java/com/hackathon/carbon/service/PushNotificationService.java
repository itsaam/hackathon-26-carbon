package com.hackathon.carbon.service;

import com.hackathon.carbon.entity.CarbonResult;
import com.hackathon.carbon.entity.PushToken;
import com.hackathon.carbon.entity.Site;
import com.hackathon.carbon.entity.User;
import com.hackathon.carbon.repository.PushTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Envoi de notifications push Expo aux utilisateurs (mobile).
 * Seuils "gros dépassement" alignés sur le frontend : co2/m² > 35 kg ou co2/employé > 800 kg = alerte.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    private static final double THRESHOLD_CO2_PER_M2_KG = 35.0;
    private static final double THRESHOLD_CO2_PER_EMPLOYEE_KG = 800.0;

    private final PushTokenRepository pushTokenRepository;
    private final WebClient.Builder webClientBuilder;

    @Transactional
    public void registerToken(User user, String expoPushToken) {
        if (user == null || expoPushToken == null || !expoPushToken.startsWith("ExponentPushToken[")) {
            return;
        }
        if (pushTokenRepository.findByUserIdAndExpoPushToken(user.getId(), expoPushToken).isPresent()) {
            return;
        }
        PushToken token = PushToken.builder()
                .user(user)
                .expoPushToken(expoPushToken)
                .build();
        pushTokenRepository.save(token);
    }

    /**
     * Envoie une notification à tous les utilisateurs ayant accès au site lorsque le recalcul
     * dépasse fortement les seuils CO2 (classe D).
     */
    public void notifyIfThresholdExceeded(Site site, CarbonResult result) {
        if (site == null || result == null) return;

        Double co2PerM2 = result.getCo2PerM2();
        Double co2PerEmployee = result.getCo2PerEmployee();
        boolean overM2 = co2PerM2 != null && co2PerM2 > THRESHOLD_CO2_PER_M2_KG;
        boolean overEmployee = co2PerEmployee != null && co2PerEmployee > THRESHOLD_CO2_PER_EMPLOYEE_KG;
        if (!overM2 && !overEmployee) return;

        Set<Long> userIds = new HashSet<>();
        if (site.getUser() != null) userIds.add(site.getUser().getId());
        if (site.getAllowedUsers() != null) {
            site.getAllowedUsers().stream()
                    .filter(Objects::nonNull)
                    .forEach(u -> userIds.add(u.getId()));
        }
        if (userIds.isEmpty()) return;

        List<String> tokens = pushTokenRepository.findByUserIdIn(List.copyOf(userIds))
                .stream()
                .map(PushToken::getExpoPushToken)
                .distinct()
                .collect(Collectors.toList());
        if (tokens.isEmpty()) return;

        String siteName = site.getName() != null ? site.getName() : "Site";
        String totalT = result.getTotalCo2Kg() != null
                ? String.format("%.1f", result.getTotalCo2Kg() / 1000.0)
                : "—";
        String title = "Dépassement CO₂ — " + siteName;
        String body = String.format(
                "Le recalcul place le site au-dessus des seuils (classe D). Total : %s tCO₂e. Consultez le détail.",
                totalT
        );
        Map<String, Object> data = new HashMap<>();
        data.put("type", "co2_threshold_exceeded");
        data.put("siteId", site.getId());
        data.put("siteName", siteName);

        sendExpoPush(tokens, title, body, data);
    }

    private void sendExpoPush(List<String> toTokens, String title, String body, Map<String, Object> data) {
        if (toTokens.isEmpty()) return;
        List<Map<String, Object>> messages = toTokens.stream()
                .map(token -> {
                    Map<String, Object> msg = new HashMap<>();
                    msg.put("to", token);
                    msg.put("title", title);
                    msg.put("body", body);
                    if (data != null) msg.put("data", data);
                    msg.put("sound", "default");
                    return msg;
                })
                .toList();

        try {
            WebClient client = webClientBuilder.build();
            client.post()
                    .uri(EXPO_PUSH_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(messages)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            log.debug("Expo push sent to {} token(s)", toTokens.size());
        } catch (Exception e) {
            log.warn("Failed to send Expo push: {}", e.getMessage());
        }
    }
}
