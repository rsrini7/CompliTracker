package com.complitracker.core.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Entity
@Table(name = "compliances")
public class Compliance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String userId;
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String status;
    private String areaId;
    private String areaName;
    private LocalDateTime deadline;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    private Double riskScore;
    private String assignedTo;
    private String priority;
    private boolean isActive;
    
    @ElementCollection
    @CollectionTable(name = "compliance_metadata", 
                    joinColumns = @JoinColumn(name = "compliance_id"))
    @MapKeyColumn(name = "key")
    @Column(name = "value")
    private Map<String, Object> metadata;
    
    @ElementCollection
    @CollectionTable(name = "compliance_documents", 
                    joinColumns = @JoinColumn(name = "compliance_id"))
    @Column(name = "document_id")
    private List<Long> documentIds = new ArrayList<>();
}