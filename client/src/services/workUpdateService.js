// client/src/services/workUpdateService.js
import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api/updates';
const API_BASE_URL = 'https://my-task-manager-api-smiy.onrender.com/api/updates';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Function for a manager to add a remark to a work update
export const addManagerRemark = async (updateId, remarkText) => {
  try {
    const response = await api.put(`/${updateId}/remark`, { remark: remarkText });
    return response.data.data;
  } catch (error) {
    console.error(`Error adding remark to update ${updateId}:`, error);
    throw error;
  }
};

// Function for an employee to acknowledge a manager's remark
export const acknowledgeRemark = async (updateId) => {
  try {
    const response = await api.put(`/${updateId}/acknowledge`);
    return response.data.data;
  } catch (error) {
    console.error(`Error acknowledging remark for update ${updateId}:`, error);
    throw error;
  }
};