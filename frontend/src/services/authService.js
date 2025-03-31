import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const authService = {
  // Login user and get token
  login: async (credentials) => {
    return await axios.post(`${API_URL}/auth/login`, credentials);
  },

  // Register new user
  register: async (userData) => {
    return await axios.post(`${API_URL}/auth/register`, userData);
  },

  // Get current user information
  getCurrentUser: async (token) => {
    return await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    return await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
  },

  // Verify token is valid
  verifyToken: async (token) => {
    return await axios.post(`${API_URL}/auth/verify-token`, { token });
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    return await axios.post(`${API_URL}/auth/forgot-password`, { email });
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    return await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword
    });
  }
};

export default authService;