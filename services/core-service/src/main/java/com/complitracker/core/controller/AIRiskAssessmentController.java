package com.complitracker.core.controller;

import com.complitracker.core.model.ComplianceItem;
import com.complitracker.core.service.AIRiskAssessmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/core/risk-assessment")
@RequiredArgsConstructor
public class AIRiskAssessmentController {

    private final AIRiskAssessmentService aiRiskAssessmentService;

    @PostMapping("/assess")
    public ResponseEntity<Map<String, Double>> assessRisk(@RequestBody ComplianceItem complianceItem) {
        Map<String, Double> riskFactors = aiRiskAssessmentService.assessRiskFactors(complianceItem);
        return ResponseEntity.ok(riskFactors);
    }
}