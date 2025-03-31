package com.complitracker.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private boolean read;

    @ElementCollection
    @CollectionTable(name = "notification_delivery_status", joinColumns = @JoinColumn(name = "notification_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name = "channel")
    @Column(name = "status")
    private Map<NotificationChannel, String> deliveryStatus = new HashMap<>();

    public void addDeliveryStatus(NotificationChannel channel, String status) {
        deliveryStatus.put(channel, status);
    }
}