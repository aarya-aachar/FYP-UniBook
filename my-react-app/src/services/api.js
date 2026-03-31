import axios from 'axios';

// Detect host to handle network IP or localhost correctly
const host = window.location.hostname || 'localhost';
const PORT = 4001; 
const baseURL = `http://${host}:${PORT}/api`;

console.log(`>>> [API] Connection Base URL: ${baseURL}`);

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
