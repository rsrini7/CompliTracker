package com.complitracker.email.controller;

import com.complitracker.email.model.EmailTemplate;
import com.complitracker.email.service.EmailTemplateService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/email-templates")
@RequiredArgsConstructor
public class EmailTemplateController {
    private final EmailTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<EmailTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplate> getTemplateById(@PathVariable Long id) {
        return templateService.getTemplateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EmailTemplate> createTemplate(
            @Valid @RequestBody EmailTemplate template,
            @RequestHeader("X-User-ID") String userId) {
        return ResponseEntity.ok(templateService.createTemplate(template, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplate> updateTemplate(
            @PathVariable Long id,
            @Valid @RequestBody EmailTemplate template,
            @RequestHeader("X-User-ID") String userId) {
        try {
            return ResponseEntity.ok(templateService.updateTemplate(id, template, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }
}