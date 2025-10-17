// client/src/services/taskService.js
import axios from 'axios';

const API_BASE_URL = 'https://my-task-manager-api-smiy.onrender.com/api/tasks';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Function to get all tasks
export const getAllTasks = async () => {
  try {
    const response = await api.get('/');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error; // Re-throw the error to be handled by the component
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
