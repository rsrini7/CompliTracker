package com.complitracker.notification.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
@ConditionalOnProperty(prefix = "notification.channels", name = "sms.enabled", havingValue = "true")
public class SMSService {
    public void sendSMS(String userId, String message) {
        try {
            // TODO: Get user's phone number from user service
            String phoneNumber = getUserPhoneNumber(userId);
            
            // TODO: Implement actual SMS sending logic
            // This is a placeholder for SMS provider integration
            sendSMSToProvider(phoneNumber, message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send SMS: " + e.getMessage(), e);
        }
    }

    private String getUserPhoneNumber(String userId) {
        // TODO: Implement user phone number retrieval from user service
        // This should be implemented to fetch the user's verified phone number
        throw new UnsupportedOperationException("Method not implemented");
    }

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromPhoneNumber;

    private void sendSMSToProvider(String phoneNumber, String message) {
        if (accountSid.isEmpty() || authToken.isEmpty() || fromPhoneNumber.isEmpty()) {
            throw new RuntimeException("Twilio configuration is incomplete");
        }
        try {
            Twilio.init(accountSid, authToken);
            Message.creator(
                new PhoneNumber(phoneNumber),
                new PhoneNumber(fromPhoneNumber),
                message
            ).create();
        } catch (Exception e) {
            throw new RuntimeException("Failed to send SMS via Twilio: " + e.getMessage(), e);
        }
    }
}