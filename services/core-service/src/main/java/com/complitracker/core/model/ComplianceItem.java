package com.complitracker.core.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String status;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "type")
    private String type;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @ElementCollection
    @CollectionTable(name = "compliance_documents", joinColumns = @JoinColumn(name = "compliance_item_id"))
    private List<String> documents;

    @ElementCollection
    @CollectionTable(name = "compliance_historical_data", joinColumns = @JoinColumn(name = "compliance_item_id"))
    private List<String> historicalData;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}