import axios from "axios";

const API_URL = "https://localhost:44361/api/SubActivities";

const getSubActivities = () => {
  return axios.get(API_URL);
};

const getSubActivityById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

const createSubActivity = (data) => {
  return axios.post(API_URL, data);
};

const updateSubActivity = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data);
};

const deleteSubActivity = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getSubActivities,
  getSubActivityById,
  createSubActivity,
  updateSubActivity,
  deleteSubActivity,
};