package com.complitracker.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NotificationRequest {
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;
}