import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "https://localhost:44361"}/api/Activities`;

const getActivities = () => {
    return axios.get(API_URL);
};

const getActivityById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const createActivity = (activity) => {
    return axios.post(API_URL, activity);
};

const updateActivity = (id, activity) => {
    return axios.put(`${API_URL}/${id}`, activity);
};

const deleteActivity = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

export default {
    getActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity
};