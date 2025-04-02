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

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

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

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "area_id")
    private String areaId;

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
    @CollectionTable(name = "compliance_item_documents", joinColumns = @JoinColumn(name = "compliance_item_id"))
    @Column(name = "document_path")
    private List<String> documents = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "compliance_item_history", joinColumns = @JoinColumn(name = "compliance_item_id"))
    @Column(name = "history_data", columnDefinition = "TEXT")
    private List<String> historicalData = new ArrayList<>();

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