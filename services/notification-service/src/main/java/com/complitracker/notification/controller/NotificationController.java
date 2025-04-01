package com.complitracker.notification.controller;

import com.complitracker.notification.dto.NotificationDTO;
import com.complitracker.notification.model.Notification;
import com.complitracker.notification.model.NotificationPreference;
import com.complitracker.notification.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Validated
public class NotificationController {
    @Autowired(required = false)
    private EmailService emailService;
    @Autowired(required = false)
    private SMSService smsService;

    private final NotificationService notificationService;
    private final WhatsAppService whatsAppService;
    private final PushNotificationService pushService;
    
    @PostMapping
    public ResponseEntity<Void> sendNotification(@Valid @RequestBody NotificationDTO.NotificationRequest request) {
        notificationService.sendNotification(
            request.getUserId(),
            request.getTitle(),
            request.getMessage(),
            request.getType()
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(
        @PathVariable String userId,
        @RequestParam(defaultValue = "false") boolean unreadOnly
    ) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId, unreadOnly));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        notificationService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/preferences/{userId}")
    public ResponseEntity<NotificationPreference> getUserPreferences(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getUserPreferences(userId));
    }

    @PutMapping("/preferences/{userId}")
    public ResponseEntity<Void> updatePreferences(
        @PathVariable String userId,
        @Valid @RequestBody NotificationDTO.PreferenceUpdateRequest request
    ) {
        notificationService.updateNotificationPreferences(
            userId,
            request.getType(),
            request.getChannels()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/compliance-deadline")
    public ResponseEntity<Void> sendComplianceDeadlineNotification(
        @Valid @RequestBody NotificationDTO.ComplianceDeadlineRequest request
    ) {
        notificationService.sendComplianceDeadlineNotification(
            request.getUserId(),
            request.getComplianceTitle(),
            request.getDeadline()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/signature-request")
    public ResponseEntity<Void> sendSignatureRequestNotification(
        @Valid @RequestBody NotificationDTO.SignatureRequest request
    ) {
        notificationService.sendSignatureRequestNotification(
            request.getUserId(),
            request.getDocumentTitle()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/risk-alert")
    public ResponseEntity<Void> sendRiskAlertNotification(
        @Valid @RequestBody NotificationDTO.RiskAlertRequest request
    ) {
        notificationService.sendRiskAlertNotification(
            request.getUserId(),
            request.getComplianceTitle(),
            request.getRiskLevel()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/email")
    public ResponseEntity<Void> sendEmailNotification(
        @Valid @RequestBody NotificationDTO.NotificationRequest request
    ) {
        emailService.sendEmail(
            request.getUserId(),
            request.getTitle(),
            request.getMessage()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sms")
    public ResponseEntity<Void> sendSMSNotification(
        @Valid @RequestBody NotificationDTO.SMSRequest request
    ) {
        smsService.sendSMS(
            request.getUserId(),
            request.getMessage()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/whatsapp")
    public ResponseEntity<Void> sendWhatsAppNotification(
        @Valid @RequestBody NotificationDTO.WhatsAppRequest request
    ) {
        whatsAppService.sendWhatsAppMessage(
            request.getUserId(),
            request.getMessage()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/push")
    public ResponseEntity<Void> sendPushNotification(
        @Valid @RequestBody NotificationDTO.PushNotificationRequest request
    ) {
        pushService.sendPushNotification(
            request.getUserId(),
            request.getTitle(),
            request.getMessage()
        );
        return ResponseEntity.ok().build();
    }
}