package com.complitracker.document.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
public class LocalStorageService implements StorageService {
    private final Path rootLocation;

    public LocalStorageService(@Value("${storage.location}") String storageLocation) {
        this.rootLocation = Paths.get(storageLocation);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage location", e);
        }
    }

    @Override
    public String uploadDocument(MultipartFile file, String prefix) {
        try {
            String key = generateKey(prefix, file.getOriginalFilename());
            Path destinationFile = this.rootLocation.resolve(Paths.get(key)).normalize().toAbsolutePath();
            
            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Cannot store file outside current directory.");
            }
            
            Files.copy(file.getInputStream(), destinationFile);
            return key;
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public byte[] downloadDocument(String key) {
        try {
            Path file = rootLocation.resolve(key);
            return Files.readAllBytes(file);
        } catch (IOException e) {
            log.error("Failed to read stored file", e);
            throw new RuntimeException("Failed to read stored file", e);
        }
    }

    @Override
    public void deleteDocument(String key) {
        try {
            Path file = rootLocation.resolve(key);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            log.error("Failed to delete file", e);
            throw new RuntimeException("Failed to delete file", e);
        }
    }

    private String generateKey(String prefix, String fileName) {
        return prefix + "/" + UUID.randomUUID() + "-" + fileName;
    }
}