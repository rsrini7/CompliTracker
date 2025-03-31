package com.complitracker.core.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
public enum CalendarProvider {
    GOOGLE("Google Calendar", ""),
    OUTLOOK("Microsoft Outlook", "");

    CalendarProvider(String displayName, String accessToken) {
        this.displayName = displayName;
        this.accessToken = accessToken;
    }

    private final String displayName;
    private String accessToken;

    public String getType() {
        return this.name();
    }

    public static CalendarProvider fromString(String type) {
        return valueOf(type.toUpperCase());
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }
}