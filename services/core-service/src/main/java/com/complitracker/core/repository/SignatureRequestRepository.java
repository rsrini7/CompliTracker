package com.complitracker.core.repository;

import com.complitracker.core.model.SignatureRequest;
import com.complitracker.core.model.SignatureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SignatureRequestRepository extends JpaRepository<SignatureRequest, Long> {
    Optional<SignatureRequest> findByExternalRequestId(String externalRequestId);
    List<SignatureRequest> findBySignersContainingAndStatus(String signer, SignatureStatus status);
}