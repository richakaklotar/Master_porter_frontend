import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "https://localhost:44361"}/api/Components`;

const getComponents = () => {
    return axios.get(API_URL);
};

const getComponentById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const createComponent = (component) => {
    return axios.post(API_URL, component);
};

const updateComponent = (id, component) => {
    return axios.put(`${API_URL}/${id}`, component);
};

const deleteComponent = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

export default {
    getComponents,
    getComponentById,
    createComponent,
    updateComponent,
    deleteComponent
};