import axios from 'axios';
import authService from './authService';

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

const calendarService = {
  // Connect to Google Calendar
  connectGoogleCalendar: async (token) => {
    return await axiosInstance(token).get('/calendar/google/connect');
  },

  // Connect to Outlook Calendar
  connectOutlookCalendar: async (token) => {
    return await axiosInstance(token).get('/calendar/outlook/connect');
  },

  // Disconnect from Google Calendar
  disconnectGoogleCalendar: async (token) => {
    return await axiosInstance(token).delete('/calendar/google/disconnect');
  },

  // Disconnect from Outlook Calendar
  disconnectOutlookCalendar: async (token) => {
    return await axiosInstance(token).delete('/calendar/outlook/disconnect');
  },

  // Get connected calendar services
  getConnectedCalendars: async (token) => {
    return await axiosInstance(token).get('/calendar/connected');
  },

  // Sync compliance deadlines with calendar
  syncComplianceDeadlines: async (token, calendarType) => {
    return await axiosInstance(token).post(`/calendar/${calendarType}/sync-deadlines`);
  },

  // Get upcoming calendar events
  getUpcomingEvents: async (token, calendarType, days = 30) => {
    return await axiosInstance(token).get(`/calendar/${calendarType}/events`, {
      params: { days }
    });
  },

  // Create calendar event for compliance deadline
  createDeadlineEvent: async (token, calendarType, deadlineData) => {
    return await axiosInstance(token).post(`/calendar/${calendarType}/events`, deadlineData);
  },

  // Update calendar event
  updateEvent: async (token, calendarType, eventId, eventData) => {
    return await axiosInstance(token).put(`/calendar/${calendarType}/events/${eventId}`, eventData);
  },

  // Delete calendar event
  deleteEvent: async (token, calendarType, eventId) => {
    return await axiosInstance(token).delete(`/calendar/${calendarType}/events/${eventId}`);
  }
};

export default calendarService;