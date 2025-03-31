package com.complitracker.core.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public interface AdobeSignClient {
    String createSignatureRequest(String documentUrl, String documentName, List<String> signers);
    void cancelAgreement(String agreementId);
    boolean verifyWebhookSignature(String signature, Map<String, Object> eventData);
    Map<String, String> extractSignerStatuses(Map<String, Object> eventData);
}