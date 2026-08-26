import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "https://localhost:44361"}/api/Division`;

const getDivisions = () => {
    return axios.get(API_URL);
};

const getDivisionById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const createDivision = (division) => {
    return axios.post(API_URL, division);
};

const updateDivision = (id, division) => {
    return axios.put(`${API_URL}/${id}`, division);
};

const deleteDivision = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

export default {
    getDivisions,
    getDivisionById,
    createDivision,
    updateDivision,
    deleteDivision
};