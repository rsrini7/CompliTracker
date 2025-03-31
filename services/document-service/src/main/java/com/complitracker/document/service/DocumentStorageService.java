package com.complitracker.document.service;

import com.complitracker.document.exception.DocumentStorageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentStorageService {
    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public String uploadDocument(MultipartFile file, String prefix) {
        try {
            String key = generateS3Key(prefix, file.getOriginalFilename());
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return key;
        } catch (IOException | S3Exception e) {
            log.error("Error uploading document to S3", e);
            throw new DocumentStorageException("Failed to upload document", e);
        }
    }

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
            throw new DocumentStorageException("Failed to download document", e);
        }
    }

    public void deleteDocument(String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (S3Exception e) {
            log.error("Error deleting document from S3", e);
            throw new DocumentStorageException("Failed to delete document", e);
        }
    }

    private String generateS3Key(String prefix, String fileName) {
        return String.format("%s/%s/%s", prefix, UUID.randomUUID(), fileName);
    }
}