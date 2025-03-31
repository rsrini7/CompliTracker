package com.complitracker.core.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "risk_analyses")
public class RiskAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "compliance_item_id", nullable = false)
    private Long complianceItemId;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "risk_analysis_id")
    private List<RiskFactor> riskFactors;
    
    @Column(name = "overall_score", nullable = false)
    private double overallScore;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;
    
    @Column(name = "analysis_date", nullable = false)
    private LocalDateTime analysisDate;
    
    @Column(name = "assessment_summary")
    private String assessmentSummary;
    
    @Column(name = "recommended_actions")
    private String recommendedActions;
    
    @Version
    private Long version;
}