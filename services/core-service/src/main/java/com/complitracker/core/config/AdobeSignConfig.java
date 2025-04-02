package com.complitracker.core.config;

import com.complitracker.core.service.AdobeSignClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdobeSignConfig {

    @Bean
    @ConditionalOnProperty(prefix = "adobesign", name = "enabled", havingValue = "true", matchIfMissing = false)
    public AdobeSignClient adobeSignClient(
            @Value("${adobe.sign.api.baseUrl}") String apiBaseUrl,
            @Value("${adobe.sign.api.key}") String apiKey) {
        return new AdobeSignClient(apiBaseUrl, apiKey);
    }
}