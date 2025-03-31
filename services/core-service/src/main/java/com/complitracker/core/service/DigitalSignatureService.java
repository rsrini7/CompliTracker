package com.complitracker.core.service;

import jakarta.servlet.http.HttpServletRequest;

import com.complitracker.core.model.Document;
import com.complitracker.core.model.SignatureProvider;
import com.complitracker.core.model.SignatureRequest;
import com.complitracker.core.model.SignatureStatus;
import com.complitracker.core.model.SignatureAuditLog;
import com.complitracker.core.repository.SignatureRequestRepository;
import com.complitracker.core.repository.SignatureAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DigitalSignatureService {
    private final SignatureRequestRepository signatureRequestRepository;
    private final DocuSignClient docuSignClient;
    private final AdobeSignClient adobeSignClient;
    private final NotificationService notificationService;
    private final SignatureAuditLogRepository auditLogRepository;

    public SignatureRequest createSignatureRequest(Document document, List<String> signers, SignatureProvider provider) {
        // Log signature request creation
        logAuditEvent(null, document.getCreatedBy(), provider, "REQUEST_CREATED",
            Map.of("documentId", String.valueOf(document.getId()), "signers", signers), "SUCCESS", null, null);
        SignatureRequest request = SignatureRequest.builder()
            .documentId(document.getId())
            .signers(signers)
            .provider(provider)
            .status(SignatureStatus.PENDING)
            .build();

        String externalRequestId = createExternalSignatureRequest(document, signers, provider);
        request.setExternalRequestId(externalRequestId);

        return signatureRequestRepository.save(request);
    }

    private String createExternalSignatureRequest(Document document, List<String> signers, SignatureProvider provider) {
        return switch (provider) {
            case DOCUSIGN -> docuSignClient.createSignatureRequest(
                document.getFileUrl(),
                document.getName(),
                signers
            );
            case ADOBE_SIGN -> adobeSignClient.createSignatureRequest(
                document.getFileUrl(),
                document.getName(),
                signers
            );
        };
    }

    public void updateSignatureStatus(String externalRequestId, SignatureStatus status, Map<String, String> signerStatuses) {
        SignatureRequest request = signatureRequestRepository.findByExternalRequestId(externalRequestId)
            .orElseThrow(() -> new RuntimeException("Signature request not found: " + externalRequestId));

        request.setStatus(status);
        request.updateSignerStatuses(signerStatuses);

        signatureRequestRepository.save(request);

        // Notify relevant parties about status change
        notificationService.sendSignatureStatusNotification(request);
    }

    public void cancelSignatureRequest(SignatureRequest request) {
        switch (request.getProvider()) {
            case DOCUSIGN -> docuSignClient.voidEnvelope(request.getExternalRequestId());
            case ADOBE_SIGN -> adobeSignClient.cancelAgreement(request.getExternalRequestId());
        }

        request.setStatus(SignatureStatus.CANCELLED);
        signatureRequestRepository.save(request);
    }

    public SignatureRequest getSignatureRequest(Long requestId) {
        return signatureRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Signature request not found: " + requestId));
    }

    public List<SignatureRequest> getPendingSignatureRequests(String userId) {
        return signatureRequestRepository.findBySignersContainingAndStatus(userId, SignatureStatus.PENDING);
    }

    public void handleWebhookEvent(SignatureProvider provider, String eventType, Map<String, Object> eventData, HttpServletRequest request) {
        try {
            // Validate webhook signature/authenticity
            validateWebhookAuthenticity(provider, eventData, request);

            String externalRequestId = extractExternalRequestId(provider, eventData);
            SignatureStatus newStatus = determineSignatureStatus(provider, eventType);
            Map<String, String> signerStatuses = extractSignerStatuses(provider, eventData);

            SignatureRequest signatureRequest = signatureRequestRepository.findByExternalRequestId(externalRequestId)
                .orElseThrow(() -> new RuntimeException("Signature request not found: " + externalRequestId));

            // Log webhook event
            logAuditEvent(signatureRequest.getId().toString(), signatureRequest.getCreatedBy(), provider, eventType, eventData, "SUCCESS", null, request);

            updateSignatureStatus(externalRequestId, newStatus, signerStatuses);
        } catch (Exception e) {
            // Log error event
            logAuditEvent(null, null, provider, eventType, eventData, "ERROR", e.getMessage(), request);
            throw e;
        }
    }

    private String extractExternalRequestId(SignatureProvider provider, Map<String, Object> eventData) {
        return switch (provider) {
            case DOCUSIGN -> (String) eventData.get("envelopeId");
            case ADOBE_SIGN -> (String) eventData.get("agreementId");
        };
    }

    private SignatureStatus determineSignatureStatus(SignatureProvider provider, String eventType) {
        return switch (provider) {
            case DOCUSIGN -> switch (eventType) {
                case "envelope-completed" -> SignatureStatus.COMPLETED;
                case "envelope-declined" -> SignatureStatus.DECLINED;
                default -> SignatureStatus.PENDING;
            };
            case ADOBE_SIGN -> switch (eventType) {
                case "AGREEMENT_COMPLETED" -> SignatureStatus.COMPLETED;
                case "AGREEMENT_REJECTED" -> SignatureStatus.DECLINED;
                default -> SignatureStatus.PENDING;
            };
        };
    }

    private Map<String, String> extractSignerStatuses(SignatureProvider provider, Map<String, Object> eventData) {
        return switch (provider) {
            case DOCUSIGN -> docuSignClient.extractSignerStatuses(eventData);
            case ADOBE_SIGN -> adobeSignClient.extractSignerStatuses(eventData);
        };
    }

    private void validateWebhookAuthenticity(SignatureProvider provider, Map<String, Object> eventData, HttpServletRequest request) {
        switch (provider) {
            case DOCUSIGN -> validateDocuSignWebhook(eventData, request);
            case ADOBE_SIGN -> validateAdobeSignWebhook(eventData, request);
        }
    }

    private void validateDocuSignWebhook(Map<String, Object> eventData, HttpServletRequest request) {
        String signature = request.getHeader("X-DocuSign-Signature-1");
        if (signature == null || !docuSignClient.verifyWebhookSignature(signature, eventData)) {
            throw new SecurityException("Invalid DocuSign webhook signature");
        }
    }

    private void validateAdobeSignWebhook(Map<String, Object> eventData, HttpServletRequest request) {
        String signature = request.getHeader("X-Adobe-Sign-ClientId");
        if (signature == null || !adobeSignClient.verifyWebhookSignature(signature, eventData)) {
            throw new SecurityException("Invalid Adobe Sign webhook signature");
        }
    }

    private void logAuditEvent(String requestId, String userId, SignatureProvider provider,
                              String eventType, Map<String, Object> eventData,
                              String status, String errorMessage, HttpServletRequest request) {
        SignatureAuditLog auditLog = SignatureAuditLog.builder()
            .requestId(requestId)
            .userId(userId)
            .provider(provider)
            .eventType(eventType)
            .eventData(eventData != null ? eventData.toString() : null)
            .ipAddress(request.getRemoteAddr())
            .status(status)
            .errorMessage(errorMessage)
            .build();

        auditLogRepository.save(auditLog);
    }
}