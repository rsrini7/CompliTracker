package com.complitracker.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "ai.service")
public class AIServiceProperties {
    private String apiKey;
    private String apiEndpoint;
    private String modelVersion;
    private int maxTokens;
    private float temperature;
    private int requestTimeout;
    private int maxRetries;
    private boolean enableCache;
    private int cacheExpirationMinutes;
}