package com.complitracker.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @ElementCollection
    @CollectionTable(name = "notification_channel_mappings", joinColumns = @JoinColumn(name = "preference_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name = "notification_type")
    @Column(name = "channels")
    private Map<NotificationType, Set<NotificationChannel>> channelPreferences = new EnumMap<>(NotificationType.class);

    @ElementCollection
    @CollectionTable(name = "default_notification_channels", joinColumns = @JoinColumn(name = "preference_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "channel")
    private Set<NotificationChannel> defaultChannels;

    public Set<NotificationChannel> getChannelsForType(NotificationType type) {
        return channelPreferences.getOrDefault(type, defaultChannels);
    }

    public void setChannelsForType(NotificationType type, Set<NotificationChannel> channels) {
        channelPreferences.put(type, channels);
    }
}