package com.complitracker.email.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Future;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class EmailScheduleRequest {
    @NotNull(message = "Template ID is required")
    private Long templateId;

    @NotBlank(message = "Recipient email is required")
    private String recipient;

    @NotNull(message = "Template data is required")
    private Map<String, Object> templateData;

    @NotNull(message = "Scheduled time is required")
    @Future(message = "Scheduled time must be in the future")
    private LocalDateTime scheduledTime;
}