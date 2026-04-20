/**
 * The Communication Bridge (API Config)
 * 
 * relative path: /src/services/api.js
 * 
 * This file is the "Voice" of the frontend. It uses Axios to talk to 
 * our Node.js server. 
 * 
 * It is configured to automatically handle authentication so developers 
 * don't have to manually attach tokens to every single request.
 */

import axios from 'axios';

// --- DYNAMIC HOST DETECTION ---
// This snippet lets the app work on Localhost AND on mobile devices 
// connected to the same WiFi (by using the computer's IP).
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

/**
 * --- AUTHENTICATION INTERCEPTOR ---
 * Before any request leaves the browser, this "Passport Check" checks if 
 * the user is logged in. If they are, it automatically attaches their 
 * Security Token (JWT) to the header.
 */
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
