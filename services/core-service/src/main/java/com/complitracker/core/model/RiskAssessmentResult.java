package com.complitracker.core.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentResult {
    private double complexityScore;
    private double deadlineRiskScore;
    private double documentationScore;
    private double historicalScore;
    private String assessmentSummary;
    private String recommendedActions;
    
    // Weighted risk calculation
    public double calculateOverallRisk() {
        return (complexityScore * 0.3) +
               (deadlineRiskScore * 0.25) +
               (documentationScore * 0.25) +
               (historicalScore * 0.2);
    }
    
    public boolean isHighRisk() {
        return calculateOverallRisk() >= 0.7;
    }
    
    public boolean isMediumRisk() {
        double risk = calculateOverallRisk();
        return risk >= 0.4 && risk < 0.7;
    }
    
    public boolean isLowRisk() {
        return calculateOverallRisk() < 0.4;
    }
}