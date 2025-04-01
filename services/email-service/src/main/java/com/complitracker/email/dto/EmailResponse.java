package com.complitracker.email.dto;

import com.complitracker.email.model.EmailStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class EmailResponse {
    private Long id;
    private String recipient;
    private EmailStatus status;
    private LocalDateTime scheduledTime;
    private LocalDateTime sentTime;
    private String errorMessage;
    private Integer retryCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}