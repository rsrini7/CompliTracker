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

// Create form data axios instance for file uploads
const formDataInstance = (token) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });
};

const documentService = {
  // Get all documents with optional filters
  getDocuments: async (token, filters = {}) => {
    return await axiosInstance(token).get('/documents', { params: filters });
  },

  // Get a single document by ID
  getDocumentById: async (token, id) => {
    return await axiosInstance(token).get(`/documents/${id}`);
  },

  // Upload a new document
  uploadDocument: async (token, documentData, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add document metadata
    Object.keys(documentData).forEach(key => {
      formData.append(key, documentData[key]);
    });
    
    return await formDataInstance(token).post('/documents/upload', formData);
  },

  // Update document metadata
  updateDocument: async (token, id, documentData) => {
    return await axiosInstance(token).put(`/documents/${id}`, documentData);
  },

  // Delete a document
  deleteDocument: async (token, id) => {
    return await axiosInstance(token).delete(`/documents/${id}`);
  },
  
  // Download a document
  downloadDocument: async (token, id) => {
    return await axiosInstance(token).get(`/documents/${id}/download`, {
      responseType: 'blob'
    });
  },
  
  // Share a document (generate sharing link)
  shareDocument: async (token, id, shareData) => {
    return await axiosInstance(token).post(`/documents/${id}/share`, shareData);
  },
  
  // Get document versions
  getDocumentVersions: async (token, id) => {
    return await axiosInstance(token).get(`/documents/${id}/versions`);
  },
  
  // Request document signature
  requestSignature: async (token, id, signatoryData) => {
    return await axiosInstance(token).post(`/documents/${id}/request-signature`, signatoryData);
  },
  
  // Check signature status
  checkSignatureStatus: async (token, signatureId) => {
    return await axiosInstance(token).get(`/documents/signatures/${signatureId}`);
  }
};

export default documentService;