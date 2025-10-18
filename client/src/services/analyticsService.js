// client/src/services/analyticsService.js
import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api/analytics';
const API_BASE_URL = 'https://my-task-manager-api-smiy.onrender.com/api/analytics';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Use an interceptor to add the auth token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Function for managers to get the analytics summary
export const getSummary = async () => {
  try {
    const response = await api.get('/summary');
    return response.data.data;
  } catch (error)
  {
    console.error('Error fetching analytics summary:', error);
    throw error;
  }
};