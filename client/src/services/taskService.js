// client/src/services/taskService.js
import axios from 'axios';

const API_BASE_URL = 'https://my-task-manager-api-smiy.onrender.com/api/tasks';
// const API_BASE_URL = 'http://localhost:5000/api/tasks';

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

// Function to get all tasks
export const getAllTasks = async () => {
  try {
    const response = await api.get('/');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Function to create a new task
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/', taskData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Function to update an existing task
export const updateTask = async (taskId, updateData) => {
  try {
    const response = await api.put(`/${taskId}`, updateData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Function to delete a task
export const deleteTask = async (taskId) => {
  try {
    await api.delete(`/${taskId}`);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Gets a single task by its ID
export const getTaskById = async (taskId) => {
  try {
    const response = await api.get(`/${taskId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};

// Gets all work updates for a specific task
export const getTaskUpdates = async (taskId) => {
  try {
    const response = await api.get(`/${taskId}/updates`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching updates for task ${taskId}:`, error);
    throw error;
  }
};

// Adds a new work update to a specific task
export const addWorkUpdate = async (taskId, updateData) => {
  try {
    const response = await api.post(`/${taskId}/updates`, updateData);
    return response.data.data;
  } catch (error) {
    console.error(`Error adding update to task ${taskId}:`, error);
    throw error;
  }
};