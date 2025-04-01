package com.complitracker.core.controller;

import com.complitracker.core.model.CalendarEvent;
import com.complitracker.core.model.ComplianceItem;
import com.complitracker.core.service.CalendarIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/calendar")
@RequiredArgsConstructor
public class CalendarIntegrationController {

    private final CalendarIntegrationService calendarIntegrationService;

    @PostMapping("/create-event")
    public ResponseEntity<CalendarEvent> createEvent(@RequestBody ComplianceItem complianceItem, @RequestParam String userId) {
        CalendarEvent event = calendarIntegrationService.createComplianceEvent(complianceItem, userId);
        return ResponseEntity.ok(event);
    }
}