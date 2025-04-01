package com.complitracker.document.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import java.net.URI;

@Configuration
@ConditionalOnProperty(prefix = "aws", name = "accessKeyId")
public class S3Config {
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    @Value("${aws.accessKeyId}")
    private String accessKeyId;

    @Value("${aws.secretKey}")
    private String secretKey;

    @Value("${aws.region}")
    private String region;

    @Value("${aws.s3.endpoint:#{null}}")
    private String s3Endpoint;

    @Bean
    public S3Client s3Client() {
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretKey);
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials));

        if (s3Endpoint != null && !s3Endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(s3Endpoint));
        }

        S3Client client = builder.build();
        ensureBucketExists(client);
        return client;
    }

    private void ensureBucketExists(S3Client s3Client) {
        try {
            s3Client.headBucket(b -> b.bucket(bucketName));
        } catch (software.amazon.awssdk.services.s3.model.NoSuchBucketException e) {
            s3Client.createBucket(b -> b.bucket(bucketName));
        }
    }
}