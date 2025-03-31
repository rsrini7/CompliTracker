package com.complitracker.document.repository;

import com.complitracker.document.model.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Page<Document> findByAllowedUsersContaining(String userId, Pageable pageable);
}