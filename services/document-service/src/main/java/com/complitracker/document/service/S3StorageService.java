package com.complitracker.document.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
// @ConditionalOnBean(S3Client.class)
public class S3StorageService implements StorageService {
    private final S3Client s3Client;
    private final String bucketName;

    public S3StorageService(S3Client s3Client, @Value("${aws.s3.bucket-name}") String bucketName) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    @Override
    public String uploadDocument(MultipartFile file, String prefix) {
        try {
            String key = generateKey(prefix, file.getOriginalFilename());
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return key;
        } catch (IOException | S3Exception e) {
            log.error("Error uploading document to S3", e);
            throw new RuntimeException("Failed to upload document", e);
        }
    }

    @Override
    public byte[] downloadDocument(String key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            return s3Client.getObject(getObjectRequest)
                    .readAllBytes();
        } catch (IOException | S3Exception e) {
            log.error("Error downloading document from S3", e);
            throw new RuntimeException("Failed to download document", e);
        }
    }

    @Override
    public void deleteDocument(String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (S3Exception e) {
            log.error("Error deleting document from S3", e);
            throw new RuntimeException("Failed to delete document", e);
        }
    }

    private String generateKey(String prefix, String fileName) {
        return prefix + "/" + UUID.randomUUID() + "-" + fileName;
    }
}