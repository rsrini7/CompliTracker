package com.complitracker.document.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String uploadDocument(MultipartFile file, String prefix);
    byte[] downloadDocument(String key);
    void deleteDocument(String key);
}