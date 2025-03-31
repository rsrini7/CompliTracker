package com.complitracker.core.service;

import com.complitracker.core.model.ComplianceItem;
import com.complitracker.core.model.RiskAssessmentResult;
import com.complitracker.core.config.AIServiceProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIRiskAssessmentService {
    private final RestTemplate restTemplate;
    private final AIServiceProperties aiServiceProperties;

    public Map<String, Double> assessRiskFactors(ComplianceItem complianceItem) {
        Map<String, Object> assessmentData = prepareAssessmentData(complianceItem);
        
        // Call AI service for risk assessment
        RiskAssessmentResult result = restTemplate.postForObject(
            aiServiceProperties.getApiEndpoint() + "/analyze",
            assessmentData,
            RiskAssessmentResult.class
        );

        return processRiskAssessmentResult(result);
    }

    private Map<String, Object> prepareAssessmentData(ComplianceItem item) {
        Map<String, Object> data = new HashMap<>();
        data.put("complianceType", item.getType());
        data.put("requirements", item.getRequirements());
        data.put("deadline", item.getDeadline());
        data.put("status", item.getStatus());
        data.put("documents", item.getDocuments());
        data.put("historicalData", item.getHistoricalData());
        return data;
    }

    private Map<String, Double> processRiskAssessmentResult(RiskAssessmentResult result) {
        Map<String, Double> riskFactors = new HashMap<>();
        
        // Process different risk factors
        riskFactors.put("compliance_complexity", result.getComplexityScore());
        riskFactors.put("deadline_risk", result.getDeadlineRiskScore());
        riskFactors.put("documentation_completeness", result.getDocumentationScore());
        riskFactors.put("historical_performance", result.getHistoricalScore());
        
        return riskFactors;
    }

    public Map<String, String> generateRiskMitigationRecommendations(ComplianceItem item) {
        Map<String, Object> assessmentData = prepareAssessmentData(item);
        
        return restTemplate.postForObject(
            aiServiceProperties.getApiEndpoint() + "/recommendations",
            assessmentData,
            Map.class
        );
    }
}