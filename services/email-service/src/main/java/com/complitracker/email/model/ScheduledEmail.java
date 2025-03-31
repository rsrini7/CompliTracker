package com.complitracker.email.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@Table(name = "scheduled_emails")
public class ScheduledEmail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private EmailTemplate template;

    @Column(nullable = false)
    private String recipient;

    @Column(columnDefinition = "TEXT")
    private String templateData;

    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    private LocalDateTime sentTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailStatus status;

    private String errorMessage;

    private Integer retryCount;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private String createdBy;
}