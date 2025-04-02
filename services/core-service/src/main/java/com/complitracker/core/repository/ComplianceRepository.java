package com.complitracker.core.repository;

import com.complitracker.core.model.Compliance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplianceRepository extends JpaRepository<Compliance, Long> {
    // Add custom query methods here if needed
}