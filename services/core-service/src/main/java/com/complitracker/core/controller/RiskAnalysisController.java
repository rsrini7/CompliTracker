package com.complitracker.core.controller;

import com.complitracker.core.model.ComplianceItem;
import com.complitracker.core.model.RiskFactor;
import com.complitracker.core.model.RiskScore;
import com.complitracker.core.service.RiskAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/core/risk-analysis")
@RequiredArgsConstructor
public class RiskAnalysisController {

    private final RiskAnalysisService riskAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<RiskScore> analyzeRisk(@RequestBody ComplianceItem complianceItem) {
        RiskScore riskScore = riskAnalysisService.analyzeComplianceRisk(complianceItem);
        return ResponseEntity.ok(riskScore);
    }

    @GetMapping("/risk-factors")
    public ResponseEntity<List<RiskFactor>> getRiskFactors() {
        List<RiskFactor> riskFactors = riskAnalysisService.getOrganizationRiskFactors();
        return ResponseEntity.ok(riskFactors);
    }
}