package com.complitracker.authservice.security.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SecurityAuditService {
    private static final Logger logger = LoggerFactory.getLogger(SecurityAuditService.class);
    private final Map<String, AuditEvent> auditEvents = new ConcurrentHashMap<>();

    public void logAuthenticationSuccess(String username, String provider) {
        AuditEvent event = new AuditEvent(
            "AUTHENTICATION_SUCCESS",
            username,
            provider,
            "User successfully authenticated",
            LocalDateTime.now()
        );
        logEvent(event);
    }

    public void logAuthenticationFailure(String username, String provider, String reason) {
        AuditEvent event = new AuditEvent(
            "AUTHENTICATION_FAILURE",
            username,
            provider,
            "Authentication failed: " + reason,
            LocalDateTime.now()
        );
        logEvent(event);
    }

    public void logAccountLocked(String username) {
        AuditEvent event = new AuditEvent(
            "ACCOUNT_LOCKED",
            username,
            "system",
            "Account locked due to multiple failed login attempts",
            LocalDateTime.now()
        );
        logEvent(event);
    }

    public void logTokenRefresh(String username) {
        AuditEvent event = new AuditEvent(
            "TOKEN_REFRESH",
            username,
            "system",
            "User refreshed their authentication token",
            LocalDateTime.now()
        );
        logEvent(event);
    }

    public void logRoleChange(String username, String role, String action) {
        AuditEvent event = new AuditEvent(
            "ROLE_CHANGE",
            username,
            "system",
            String.format("User role %s: %s", action, role),
            LocalDateTime.now()
        );
        logEvent(event);
    }

    public void logPasswordChange(String username) {
        AuditEvent event = new AuditEvent(
            "PASSWORD_CHANGE",
            username,
            "system",
            "User changed their password",
            LocalDateTime.now()
        );
        logEvent(event);
    }

    private void logEvent(AuditEvent event) {
        auditEvents.put(event.getTimestamp().toString() + "-" + event.getUsername(), event);
        logger.info("Security Audit: {} - {} - {} - {}",
            event.getEventType(),
            event.getUsername(),
            event.getMessage(),
            event.getTimestamp());
    }

    private static class AuditEvent {
        private final String eventType;
        private final String username;
        private final String provider;
        private final String message;
        private final LocalDateTime timestamp;

        public AuditEvent(String eventType, String username, String provider, String message, LocalDateTime timestamp) {
            this.eventType = eventType;
            this.username = username;
            this.provider = provider;
            this.message = message;
            this.timestamp = timestamp;
        }

        public String getEventType() { return eventType; }
        public String getUsername() { return username; }
        public String getProvider() { return provider; }
        public String getMessage() { return message; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }
}