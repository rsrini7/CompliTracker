import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Create axios instance with auth header
const axiosInstance = (token) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

const complianceService = {
  // Get all compliance items with optional filters
  getComplianceItems: async (token, filters = {}) => {
    return await axiosInstance(token).get("/compliance", { params: filters });
  },

  // Get a single compliance item by ID
  getComplianceById: async (token, id) => {
    return await axiosInstance(token).get(`/compliance/${id}`);
  },

  // Create a new compliance item
  createCompliance: async (token, complianceData) => {
    return await axiosInstance(token).post("/compliance", complianceData);
  },

  // Update an existing compliance item
  updateCompliance: async (token, id, complianceData) => {
    return await axiosInstance(token).put(`/compliance/${id}`, complianceData);
  },

  // Delete a compliance item
  deleteCompliance: async (token, id) => {
    return await axiosInstance(token).delete(`/compliance/${id}`);
  },

  // Get compliance statistics
  getComplianceStats: async (token) => {
    return await axiosInstance(token).get("/compliance/stats");
  },

  // Get upcoming compliance deadlines
  getUpcomingDeadlines: async (token, days = 30) => {
    return await axiosInstance(token).get("/compliance/deadlines", {
      params: { days },
    });
  },

  // Mark compliance item as complete
  markAsComplete: async (token, id, completionData) => {
    return await axiosInstance(token).post(
      `/compliance/${id}/complete`,
      completionData,
    );
  },

  // Get compliance history for an item
  getComplianceHistory: async (token, id) => {
    return await axiosInstance(token).get(`/compliance/${id}/history`);
  },

  // Get compliance areas
  getComplianceAreas: async (token) => {
    return await axiosInstance(token).get("/compliance/areas");
  },
};

export default complianceService;
