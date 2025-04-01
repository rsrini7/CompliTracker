package com.complitracker.notification.dto;

import com.complitracker.notification.model.NotificationChannel;
import com.complitracker.notification.model.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

public class NotificationDTO {

    @Data
    public static class NotificationRequest {
        @NotBlank
        private String userId;
        @NotBlank
        private String title;
        @NotBlank
        private String message;
        @NotNull
        private NotificationType type;
    }

    @Data
    public static class PreferenceUpdateRequest {
        @NotNull
        private NotificationType type;
        @NotNull
        private Set<NotificationChannel> channels;
    }

    @Data
    public static class ComplianceDeadlineRequest {
        @NotBlank
        private String userId;
        @NotBlank
        private String complianceTitle;
        @NotNull
        private LocalDateTime deadline;
    }

    @Data
    public static class SignatureRequest {
        @NotBlank
        private String userId;
        @NotBlank
        private String documentTitle;
    }

    @Data
    public static class RiskAlertRequest {
        @NotBlank
        private String userId;
        @NotBlank
        private String complianceTitle;
        @NotBlank
        private String riskLevel;
    }

    @Data
    public static class SMSRequest {
        @NotBlank
        private String userId;
        @NotBlank
        private String message;
    }

    @Data
    public static class WhatsAppRequest {
        @NotBlank
        private String userId;
        @NotBlank
        private String message;
    }

    @Data
    public static class PushNotificationRequest {
        @NotBlank
        private String userId;
        @NotBlank
        private String title;
        @NotBlank
        private String message;
    }
}