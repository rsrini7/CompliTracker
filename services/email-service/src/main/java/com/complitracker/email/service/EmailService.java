package com.complitracker.email.service;

import com.complitracker.email.model.EmailStatus;
import com.complitracker.email.model.EmailTemplate;
import com.complitracker.email.model.ScheduledEmail;
import com.complitracker.email.repository.EmailTemplateRepository;
import com.complitracker.email.repository.ScheduledEmailRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender emailSender;
    private final SpringTemplateEngine templateEngine;
    private final EmailTemplateRepository templateRepository;
    private final ScheduledEmailRepository scheduledEmailRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void scheduleEmail(Long templateId, String recipient, Map<String, Object> templateData,
                            LocalDateTime scheduledTime, String userId) {
        EmailTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        ScheduledEmail scheduledEmail = new ScheduledEmail();
        scheduledEmail.setTemplate(template);
        scheduledEmail.setRecipient(recipient);
        scheduledEmail.setScheduledTime(scheduledTime);
        scheduledEmail.setStatus(EmailStatus.SCHEDULED);
        scheduledEmail.setRetryCount(0);
        scheduledEmail.setCreatedBy(userId);

        try {
            scheduledEmail.setTemplateData(objectMapper.writeValueAsString(templateData));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize template data", e);
        }

        scheduledEmailRepository.save(scheduledEmail);
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void processScheduledEmails() {
        List<ScheduledEmail> pendingEmails = scheduledEmailRepository
                .findByStatusAndScheduledTimeBefore(EmailStatus.SCHEDULED, LocalDateTime.now());

        for (ScheduledEmail email : pendingEmails) {
            try {
                email.setStatus(EmailStatus.PROCESSING);
                scheduledEmailRepository.save(email);

                Map<String, Object> templateData = objectMapper.readValue(email.getTemplateData(), Map.class);
                sendEmail(email, templateData);

                email.setStatus(EmailStatus.SENT);
                email.setSentTime(LocalDateTime.now());
            } catch (Exception e) {
                log.error("Failed to process scheduled email: {}", email.getId(), e);
                email.setStatus(EmailStatus.FAILED);
                email.setErrorMessage(e.getMessage());
                email.setRetryCount(email.getRetryCount() + 1);

                // If retry count is less than 3, reschedule for 5 minutes later
                if (email.getRetryCount() < 3) {
                    email.setStatus(EmailStatus.SCHEDULED);
                    email.setScheduledTime(LocalDateTime.now().plusMinutes(5));
                }
            }
            scheduledEmailRepository.save(email);
        }
    }

    private void sendEmail(ScheduledEmail scheduledEmail, Map<String, Object> templateData) throws MessagingException {
        EmailTemplate template = scheduledEmail.getTemplate();
        Context context = new Context();
        context.setVariables(templateData);

        String emailContent = templateEngine.process(template.getContent(), context);
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(scheduledEmail.getRecipient());
        helper.setSubject(template.getSubject());
        helper.setText(emailContent, true);

        emailSender.send(message);
    }

    @Transactional
    public void cancelScheduledEmail(Long emailId) {
        ScheduledEmail email = scheduledEmailRepository.findById(emailId)
                .orElseThrow(() -> new RuntimeException("Scheduled email not found"));

        if (email.getStatus() == EmailStatus.SCHEDULED) {
            email.setStatus(EmailStatus.CANCELLED);
            scheduledEmailRepository.save(email);
        } else {
            throw new RuntimeException("Cannot cancel email that is not in SCHEDULED status");
        }
    }
}