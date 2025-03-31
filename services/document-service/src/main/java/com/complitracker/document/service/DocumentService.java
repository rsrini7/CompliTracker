package com.complitracker.document.service;

import com.complitracker.document.exception.DocumentNotFoundException;
import com.complitracker.document.model.Document;
import com.complitracker.document.model.DocumentStatus;
import com.complitracker.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final DocumentStorageService storageService;

    @Transactional
    public Document uploadDocument(MultipartFile file, String description, Set<String> allowedUsers, String userId) {
        Document document = new Document();
        document.setName(file.getOriginalFilename());
        document.setContentType(file.getContentType());
        document.setSize(file.getSize());
        document.setDescription(description);
        document.setAllowedUsers(allowedUsers);
        document.setVersion(1);
        document.setStatus(DocumentStatus.DRAFT);
        document.setCreatedBy(userId);
        document.setLastModifiedBy(userId);

        String s3Key = storageService.uploadDocument(file, userId);
        document.setS3Key(s3Key);

        return documentRepository.save(document);
    }

    @Transactional
    public Document updateDocument(Long id, MultipartFile file, String description, Set<String> allowedUsers, String userId) {
        Document document = getDocumentById(id);
        
        if (file != null) {
            storageService.deleteDocument(document.getS3Key());
            String newS3Key = storageService.uploadDocument(file, userId);
            document.setS3Key(newS3Key);
            document.setName(file.getOriginalFilename());
            document.setContentType(file.getContentType());
            document.setSize(file.getSize());
            document.setVersion(document.getVersion() + 1);
        }

        if (description != null) {
            document.setDescription(description);
        }

        if (allowedUsers != null) {
            document.setAllowedUsers(allowedUsers);
        }

        document.setLastModifiedBy(userId);
        return documentRepository.save(document);
    }

    @Transactional
    public void deleteDocument(Long id) {
        Document document = getDocumentById(id);
        storageService.deleteDocument(document.getS3Key());
        documentRepository.delete(document);
    }

    public byte[] downloadDocument(Long id) {
        Document document = getDocumentById(id);
        return storageService.downloadDocument(document.getS3Key());
    }

    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found with id: " + id));
    }

    public Page<Document> getAllDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable);
    }

    public Page<Document> getDocumentsByUser(String userId, Pageable pageable) {
        return documentRepository.findByAllowedUsersContaining(userId, pageable);
    }

    @Transactional
    public Document updateDocumentStatus(Long id, DocumentStatus status, String userId) {
        Document document = getDocumentById(id);
        document.setStatus(status);
        document.setLastModifiedBy(userId);
        return documentRepository.save(document);
    }
}