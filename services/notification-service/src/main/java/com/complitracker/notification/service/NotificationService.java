package com.complitracker.notification.service;

import com.complitracker.notification.exception.NotificationDeliveryException;
import com.complitracker.notification.model.Notification;
import com.complitracker.notification.model.NotificationChannel;
import com.complitracker.notification.model.NotificationPreference;
import com.complitracker.notification.model.NotificationType;
import com.complitracker.notification.repository.NotificationPreferenceRepository;
import com.complitracker.notification.repository.NotificationRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int MAX_RETRY_ATTEMPTS = 3;

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    @Autowired(required = false)
    private SMSService smsService;

    private final PushNotificationService pushService;

    @Autowired(required = false)
    private WhatsAppService whatsAppService;

    @Autowired(required = false)
    private EmailService emailService;

    public void sendNotification(
        String userId,
        String title,
        String message,
        NotificationType type
    ) {
        NotificationPreference preferences = preferenceRepository
            .findByUserId(userId)
            .orElse(getDefaultPreferences(userId));

        Set<NotificationChannel> channels = preferences.getChannelsForType(
            type
        );

        Notification notification = Notification.builder()
            .userId(userId)
            .title(title)
            .message(message)
            .type(type)
            .status("PENDING")
            .createdAt(LocalDateTime.now())
            .build();

        for (NotificationChannel channel : channels) {
            try {
                sendToChannel(notification, channel);
                notification.addDeliveryStatus(channel, "SENT");
            } catch (Exception e) {
                notification.addDeliveryStatus(channel, "FAILED");
            }
        }

        notificationRepository.save(notification);
    }

    private void sendToChannel(
        Notification notification,
        NotificationChannel channel
    ) {
        switch (channel) {
            case EMAIL:
                if (emailService != null) {
                    emailService.sendEmail(
                        notification.getUserId(),
                        notification.getTitle(),
                        notification.getMessage()
                    );
                }
                break;
            case SMS:
                if (smsService != null) {
                    smsService.sendSMS(
                        notification.getUserId(),
                        notification.getMessage()
                    );
                }
                break;
            case PUSH:
                pushService.sendPushNotification(
                    notification.getUserId(),
                    notification.getTitle(),
                    notification.getMessage()
                );
                break;
            case WHATSAPP:
                if (whatsAppService != null) {
                    whatsAppService.sendWhatsAppMessage(
                        notification.getUserId(),
                        notification.getMessage()
                    );
                }
                break;
        }
    }

    public void updateNotificationPreferences(
        String userId,
        NotificationType type,
        Set<NotificationChannel> channels
    ) {
        NotificationPreference preferences = preferenceRepository
            .findByUserId(userId)
            .orElse(getDefaultPreferences(userId));

        preferences.setChannelsForType(type, channels);
        preferenceRepository.save(preferences);
    }

    private NotificationPreference getDefaultPreferences(String userId) {
        return NotificationPreference.builder()
            .userId(userId)
            .defaultChannels(Set.of(NotificationChannel.EMAIL))
            .build();
    }

    public List<Notification> getUserNotifications(
        String userId,
        boolean unreadOnly
    ) {
        return unreadOnly
            ? notificationRepository.findByUserIdAndReadFalse(userId)
            : notificationRepository.findByUserId(userId);
    }

    public void markNotificationAsRead(String notificationId) {
        Notification notification = notificationRepository
            .findById(notificationId)
            .orElseThrow(() ->
                new RuntimeException(
                    "Notification not found: " + notificationId
                )
            );

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    public NotificationPreference getUserPreferences(String userId) {
        return preferenceRepository
            .findByUserId(userId)
            .orElse(getDefaultPreferences(userId));
    }

    public void sendComplianceDeadlineNotification(
        String userId,
        String complianceTitle,
        LocalDateTime deadline
    ) {
        String title = "Compliance Deadline Reminder";
        String message = String.format(
            "The deadline for compliance item '%s' is approaching: %s",
            complianceTitle,
            deadline.toString()
        );

        sendNotification(
            userId,
            title,
            message,
            NotificationType.COMPLIANCE_DEADLINE
        );
    }

    public void sendSignatureRequestNotification(
        String userId,
        String documentTitle
    ) {
        String title = "Signature Request";
        String message = String.format(
            "You have a new signature request for document: %s",
            documentTitle
        );

        sendNotification(
            userId,
            title,
            message,
            NotificationType.SIGNATURE_REQUEST
        );
    }

    public void sendRiskAlertNotification(
        String userId,
        String complianceTitle,
        String riskLevel
    ) {
        String title = "Risk Alert";
        String message = String.format(
            "High risk detected for compliance item '%s'. Risk Level: %s",
            complianceTitle,
            riskLevel
        );

        sendNotification(userId, title, message, NotificationType.RISK_ALERT);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications =
            notificationRepository.findByUserIdAndReadFalse(userId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
}
