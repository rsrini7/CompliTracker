package com.complitracker.core.service;

import com.complitracker.core.model.CalendarEvent;
import com.complitracker.core.model.CalendarProvider;
import static com.complitracker.core.model.CalendarProvider.*;
import com.complitracker.core.model.ComplianceItem;
import com.complitracker.core.repository.CalendarEventRepository;
import com.google.auth.oauth2.GoogleCredentials;
import com.microsoft.graph.authentication.IAuthenticationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CalendarIntegrationService {
    private final CalendarEventRepository calendarEventRepository;
    private final GoogleCalendarClient googleCalendarClient;
    private final OutlookCalendarClient outlookCalendarClient;

    public CalendarEvent createComplianceEvent(ComplianceItem complianceItem, String userId) {
        CalendarEvent event = CalendarEvent.builder()
            .title(complianceItem.getTitle())
            .description(complianceItem.getDescription())
            .startDateTime(complianceItem.getDeadline().minusHours(1))
            .endDateTime(complianceItem.getDeadline())
            .complianceItemId(complianceItem.getId())
            .userId(userId)
            .build();

        // Get user's calendar preferences
        List<CalendarProvider> providers = getUserCalendarProviders(userId);
        
        for (CalendarProvider provider : providers) {
            String externalEventId = createExternalCalendarEvent(event, provider);
            event.addExternalEventId(provider.getType(), externalEventId);
        }

        return calendarEventRepository.save(event);
    }

    private String createExternalCalendarEvent(CalendarEvent event, CalendarProvider provider) {
        return switch (provider) {
            case GOOGLE -> googleCalendarClient.createEvent(
                provider.getAccessToken(),
                event.getTitle(),
                event.getDescription(),
                event.getStartDateTime(),
                event.getEndDateTime()
            );
            case OUTLOOK -> outlookCalendarClient.createEvent(
                provider.getAccessToken(),
                event.getTitle(),
                event.getDescription(),
                event.getStartDateTime(),
                event.getEndDateTime()
            );
        };
    }

    public void updateComplianceEvent(CalendarEvent event) {
        List<CalendarProvider> providers = getUserCalendarProviders(event.getUserId());
        
        for (CalendarProvider provider : providers) {
            String externalEventId = event.getExternalEventId(provider.getType());
            if (externalEventId != null) {
                updateExternalCalendarEvent(event, provider, externalEventId);
            }
        }

        calendarEventRepository.save(event);
    }

    private void updateExternalCalendarEvent(CalendarEvent event, CalendarProvider provider, String externalEventId) {
        switch (provider) {
            case GOOGLE -> googleCalendarClient.updateEvent(
                provider.getAccessToken(),
                externalEventId,
                event.getTitle(),
                event.getDescription(),
                event.getStartDateTime(),
                event.getEndDateTime()
            );
            case OUTLOOK -> outlookCalendarClient.updateEvent(
                provider.getAccessToken(),
                externalEventId,
                event.getTitle(),
                event.getDescription(),
                event.getStartDateTime(),
                event.getEndDateTime()
            );
        }
    }

    public void deleteComplianceEvent(CalendarEvent event) {
        List<CalendarProvider> providers = getUserCalendarProviders(event.getUserId());
        
        for (CalendarProvider provider : providers) {
            String externalEventId = event.getExternalEventId(provider.getType());
            if (externalEventId != null) {
                deleteExternalCalendarEvent(provider, externalEventId);
            }
        }

        calendarEventRepository.delete(event);
    }

    private void deleteExternalCalendarEvent(CalendarProvider provider, String externalEventId) {
        switch (provider) {
            case GOOGLE -> googleCalendarClient.deleteEvent(provider.getAccessToken(), externalEventId);
            case OUTLOOK -> outlookCalendarClient.deleteEvent(provider.getAccessToken(), externalEventId);
        }
    }

    public List<CalendarEvent> getUpcomingEvents(String userId, LocalDateTime from, LocalDateTime to) {
        return calendarEventRepository.findByUserIdAndStartDateTimeBetween(userId, from, to);
    }

    private List<CalendarProvider> getUserCalendarProviders(String userId) {
        // Retrieve user's connected calendar providers
        return calendarEventRepository.findCalendarProvidersByUserId(userId);
    }
}