package com.complitracker.core.controller;

import com.complitracker.core.model.Compliance;
import com.complitracker.core.model.ComplianceHistory;
import com.complitracker.core.service.ComplianceService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
public class ComplianceController {

    private final ComplianceService complianceService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getComplianceStats(
        @RequestHeader("X-User-Id") String userId
    ) {
        return ResponseEntity.ok(complianceService.getComplianceStats(userId));
    }

    @GetMapping("/deadlines")
    public ResponseEntity<List<Compliance>> getUpcomingDeadlines(
        @RequestHeader("X-User-Id") String userId,
        @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(
            complianceService.getUpcomingDeadlines(userId, days)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Compliance> getComplianceById(
        @PathVariable String id
    ) {
        return ResponseEntity.ok(complianceService.getComplianceById(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ComplianceHistory>> getComplianceHistory(
        @PathVariable String id
    ) {
        return ResponseEntity.ok(complianceService.getComplianceHistory(id));
    }

    @GetMapping("/areas")
    public ResponseEntity<List<Map<String, Object>>> getComplianceAreas() {
        return ResponseEntity.ok(complianceService.getComplianceAreas());
    }
}
