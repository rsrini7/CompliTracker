package com.complitracker.notification.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {
    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.whatsapp.from}")
    private String fromNumber;

    public void sendWhatsAppMessage(String userId, String message) {
        try {
            // Initialize Twilio client
            Twilio.init(accountSid, authToken);

            // Get user's phone number from user service or preferences
            String userPhoneNumber = getUserPhoneNumber(userId);
            
            // Create and send WhatsApp message
            Message.creator(
                new PhoneNumber("whatsapp:" + userPhoneNumber),
                new PhoneNumber("whatsapp:" + fromNumber),
                message
            ).create();
        } catch (Exception e) {
            throw new RuntimeException("Failed to send WhatsApp message: " + e.getMessage(), e);
        }
    }

    private String getUserPhoneNumber(String userId) {
        // TODO: Implement user phone number retrieval from user service
        // This should be implemented to fetch the user's verified WhatsApp number
        throw new UnsupportedOperationException("Method not implemented");
    }
}