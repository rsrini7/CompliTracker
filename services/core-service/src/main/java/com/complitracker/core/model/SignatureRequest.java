package com.complitracker.core.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "signature_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignatureRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_request_id", unique = true)
    private String externalRequestId;

    @ElementCollection
    @CollectionTable(name = "signature_request_signers",
        joinColumns = @JoinColumn(name = "signature_request_id"))
    @Column(name = "signer_email")
    private List<String> signers = new ArrayList<>();

    @Column(name = "document_id", nullable = false)
    private Long documentId;

    @ElementCollection
    @CollectionTable(name = "signature_request_signer_statuses",
        joinColumns = @JoinColumn(name = "signature_request_id"))
    @MapKeyColumn(name = "signer_email")
    @Column(name = "status")
    private Map<String, String> signerStatuses = new HashMap<>();

    public void updateSignerStatuses(Map<String, String> newStatuses) {
        if (newStatuses != null) {
            this.signerStatuses.clear();
            this.signerStatuses.putAll(newStatuses);
        }
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignatureProvider provider;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignatureStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = SignatureStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}