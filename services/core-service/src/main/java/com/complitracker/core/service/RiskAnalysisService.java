package com.complitracker.core.service;

import com.complitracker.core.model.ComplianceItem;
import com.complitracker.core.model.RiskAnalysis;
import com.complitracker.core.model.RiskFactor;
import com.complitracker.core.model.RiskScore;
import com.complitracker.core.repository.RiskAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.complitracker.core.model.RiskLevel;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RiskAnalysisService {
    private final RiskAnalysisRepository riskAnalysisRepository;
    private final AIRiskAssessmentService aiRiskAssessmentService;

    @Transactional
    public RiskScore analyzeComplianceRisk(ComplianceItem complianceItem) {
        // Get AI-based risk assessment
        Map<String, Double> riskFactors = aiRiskAssessmentService.assessRiskFactors(complianceItem);
        
        // Calculate overall risk score
        double overallScore = calculateOverallRiskScore(riskFactors);
        
        // Create and save risk analysis record
        RiskAnalysis riskAnalysis = RiskAnalysis.builder()
            .complianceItemId(complianceItem.getId())
            .riskFactors(mapToRiskFactors(riskFactors))
            .overallScore(overallScore)
            .riskLevel(determineRiskLevel(overallScore))
            .analysisDate(LocalDateTime.now())
            .build();
        
        riskAnalysisRepository.save(riskAnalysis);
        
        return new RiskScore(overallScore, determineRiskLevel(overallScore));
    }

    public List<RiskFactor> getOrganizationRiskFactors() {
        return riskAnalysisRepository.findAllRiskFactors();
    }

    private double calculateOverallRiskScore(Map<String, Double> riskFactors) {
        return riskFactors.values().stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);
    }

    private RiskLevel determineRiskLevel(double score) {
        if (score >= 75) return RiskLevel.HIGH;
        if (score >= 50) return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }

    private List<RiskFactor> mapToRiskFactors(Map<String, Double> riskFactors) {
        return riskFactors.entrySet().stream()
            .map(entry -> RiskFactor.builder()
                .name(entry.getKey())
                .score(entry.getValue())
                .build())
            .collect(Collectors.toList());
    }

    public RiskAnalysis getLatestRiskAnalysis(Long complianceItemId) {
        return riskAnalysisRepository.findTopByComplianceItemIdOrderByAnalysisDateDesc(complianceItemId);
    }

    public Map<String, Object> getOrganizationRiskOverview() {
        return Map.of(
            "overallScore", riskAnalysisRepository.calculateOrganizationRiskScore(),
            "highRiskCount", riskAnalysisRepository.countByRiskLevel("HIGH"),
            "mediumRiskCount", riskAnalysisRepository.countByRiskLevel("MEDIUM"),
            "lowRiskCount", riskAnalysisRepository.countByRiskLevel("LOW")
        );
    }
}