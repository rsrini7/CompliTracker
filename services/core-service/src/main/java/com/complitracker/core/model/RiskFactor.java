package com.complitracker.core.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "risk_factors")
public class RiskFactor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "score", nullable = false)
    private double score;
    
    @Column(name = "weight", nullable = false)
    private double weight;
    
    @Column(name = "description")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_analysis_id")
    private RiskAnalysis riskAnalysis;
    
    public double getWeightedScore() {
        return score * weight;
    }
}