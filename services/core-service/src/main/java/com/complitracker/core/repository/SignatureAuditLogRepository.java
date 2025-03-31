package com.complitracker.core.repository;

import com.complitracker.core.model.SignatureAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SignatureAuditLogRepository extends JpaRepository<SignatureAuditLog, Long> {
    List<SignatureAuditLog> findByRequestId(String requestId);
    
    List<SignatureAuditLog> findByUserIdAndCreatedAtBetween(
        String userId,
        LocalDateTime startDate,
        LocalDateTime endDate
    );
    
    List<SignatureAuditLog> findByProviderAndEventTypeAndCreatedAtAfter(
        String provider,
        String eventType,
        LocalDateTime since
    );
}