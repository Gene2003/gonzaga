// src/config.js
const API_CONFIG = {
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://gonzaga-u98x.onrender.com/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

export { API_CONFIG };
