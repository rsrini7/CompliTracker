package com.complitracker.core.config;

import com.complitracker.core.service.OutlookCalendarClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class MicrosoftGraphConfig {

    @Bean
    @ConditionalOnProperty(prefix = "microsoft.graph", name = "enabled", havingValue = "true")
    public OutlookCalendarClient outlookCalendarClient(
            @Value("${microsoft.graph.api.baseUrl}") String graphApiBaseUrl) {
        return new OutlookCalendarClient(graphApiBaseUrl);
    }
}