import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "https://localhost:44361"}/api/Employee`;

const getEmployees = () => {
  return axios.get(API_URL);
};

const getEmployeeById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

const createEmployee = (data) => {
  return axios.post(API_URL, data);
};

const updateEmployee = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data);
};

const deleteEmployee = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};