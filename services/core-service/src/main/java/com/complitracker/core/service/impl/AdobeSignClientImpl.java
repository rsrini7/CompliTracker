package com.complitracker.core.service.impl;

import com.complitracker.core.service.AdobeSignClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdobeSignClientImpl implements AdobeSignClient {
    @Value("${adobesign.api.baseUrl}")
    private String baseUrl;

    @Value("${adobesign.api.key}")
    private String apiKey;

    @Value("${adobesign.webhook.secret}")
    private String webhookSecret;

    private final RestTemplate restTemplate;

    public AdobeSignClientImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String createSignatureRequest(String documentUrl, String documentName, List<String> signers) {
        Map<String, Object> request = new HashMap<>();
        request.put("fileUrl", documentUrl);
        request.put("name", documentName);
        request.put("participantSetsInfo", createParticipantSets(signers));

        try {
            Map<String, Object> response = restTemplate.postForObject(
                baseUrl + "/agreements",
                request,
                Map.class
            );
            return (String) response.get("id");
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Adobe Sign agreement: " + e.getMessage(), e);
        }
    }

    private List<Map<String, Object>> createParticipantSets(List<String> signers) {
        return signers.stream()
            .map(signer -> {
                Map<String, Object> participant = new HashMap<>();
                participant.put("email", signer);
                participant.put("role", "SIGNER");
                return participant;
            })
            .toList();
    }

    @Override
    public void cancelAgreement(String agreementId) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("state", "CANCELLED");
            request.put("comment", "Cancelled by system");

            restTemplate.put(baseUrl + "/agreements/" + agreementId + "/state", request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to cancel Adobe Sign agreement: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean verifyWebhookSignature(String signature, Map<String, Object> eventData) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(webhookSecret.getBytes(), "HmacSHA256");
            hmac.init(secretKey);

            String payload = eventData.toString();
            byte[] hash = hmac.doFinal(payload.getBytes());
            String calculatedSignature = Base64.getEncoder().encodeToString(hash);

            return signature.equals(calculatedSignature);
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Adobe Sign webhook signature: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, String> extractSignerStatuses(Map<String, Object> eventData) {
        Map<String, String> signerStatuses = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> participants = (List<Map<String, Object>>) eventData.get("participantSets");
            if (participants != null) {
                for (Map<String, Object> participant : participants) {
                    String email = (String) participant.get("email");
                    String status = (String) participant.get("status");
                    if (email != null && status != null) {
                        signerStatuses.put(email, status);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract signer statuses: " + e.getMessage(), e);
        }
        return signerStatuses;
    }
}