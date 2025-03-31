package com.complitracker.document.controller;

import com.complitracker.document.model.Document;
import com.complitracker.document.model.DocumentStatus;
import com.complitracker.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description,
            @RequestParam Set<String> allowedUsers,
            @RequestHeader("X-User-Id") String userId) {
        Document document = documentService.uploadDocument(file, description, allowedUsers, userId);
        return ResponseEntity.ok(document);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Set<String> allowedUsers,
            @RequestHeader("X-User-Id") String userId) {
        Document document = documentService.updateDocument(id, file, description, allowedUsers, userId);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(@PathVariable Long id) {
        Document document = documentService.getDocumentById(id);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ByteArrayResource> downloadDocument(@PathVariable Long id) {
        Document document = documentService.getDocumentById(id);
        byte[] data = documentService.downloadDocument(id);
        ByteArrayResource resource = new ByteArrayResource(data);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getName() + "\"")
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .contentLength(document.getSize())
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<Document>> getAllDocuments(Pageable pageable) {
        return ResponseEntity.ok(documentService.getAllDocuments(pageable));
    }

    @GetMapping("/user")
    public ResponseEntity<Page<Document>> getUserDocuments(
            @RequestHeader("X-User-Id") String userId,
            Pageable pageable) {
        return ResponseEntity.ok(documentService.getDocumentsByUser(userId, pageable));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Document> updateDocumentStatus(
            @PathVariable Long id,
            @RequestParam DocumentStatus status,
            @RequestHeader("X-User-Id") String userId) {
        Document document = documentService.updateDocumentStatus(id, status, userId);
        return ResponseEntity.ok(document);
    }
}