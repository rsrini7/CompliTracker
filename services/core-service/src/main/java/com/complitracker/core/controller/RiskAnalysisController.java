package com.complitracker.core.controller;

import com.complitracker.core.service.RiskAnalysisService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/risk-analysis")
@RequiredArgsConstructor
public class RiskAnalysisController {

    private final RiskAnalysisService riskAnalysisService;

    @GetMapping("/organization")
    public ResponseEntity<Map<String, Object>> getOrganizationRiskScore(
        @RequestHeader("X-User-Id") String userId
    ) {
        return ResponseEntity.ok(
            riskAnalysisService.getOrganizationRiskScore(userId)
        );
    }

    @GetMapping("/compliance/{id}")
    public ResponseEntity<Map<String, Object>> getComplianceRiskAnalysis(
        @PathVariable String id
    ) {
        return ResponseEntity.ok(
            riskAnalysisService.getComplianceRiskAnalysis(id)
        );
    }

    @GetMapping("/factors/{areaId}")
    public ResponseEntity<List<Map<String, Object>>> getRiskFactors(
        @PathVariable String areaId
    ) {
        return ResponseEntity.ok(riskAnalysisService.getRiskFactors(areaId));
    }

    @GetMapping("/mitigations/{riskId}")
    public ResponseEntity<
        List<Map<String, Object>>
    > getRiskMitigationRecommendations(@PathVariable String riskId) {
        return ResponseEntity.ok(
            riskAnalysisService.getRiskMitigationRecommendations(riskId)
        );
    }

    @GetMapping("/history/{entityType}/{entityId}")
    public ResponseEntity<List<Map<String, Object>>> getRiskAnalysisHistory(
        @PathVariable String entityType,
        @PathVariable String entityId
    ) {
        return ResponseEntity.ok(
            riskAnalysisService.getRiskAnalysisHistory(entityType, entityId)
        );
    }
}
