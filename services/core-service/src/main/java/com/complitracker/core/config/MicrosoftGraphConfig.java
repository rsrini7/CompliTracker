package com.complitracker.core.config;

import com.complitracker.core.service.OutlookCalendarClient;
import com.complitracker.core.service.impl.OutlookCalendarClientImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class MicrosoftGraphConfig {

    @Bean
    @ConditionalOnProperty(prefix = "microsoft.graph", name = "enabled", havingValue = "true")
    public OutlookCalendarClient outlookCalendarClient(
            @Value("${microsoft.graph.client-id}") String clientId,
            @Value("${microsoft.graph.client-secret}") String clientSecret,
            @Value("${microsoft.graph.tenant-id}") String tenantId,
            @Value("${microsoft.graph.scopes}") String[] scopes) {
        return new OutlookCalendarClientImpl(clientId, clientSecret, tenantId, scopes);
    }
}