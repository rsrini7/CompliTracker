package com.complitracker.core.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SignatureAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String requestId;

    @Column(nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignatureProvider provider;

    @Column(nullable = false)
    private String eventType;

    @Column(columnDefinition = "TEXT")
    private String eventData;

    @Column(nullable = false)
    private String ipAddress;

    @CreatedDate
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String status;

    private String errorMessage;
}