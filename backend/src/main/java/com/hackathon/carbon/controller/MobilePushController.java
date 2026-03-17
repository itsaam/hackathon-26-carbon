package com.hackathon.carbon.controller;

import com.hackathon.carbon.entity.User;
import com.hackathon.carbon.repository.UserRepository;
import com.hackathon.carbon.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mobile")
@RequiredArgsConstructor
public class MobilePushController {

    private final UserRepository userRepository;
    private final PushNotificationService pushNotificationService;

    @PostMapping("/push-token")
    public ResponseEntity<Void> registerPushToken(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String expoPushToken = body != null ? body.get("expoPushToken") : null;
        if (expoPushToken == null || expoPushToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        pushNotificationService.registerToken(user, expoPushToken.trim());
        return ResponseEntity.noContent().build();
    }
}
