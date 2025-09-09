// src/api/api.js
import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Django backend URL
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - runs before every request
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging (remove in production)
    console.log('Making request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
  (response) => {
    // Log successful response (remove in production)
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden: You don\'t have permission');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', data?.message || error.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - check if backend is running');
    } else {
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods for different HTTP operations
export const apiMethods = {
  // GET request
  get: (url, params = {}) => {
    return api.get(url, { params });
  },
  
  // POST request
  post: (url, data = {}) => {
    return api.post(url, data);
  },
  
  // PUT request
  put: (url, data = {}) => {
    return api.put(url, data);
  },
  
  // PATCH request
  patch: (url, data = {}) => {
    return api.patch(url, data);
  },
  
  // DELETE request
  delete: (url) => {
    return api.delete(url);
  },
  
  // Upload file
  uploadFile: (url, file, onUploadProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }
};

export default api;