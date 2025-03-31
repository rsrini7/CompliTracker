package com.complitracker.notification.exception;

import com.complitracker.notification.model.NotificationChannel;

public class NotificationDeliveryException extends RuntimeException {
    private final NotificationChannel channel;
    private final String userId;
    private final int attempts;

    public NotificationDeliveryException(String message, NotificationChannel channel, String userId, int attempts) {
        super(message);
        this.channel = channel;
        this.userId = userId;
        this.attempts = attempts;
    }

    public NotificationDeliveryException(String message, NotificationChannel channel, String userId, int attempts, Throwable cause) {
        super(message, cause);
        this.channel = channel;
        this.userId = userId;
        this.attempts = attempts;
    }

    public NotificationChannel getChannel() {
        return channel;
    }

    public String getUserId() {
        return userId;
    }

    public int getAttempts() {
        return attempts;
    }
}