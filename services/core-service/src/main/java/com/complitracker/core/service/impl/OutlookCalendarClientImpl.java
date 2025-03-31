package com.complitracker.core.service.impl;

import com.complitracker.core.service.OutlookCalendarClient;
import com.azure.core.credential.TokenCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.microsoft.graph.authentication.TokenCredentialAuthProvider;
import com.microsoft.graph.models.Event;
import com.microsoft.graph.models.ItemBody;
import com.microsoft.graph.models.DateTimeTimeZone;
import com.microsoft.graph.requests.GraphServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@ConditionalOnProperty(prefix = "microsoft.graph", name = "enabled", havingValue = "true")
public class OutlookCalendarClientImpl implements OutlookCalendarClient {

    private final GraphServiceClient graphClient;

    public OutlookCalendarClientImpl(
            @Value("${microsoft.graph.client.id}") String clientId,
            @Value("${microsoft.graph.client.secret}") String clientSecret,
            @Value("${microsoft.graph.tenant.id}") String tenantId,
            @Value("${microsoft.graph.scopes}") String[] scopes) {
        
        TokenCredential credential = new ClientSecretCredentialBuilder()
            .clientId(clientId)
            .clientSecret(clientSecret)
            .tenantId(tenantId)
            .build();

        TokenCredentialAuthProvider authProvider = new TokenCredentialAuthProvider(List.of(scopes), credential);
        this.graphClient = GraphServiceClient.builder()
                .authenticationProvider(authProvider)
                .buildClient();
    }

    @Override
    public String createEvent(String accessToken, String title, String description,
                             LocalDateTime startDateTime, LocalDateTime endDateTime) {
        Event event = new Event();
        event.subject = title;
        event.body = new ItemBody();
        event.body.content = description;
        event.start = new DateTimeTimeZone();
        event.start.dateTime = startDateTime.atOffset(ZoneOffset.UTC).toString();
        event.start.timeZone = "UTC";
        event.end = new DateTimeTimeZone();
        event.end.dateTime = endDateTime.atOffset(ZoneOffset.UTC).toString();
        event.end.timeZone = "UTC";

        Event createdEvent = graphClient.me().calendar().events()
                .buildRequest()
                .post(event);

        return createdEvent.id;
    }

    @Override
    public void updateEvent(String accessToken, String eventId, String title, String description,
                           LocalDateTime startDateTime, LocalDateTime endDateTime) {
        Event event = new Event();
        event.subject = title;
        event.body = new ItemBody();
        event.body.content = description;
        event.start = new DateTimeTimeZone();
        event.start.dateTime = startDateTime.atOffset(ZoneOffset.UTC).toString();
        event.start.timeZone = "UTC";
        event.end = new DateTimeTimeZone();
        event.end.dateTime = endDateTime.atOffset(ZoneOffset.UTC).toString();
        event.end.timeZone = "UTC";

        graphClient.me().calendar().events(eventId)
                .buildRequest()
                .patch(event);
    }

    @Override
    public void deleteEvent(String accessToken, String eventId) {
        graphClient.me().calendar().events(eventId)
                .buildRequest()
                .delete();
    }

    @Override
    public String getCalendarId(String accessToken) {
        return graphClient.me().calendar()
                .buildRequest()
                .get()
                .id;
    }
}