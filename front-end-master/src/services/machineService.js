import axios from "axios";

const API_URL = `${
  import.meta.env.VITE_API_BASE_URL || "https://localhost:44361"
}/api/Machine`;

const getMachines = () => {
  return axios.get(API_URL);
};

const getMachineById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

const createMachine = (machine) => {
  return axios.post(API_URL, machine);
};

const updateMachine = (id, machine) => {
  return axios.put(`${API_URL}/${id}`, machine);
};

const deleteMachine = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
};