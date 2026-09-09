import axios from "axios";

const API_URL = `${
  import.meta.env.VITE_API_BASE_URL ||
  "https://localhost:44361"
}/api/Activities`;

// =====================================================
// GET ALL ACTIVITIES
// =====================================================
const getActivities = () => {
  return axios.get(API_URL);
};

// =====================================================
// GET ACTIVITY BY ID
// =====================================================
const getActivityById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

// =====================================================
// CREATE ACTIVITY
// =====================================================
const createActivity = (activity) => {
  return axios.post(API_URL, activity);
};

// =====================================================
// UPDATE ACTIVITY
// =====================================================
const updateActivity = (id, activity) => {
  return axios.put(`${API_URL}/${id}`, activity);
};

// =====================================================
// DELETE ACTIVITY
// =====================================================
const deleteActivity = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

const activityService = {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
};

export default activityService;