package com.complitracker.core.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.MapKeyColumn;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "calendar_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEvent {
    @Id
    @GeneratedValue
    private Long id;

    private String title;
    
    @Column(length = 1000)
    private String description;
    
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    
    private Long complianceItemId;
    private String userId;
    
    @ElementCollection
    @MapKeyColumn(name = "provider_type")
    @Column(name = "external_event_id")
    private Map<String, String> externalEventIds = new HashMap<>();

    public void addExternalEventId(String providerType, String eventId) {
        externalEventIds.put(providerType, eventId);
    }

    public String getExternalEventId(String providerType) {
        return externalEventIds.get(providerType);
    }
}