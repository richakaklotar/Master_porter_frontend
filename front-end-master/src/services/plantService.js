import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "https://localhost:44361"}/api/Plant`;

const getPlants = () => {
  return axios.get(API_URL);
};

const getPlantById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

const createPlant = (plant) => {
  return axios.post(API_URL, plant);
};

const updatePlant = (id, plant) => {
  return axios.put(`${API_URL}/${id}`, plant);
};

const deletePlant = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
};