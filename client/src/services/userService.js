// client/src/services/userService.js
import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api/users';
const API_BASE_URL = 'https://my-task-manager-api-smiy.onrender.com/api/users';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Function for managers to get a list of all employees
export const getEmployees = async () => {
  try {
    const response = await api.get('/employees');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};