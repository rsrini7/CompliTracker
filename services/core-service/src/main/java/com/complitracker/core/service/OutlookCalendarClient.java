package com.complitracker.core.service;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(prefix = "microsoft.graph", name = "enabled", havingValue = "true")
public class OutlookCalendarClient {
    private final RestTemplate restTemplate;
    private final String graphApiBaseUrl;
    
    public OutlookCalendarClient(
            @Value("${microsoft.graph.api.baseUrl}") String graphApiBaseUrl) {
        this.restTemplate = new RestTemplate();
        this.graphApiBaseUrl = graphApiBaseUrl;
    }
    
    public String createEvent(String accessToken, String title, String description,
                            LocalDateTime startDateTime, LocalDateTime endDateTime) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("subject", title);
        requestBody.put("body", Map.of("content", description, "contentType", "text"));
        requestBody.put("start", Map.of("dateTime", startDateTime.format(DateTimeFormatter.ISO_DATE_TIME), "timeZone", "UTC"));
        requestBody.put("end", Map.of("dateTime", endDateTime.format(DateTimeFormatter.ISO_DATE_TIME), "timeZone", "UTC"));
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        Map<String, Object> response = restTemplate.exchange(
            graphApiBaseUrl + "/me/events",
            HttpMethod.POST,
            request,
            Map.class
        ).getBody();
        
        return (String) response.get("id");
    }
    
    public void updateEvent(String accessToken, String eventId, String title, String description,
                          LocalDateTime startDateTime, LocalDateTime endDateTime) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("subject", title);
        requestBody.put("body", Map.of("content", description, "contentType", "text"));
        requestBody.put("start", Map.of("dateTime", startDateTime.format(DateTimeFormatter.ISO_DATE_TIME), "timeZone", "UTC"));
        requestBody.put("end", Map.of("dateTime", endDateTime.format(DateTimeFormatter.ISO_DATE_TIME), "timeZone", "UTC"));
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        restTemplate.exchange(
            graphApiBaseUrl + "/me/events/" + eventId,
            HttpMethod.PATCH,
            request,
            Void.class
        );
    }
    
    public void deleteEvent(String accessToken, String eventId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        
        HttpEntity<?> request = new HttpEntity<>(headers);
        
        restTemplate.exchange(
            graphApiBaseUrl + "/me/events/" + eventId,
            HttpMethod.DELETE,
            request,
            Void.class
        );
    }
    
    public String getCalendarId(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        
        HttpEntity<?> request = new HttpEntity<>(headers);
        
        Map<String, Object> response = restTemplate.exchange(
            graphApiBaseUrl + "/me/calendar",
            HttpMethod.GET,
            request,
            Map.class
        ).getBody();
        
        return (String) response.get("id");
    }
}