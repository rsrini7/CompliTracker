package com.complitracker.core.service;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public interface OutlookCalendarClient {
    String createEvent(String accessToken, String title, String description, LocalDateTime startDateTime, LocalDateTime endDateTime);
    void updateEvent(String accessToken, String eventId, String title, String description, LocalDateTime startDateTime, LocalDateTime endDateTime);
    void deleteEvent(String accessToken, String eventId);
    String getCalendarId(String accessToken);
}