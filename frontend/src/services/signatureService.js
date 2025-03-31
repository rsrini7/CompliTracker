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

const signatureService = {
  // Get available signature providers
  getSignatureProviders: async (token) => {
    return await axiosInstance(token).get('/signatures/providers');
  },

  // Configure signature provider settings
  configureProvider: async (token, provider, config) => {
    return await axiosInstance(token).post(`/signatures/providers/${provider}/configure`, config);
  },

  // Get DocuSign OAuth URL for connecting account
  getDocuSignAuthUrl: async (token) => {
    return await axiosInstance(token).get('/signatures/docusign/auth');
  },

  // Complete DocuSign OAuth connection
  completeDocuSignAuth: async (token, code) => {
    return await axiosInstance(token).post('/signatures/docusign/callback', { code });
  },

  // Get Adobe Sign OAuth URL for connecting account
  getAdobeSignAuthUrl: async (token) => {
    return await axiosInstance(token).get('/signatures/adobesign/auth');
  },

  // Complete Adobe Sign OAuth connection
  completeAdobeSignAuth: async (token, code) => {
    return await axiosInstance(token).post('/signatures/adobesign/callback', { code });
  },

  // Create signature request using DocuSign
  createDocuSignRequest: async (token, documentId, signatories, options = {}) => {
    return await axiosInstance(token).post('/signatures/docusign/create', {
      documentId,
      signatories,
      ...options
    });
  },

  // Create signature request using Adobe Sign
  createAdobeSignRequest: async (token, documentId, signatories, options = {}) => {
    return await axiosInstance(token).post('/signatures/adobesign/create', {
      documentId,
      signatories,
      ...options
    });
  },

  // Get signature request status
  getSignatureRequestStatus: async (token, provider, requestId) => {
    return await axiosInstance(token).get(`/signatures/${provider}/status/${requestId}`);
  },

  // Cancel signature request
  cancelSignatureRequest: async (token, provider, requestId) => {
    return await axiosInstance(token).delete(`/signatures/${provider}/requests/${requestId}`);
  },

  // Send reminder to signatories
  sendSignatureReminder: async (token, provider, requestId, signatoryEmails = []) => {
    return await axiosInstance(token).post(`/signatures/${provider}/requests/${requestId}/remind`, {
      signatoryEmails
    });
  },

  // Download signed document
  downloadSignedDocument: async (token, provider, requestId) => {
    return await axiosInstance(token).get(`/signatures/${provider}/requests/${requestId}/download`, {
      responseType: 'blob'
    });
  },

  // Get signature audit trail
  getSignatureAuditTrail: async (token, provider, requestId) => {
    return await axiosInstance(token).get(`/signatures/${provider}/requests/${requestId}/audit`);
  }
};

export default signatureService;