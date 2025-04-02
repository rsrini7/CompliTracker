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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RiskAnalysisService {
    private final RiskAnalysisRepository riskAnalysisRepository;
    private final AIRiskAssessmentService aiRiskAssessmentService;

    public Map<String, Object> getOrganizationRiskScore(String userId) {
        Map<String, Object> map = new HashMap<>();
        map.put("organizationScore", riskAnalysisRepository.calculateOrganizationRiskScore());
        map.put("userRiskItems", riskAnalysisRepository.findRiskAnalysisByUserId(userId));
        map.put("overview", getOrganizationRiskOverview());
        return map;
    }

    public Map<String, Object> getComplianceRiskAnalysis(String id) {
        RiskAnalysis analysis = riskAnalysisRepository.findTopByComplianceItemIdOrderByAnalysisDateDesc(Long.parseLong(id));
        Map<String, Object> map = new HashMap<>();
        map.put("riskScore", analysis.getOverallScore());
        map.put("riskLevel", analysis.getRiskLevel());
        map.put("riskFactors", analysis.getRiskFactors());
        map.put("lastUpdated", analysis.getAnalysisDate());
        return map;
    }

    public List<Map<String, Object>> getRiskFactors(String areaId) {
        List<RiskFactor> factors = riskAnalysisRepository.findRiskFactorsByAreaId(areaId);
        return factors.stream()
            .map(factor -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", factor.getName());
                map.put("score", factor.getScore());
                map.put("impact", calculateFactorImpact(factor.getScore()));
                map.put("trend", analyzeFactorTrend(factor.getName(), areaId));
                return map;
            })
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRiskMitigationRecommendations(String riskId) {
        RiskAnalysis analysis = riskAnalysisRepository.findById(Long.parseLong(riskId))
            .orElseThrow(() -> new RuntimeException("Risk analysis not found"));
        
        return analysis.getRiskFactors().stream()
            .map(factor -> {
                Map<String, Object> map = new HashMap<>();
                map.put("factor", factor.getName());
                map.put("score", factor.getScore());
                map.put("recommendations", generateMitigationRecommendations(factor));
                map.put("priority", determineMitigationPriority(factor.getScore()));
                return map;
            })
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRiskAnalysisHistory(String entityType, String entityId) {
        List<RiskAnalysis> history = riskAnalysisRepository.findRiskAnalysisHistory(entityType, entityId);
        return history.stream()
            .map(analysis -> {
                Map<String, Object> map = new HashMap<>();
                map.put("date", analysis.getAnalysisDate());
                map.put("score", analysis.getOverallScore());
                map.put("level", analysis.getRiskLevel());
                map.put("factors", analysis.getRiskFactors());
                map.put("changes", calculateRiskChanges(analysis));
                return map;
            })
            .collect(Collectors.toList());
    }

    private String calculateFactorImpact(double score) {
        if (score >= 75) return "HIGH";
        if (score >= 50) return "MEDIUM";
        return "LOW";
    }

    private String analyzeFactorTrend(String factorName, String areaId) {
        List<Double> historicalScores = riskAnalysisRepository.findHistoricalFactorScores(factorName, areaId);
        if (historicalScores.size() < 2) return "STABLE";
        
        double recent = historicalScores.get(0);
        double previous = historicalScores.get(1);
        double difference = recent - previous;
        
        if (Math.abs(difference) < 5) return "STABLE";
        return difference > 0 ? "INCREASING" : "DECREASING";
    }

    private List<String> generateMitigationRecommendations(RiskFactor factor) {
        return aiRiskAssessmentService.generateMitigationStrategies(factor);
    }

    private String determineMitigationPriority(double score) {
        if (score >= 75) return "IMMEDIATE";
        if (score >= 50) return "HIGH";
        if (score >= 25) return "MEDIUM";
        return "LOW";
    }

    private Map<String, Object> calculateRiskChanges(RiskAnalysis analysis) {
        RiskAnalysis previousAnalysis = riskAnalysisRepository
            .findPreviousAnalysis(analysis.getComplianceItemId(), analysis.getAnalysisDate());
        
        if (previousAnalysis == null) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "INITIAL");
            map.put("difference", 0.0);
            return map;
        }

        double scoreDifference = analysis.getOverallScore() - previousAnalysis.getOverallScore();
        String changeType = Math.abs(scoreDifference) < 5 ? "MINIMAL" :
                          scoreDifference > 0 ? "INCREASED" : "DECREASED";

        Map<String, Object> map = new HashMap<>();
        map.put("type", changeType);
        map.put("difference", scoreDifference);
        return map;
    }

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
        Map<String, Object> map = new HashMap<>();
        map.put("overallScore", riskAnalysisRepository.calculateOrganizationRiskScore());
        map.put("highRiskCount", riskAnalysisRepository.countByRiskLevel("HIGH"));
        map.put("mediumRiskCount", riskAnalysisRepository.countByRiskLevel("MEDIUM"));
        map.put("lowRiskCount", riskAnalysisRepository.countByRiskLevel("LOW"));
        return map;
    }
}