package com.complitracker.core.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public interface DocuSignClient {
    String createSignatureRequest(String documentUrl, String documentName, List<String> signers);
    void voidEnvelope(String envelopeId);
    boolean verifyWebhookSignature(String signature, Map<String, Object> eventData);
    Map<String, String> extractSignerStatuses(Map<String, Object> eventData);
}