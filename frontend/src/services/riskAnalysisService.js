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

const riskAnalysisService = {
  // Get risk analysis for a compliance item
  getComplianceRiskAnalysis: async (token, complianceId) => {
    return await axiosInstance(token).get(`/risk-analysis/compliance/${complianceId}`);
  },

  // Get risk analysis for a document
  getDocumentRiskAnalysis: async (token, documentId) => {
    return await axiosInstance(token).get(`/risk-analysis/document/${documentId}`);
  },

  // Get overall organization risk score
  getOrganizationRiskScore: async (token) => {
    return await axiosInstance(token).get('/risk-analysis/organization');
  },

  // Get risk factors for a specific compliance area
  getRiskFactors: async (token, complianceArea) => {
    return await axiosInstance(token).get(`/risk-analysis/factors/${complianceArea}`);
  },

  // Run risk assessment on a specific compliance item
  runComplianceRiskAssessment: async (token, complianceId, assessmentData = {}) => {
    return await axiosInstance(token).post(`/risk-analysis/compliance/${complianceId}/assess`, assessmentData);
  },

  // Run risk assessment on a document
  runDocumentRiskAssessment: async (token, documentId, assessmentData = {}) => {
    return await axiosInstance(token).post(`/risk-analysis/document/${documentId}/assess`, assessmentData);
  },

  // Get risk mitigation recommendations
  getRiskMitigationRecommendations: async (token, riskId) => {
    return await axiosInstance(token).get(`/risk-analysis/mitigations/${riskId}`);
  },

  // Apply risk mitigation strategy
  applyRiskMitigation: async (token, riskId, mitigationData) => {
    return await axiosInstance(token).post(`/risk-analysis/mitigations/${riskId}/apply`, mitigationData);
  },

  // Get historical risk analysis data
  getRiskAnalysisHistory: async (token, entityType, entityId) => {
    return await axiosInstance(token).get(`/risk-analysis/history/${entityType}/${entityId}`);
  },

  // Generate risk analysis report
  generateRiskReport: async (token, reportParams = {}) => {
    return await axiosInstance(token).post('/risk-analysis/reports/generate', reportParams);
  },

  // Get AI-based risk predictions
  getRiskPredictions: async (token, entityType, entityId) => {
    return await axiosInstance(token).get(`/risk-analysis/predictions/${entityType}/${entityId}`);
  }
};

export default riskAnalysisService;