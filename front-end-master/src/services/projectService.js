import axios from "axios";

const API_URL = "https://localhost:44361/api/Project";

const getProjects = () => axios.get(API_URL);
const getProjectById = (id) => axios.get(`${API_URL}/${id}`);
const createProject = (project) => axios.post(API_URL, project);
const updateProject = (id, project) => axios.put(`${API_URL}/${id}`, project);
const deleteProject = (id) => axios.delete(`${API_URL}/${id}`);

export default {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};