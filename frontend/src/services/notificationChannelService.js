import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create axios instance with auth header
const axiosInstance = (token) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

const notificationChannelService = {
  // Get all available notification channels
  getAvailableChannels: async (token) => {
    return await axiosInstance(token).get('/notifications/channels');
  },

  // Get user's notification channel preferences
  getChannelPreferences: async (token) => {
    return await axiosInstance(token).get('/notifications/channels/preferences');
  },

  // Update user's notification channel preferences
  updateChannelPreferences: async (token, preferences) => {
    return await axiosInstance(token).put('/notifications/channels/preferences', preferences);
  },

  // Verify phone number for SMS/WhatsApp
  verifyPhoneNumber: async (token, phoneData) => {
    return await axiosInstance(token).post('/notifications/channels/phone/verify', phoneData);
  },

  // Confirm phone verification code
  confirmPhoneVerification: async (token, verificationData) => {
    return await axiosInstance(token).post('/notifications/channels/phone/confirm', verificationData);
  },

  // Send test notification to a specific channel
  sendTestNotification: async (token, channelType) => {
    return await axiosInstance(token).post(`/notifications/channels/${channelType}/test`);
  },

  // Configure SMS settings
  configureSmsSettings: async (token, smsConfig) => {
    return await axiosInstance(token).post('/notifications/channels/sms/configure', smsConfig);
  },

  // Configure WhatsApp settings
  configureWhatsAppSettings: async (token, whatsappConfig) => {
    return await axiosInstance(token).post('/notifications/channels/whatsapp/configure', whatsappConfig);
  },

  // Configure Twilio settings
  configureTwilioSettings: async (token, twilioConfig) => {
    return await axiosInstance(token).post('/notifications/channels/twilio/configure', twilioConfig);
  },

  // Get notification delivery status
  getNotificationDeliveryStatus: async (token, notificationId) => {
    return await axiosInstance(token).get(`/notifications/${notificationId}/delivery-status`);
  },

  // Get notification channel statistics
  getChannelStatistics: async (token, channelType, period = 'month') => {
    return await axiosInstance(token).get(`/notifications/channels/${channelType}/statistics`, {
      params: { period }
    });
  },

  // Opt-out from a specific notification channel
  optOutFromChannel: async (token, channelType) => {
    return await axiosInstance(token).post(`/notifications/channels/${channelType}/opt-out`);
  },

  // Opt-in to a specific notification channel
  optInToChannel: async (token, channelType) => {
    return await axiosInstance(token).post(`/notifications/channels/${channelType}/opt-in`);
  }
};

export default notificationChannelService;