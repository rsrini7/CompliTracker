package com.complitracker.core.model;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "compliance_history")
public class ComplianceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "compliance_id")
    private Long complianceId;
    
    @Column(name = "user_id")
    private String userId;
    
    private String action;
    private String field;
    
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;
    
    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;
    
    private LocalDateTime timestamp;
    
    @ElementCollection
    @CollectionTable(name = "compliance_history_metadata", 
                    joinColumns = @JoinColumn(name = "history_id"))
    @MapKeyColumn(name = "key")
    @Column(name = "value")
    private Map<String, Object> metadata;
}