package com.complitracker.core.model;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class RiskScore {
    private double score;
    private RiskLevel riskLevel;
    
    public boolean isHighRisk() {
        return riskLevel == RiskLevel.HIGH;
    }
    
    public boolean isMediumRisk() {
        return riskLevel == RiskLevel.MEDIUM;
    }
    
    public boolean isLowRisk() {
        return riskLevel == RiskLevel.LOW;
    }
    
    public String getDescription() {
        switch (riskLevel) {
            case HIGH:
                return "High risk level requiring immediate attention and mitigation strategies";
            case MEDIUM:
                return "Medium risk level requiring regular monitoring and control measures";
            case LOW:
                return "Low risk level with standard monitoring procedures";
            default:
                return "Unknown risk level";
        }
    }
}