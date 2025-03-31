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

const notificationService = {
  // Get all notifications for current user
  getNotifications: async (token, params = {}) => {
    return await axiosInstance(token).get('/notifications', { params });
  },

  // Get a single notification by ID
  getNotificationById: async (token, id) => {
    return await axiosInstance(token).get(`/notifications/${id}`);
  },

  // Mark notification as read
  markAsRead: async (token, id) => {
    return await axiosInstance(token).put(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (token) => {
    return await axiosInstance(token).put('/notifications/read-all');
  },

  // Delete a notification
  deleteNotification: async (token, id) => {
    return await axiosInstance(token).delete(`/notifications/${id}`);
  },
  
  // Update notification preferences
  updatePreferences: async (token, preferences) => {
    return await axiosInstance(token).put('/notifications/preferences', preferences);
  },
  
  // Get notification preferences
  getPreferences: async (token) => {
    return await axiosInstance(token).get('/notifications/preferences');
  },
  
  // Subscribe to push notifications
  subscribeToPush: async (token, subscription) => {
    return await axiosInstance(token).post('/notifications/push-subscribe', subscription);
  },
  
  // Unsubscribe from push notifications
  unsubscribeFromPush: async (token) => {
    return await axiosInstance(token).delete('/notifications/push-subscribe');
  }
};

export default notificationService;