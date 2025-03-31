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

const ssoService = {
  // Get available SSO providers
  getProviders: async () => {
    return await axios.get(`${API_URL}/auth/sso/providers`);
  },

  // Initiate SSO authentication with a provider
  initiateSSO: async (provider) => {
    return await axios.get(`${API_URL}/auth/sso/${provider}/authorize`);
  },

  // Complete SSO authentication (callback handler)
  completeSSO: async (provider, code, state) => {
    return await axios.post(`${API_URL}/auth/sso/${provider}/callback`, { code, state });
  },

  // Link SSO provider to existing account
  linkProvider: async (token, provider, code) => {
    return await axiosInstance(token).post(`/auth/sso/${provider}/link`, { code });
  },

  // Unlink SSO provider from account
  unlinkProvider: async (token, provider) => {
    return await axiosInstance(token).delete(`/auth/sso/${provider}/link`);
  },

  // Get linked providers for current user
  getLinkedProviders: async (token) => {
    return await axiosInstance(token).get('/auth/sso/linked');
  }
};

export default ssoService;