package com.complitracker.email.service;

import com.complitracker.email.model.EmailTemplate;
import com.complitracker.email.repository.EmailTemplateRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {
    private final EmailTemplateRepository templateRepository;

    public List<EmailTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public Optional<EmailTemplate> getTemplateById(Long id) {
        return templateRepository.findById(id);
    }

    public EmailTemplate createTemplate(EmailTemplate template, String userId) {
        template.setCreatedBy(userId);
        template.setLastModifiedBy(userId);
        template.setVersion(1);
        return templateRepository.save(template);
    }

    public EmailTemplate updateTemplate(Long id, EmailTemplate template, String userId) {
        return templateRepository.findById(id)
                .map(existingTemplate -> {
                    template.setId(id);
                    template.setVersion(existingTemplate.getVersion() + 1);
                    template.setLastModifiedBy(userId);
                    template.setCreatedBy(existingTemplate.getCreatedBy());
                    template.setCreatedAt(existingTemplate.getCreatedAt());
                    return templateRepository.save(template);
                })
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));
    }

    public void deleteTemplate(Long id) {
        templateRepository.findById(id)
                .ifPresent(templateRepository::delete);
    }
}