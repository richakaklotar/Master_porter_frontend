import axios from "axios";

const API_BASE_URL = "https://localhost:44361/api/Designation";

const designationService = {
  getDesignations: async () => {
    return await axios.get(API_BASE_URL);
  },

  getDesignationById: async (id) => {
    return await axios.get(`${API_BASE_URL}/${id}`);
  },

  createDesignation: async (data) => {
    return await axios.post(API_BASE_URL, data);
  },

  updateDesignation: async (id, data) => {
    // URL format: /api/Designation/1
    return await axios.put(`${API_BASE_URL}/${id}`, data);
  },

  deleteDesignation: async (id) => {
    // URL format: /api/Designation/1
    return await axios.delete(`${API_BASE_URL}/${id}`);
  },
};

export default designationService;