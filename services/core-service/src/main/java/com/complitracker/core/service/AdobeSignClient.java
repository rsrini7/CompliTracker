package com.complitracker.core.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@ConditionalOnProperty(prefix = "adobesign", name = "enabled", havingValue = "true")
public class AdobeSignClient {
    private final RestTemplate restTemplate;
    private final String apiBaseUrl;
    private final String apiKey;

    public AdobeSignClient(
            @Value("${adobe.sign.api.baseUrl}") String apiBaseUrl,
            @Value("${adobe.sign.api.key}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.apiBaseUrl = apiBaseUrl;
        this.apiKey = apiKey;
    }

    public String createSignatureRequest(String documentUrl, String documentName, List<String> signers) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("documentUrl", documentUrl);
        requestBody.put("name", documentName);
        requestBody.put("signers", signers);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        Map<String, Object> response = restTemplate.exchange(
            apiBaseUrl + "/agreements",
            HttpMethod.POST,
            request,
            Map.class
        ).getBody();

        return (String) response.get("agreementId");
    }

    public void cancelAgreement(String agreementId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("status", "CANCELLED");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        restTemplate.exchange(
            apiBaseUrl + "/agreements/" + agreementId,
            HttpMethod.PUT,
            request,
            Void.class
        );
    }

    public boolean verifyWebhookSignature(String signature, Map<String, Object> eventData) {
        // Implementation would involve validating the webhook signature
        // using Adobe Sign's verification algorithm
        return true; // Placeholder implementation
    }

    public Map<String, String> extractSignerStatuses(Map<String, Object> eventData) {
        Map<String, String> signerStatuses = new HashMap<>();
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> participants = (List<Map<String, Object>>) eventData.get("participants");
        
        if (participants != null) {
            for (Map<String, Object> participant : participants) {
                String email = (String) participant.get("email");
                String status = (String) participant.get("status");
                signerStatuses.put(email, status);
            }
        }
        
        return signerStatuses;
    }
}