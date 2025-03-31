package com.complitracker.core.config;

import com.complitracker.core.service.AdobeSignClient;
import com.complitracker.core.service.impl.AdobeSignClientImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AdobeSignConfig {

    @Bean
    @ConditionalOnProperty(prefix = "adobesign.api", name = "enabled", havingValue = "true", matchIfMissing = false)
    public AdobeSignClient adobeSignClient(RestTemplate restTemplate) {
        return new AdobeSignClientImpl(restTemplate);
    }
}