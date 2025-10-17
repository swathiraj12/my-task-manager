// client/src/services/authService.js
import axios from 'axios';

// const API_BASE_URL = 'https://my-task-manager-api-smiy.onrender.com/api/auth';
const API_BASE_URL = 'http://localhost:5000/api/auth';

// Register user
export const register = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/register`, userData);
  if (response.data.data.token) {
    // Store user and token in local storage for session persistence
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data.data;
};

// Login user
export const login = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/login`, userData);
  if (response.data.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};