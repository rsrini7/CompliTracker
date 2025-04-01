package com.complitracker.email.controller;

import com.complitracker.email.dto.EmailResponse;
import com.complitracker.email.dto.EmailScheduleRequest;
import com.complitracker.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
public class EmailController {
    private final EmailService emailService;

    @PostMapping("/schedule")
    public ResponseEntity<EmailResponse> scheduleEmail(
            @Valid @RequestBody EmailScheduleRequest request,
            @RequestHeader("X-User-ID") String userId) {
        emailService.scheduleEmail(
                request.getTemplateId(),
                request.getRecipient(),
                request.getTemplateData(),
                request.getScheduledTime(),
                userId
        );
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{emailId}/cancel")
    public ResponseEntity<Void> cancelEmail(@PathVariable Long emailId) {
        emailService.cancelScheduledEmail(emailId);
        return ResponseEntity.ok().build();
    }
}