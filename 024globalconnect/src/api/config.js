// src/config.js
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:8000/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export { API_CONFIG };
