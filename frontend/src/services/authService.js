import axios from "axios";

// axios.defaults.baseURL = `http://localhost:5173`

// Response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log(`API Response [${response.config.url}]:`, response);
    return response;
  },
  (error) => {
    console.error(`API Error [${error.config?.url}]:`, error.response || error);
    return Promise.reject(error);
  },
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const authService = {
  // Login user and get token
  login: async (credentials) => {
    return await axios.post(`${API_URL}/auth/login`, credentials);
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      console.log("Registration successful:", response);
      return response;
    } catch (err) {
      console.error("Registration error:", err.response || err);
      throw err;
    }
  },

  // Get current user information
  getCurrentUser: async (token) => {
    return await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      newPassword,
    });
  },
};

export default authService;
