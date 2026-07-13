import axios from 'axios';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://fastapi_server:8000';

export const fastapiService = {
  getProjects: async () => {
    const response = await axios.get(`${FASTAPI_URL}/projects`);
    return response.data;
  },
  createProject: async (projectData) => {
    const response = await axios.post(`${FASTAPI_URL}/projects`, projectData);
    return response.data;
  },
  createTask: async (projectId, taskData) => {
    const response = await axios.post(`${FASTAPI_URL}/projects/${projectId}/tasks`, taskData);
    return response.data;
  }
};
