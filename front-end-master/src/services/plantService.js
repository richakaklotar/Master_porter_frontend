import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "https://localhost:44361"}/api/Plant`;

const plantService = {

    getPlants: async () => {
        return await axios.get(API_URL);
    },

    getPlantById: async (id) => {
        return await axios.get(`${API_URL}/${id}`);
    },

    createPlant: async (plant) => {
        return await axios.post(API_URL, plant, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    },

    updatePlant: async (id, plant) => {
        return await axios.put(`${API_URL}/${id}`, plant, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    },

    deletePlant: async (id) => {
        return await axios.delete(`${API_URL}/${id}`);
    }
};

export default plantService;