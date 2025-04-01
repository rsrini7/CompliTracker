package com.complitracker.core.controller;

import com.complitracker.core.model.SignatureRequest;
import com.complitracker.core.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send-status")
    public ResponseEntity<Void> sendSignatureStatusNotification(@RequestBody SignatureRequest request) {
        notificationService.sendSignatureStatusNotification(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send-reminder")
    public ResponseEntity<Void> sendReminderNotification(@RequestBody SignatureRequest request) {
        notificationService.sendReminderNotification(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send-error")
    public ResponseEntity<Void> sendErrorNotification(@RequestBody SignatureRequest request, @RequestParam String errorMessage) {
        notificationService.sendErrorNotification(request, errorMessage);
        return ResponseEntity.ok().build();
    }
}