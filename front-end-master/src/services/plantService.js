import axios from "axios";

const API_URL = `${
  import.meta.env.VITE_API_BASE_URL || "https://localhost:44361"
}/api/Plant`;

// GET ALL PLANTS
const getPlants = () => {
  return axios.get(API_URL);
};

// GET PLANT BY ID
const getPlantById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

// CREATE PLANT
const createPlant = (plant) => {
  return axios.post(API_URL, plant);
};

// UPDATE PLANT
const updatePlant = (id, plant) => {
  return axios.put(`${API_URL}/${id}`, plant);
};

// DELETE PLANT
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