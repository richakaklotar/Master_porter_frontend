import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "https://localhost:44361"}/api/Shift`;

const getShifts = () => {
  return axios.get(API_URL);
};

const getShiftById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

const createShift = (data) => {
  return axios.post(API_URL, data);
};

const updateShift = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data);
};

const deleteShift = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
};