package com.complitracker.core.service.impl;

import com.complitracker.core.service.DocuSignClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(prefix = "docusign", name = "enabled", havingValue = "true")
public class DocuSignClientImpl implements DocuSignClient {
    @Value("${docusign.api.baseUrl}")
    private String baseUrl;

    @Value("${docusign.api.key}")
    private String apiKey;

    @Value("${docusign.webhook.secret}")
    private String webhookSecret;

    private final RestTemplate restTemplate;

    public DocuSignClientImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String createSignatureRequest(String documentUrl, String documentName, List<String> signers) {
        Map<String, Object> request = new HashMap<>();
        request.put("documentUrl", documentUrl);
        request.put("documentName", documentName);
        request.put("signers", signers);

        try {
            Map<String, Object> response = restTemplate.postForObject(
                baseUrl + "/envelopes",
                request,
                Map.class
            );
            return (String) response.get("envelopeId");
        } catch (Exception e) {
            throw new RuntimeException("Failed to create DocuSign envelope: " + e.getMessage(), e);
        }
    }

    @Override
    public void voidEnvelope(String envelopeId) {
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("status", "voided");
            request.put("voidedReason", "Cancelled by system");

            restTemplate.put(baseUrl + "/envelopes/" + envelopeId, request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to void DocuSign envelope: " + e.getMessage(), e);
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
            throw new RuntimeException("Failed to verify DocuSign webhook signature: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, String> extractSignerStatuses(Map<String, Object> eventData) {
        Map<String, String> signerStatuses = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> recipients = (List<Map<String, Object>>) eventData.get("recipients");
            if (recipients != null) {
                for (Map<String, Object> recipient : recipients) {
                    String email = (String) recipient.get("email");
                    String status = (String) recipient.get("status");
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