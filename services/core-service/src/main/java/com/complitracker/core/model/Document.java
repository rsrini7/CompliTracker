package com.complitracker.core.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String fileUrl;
    private String createdBy;
    private LocalDateTime createdAt;
    private String documentType;
    private String status;
    private String version;
    private Long fileSize;
    private String mimeType;
    private String description;
    private String lastModifiedBy;
    private LocalDateTime lastModifiedAt;
}