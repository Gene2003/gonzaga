// src/api/services/authService.js
import axios from 'axios';
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';

const API_BASE_URL = 'http://localhost:8000/api';

export const authService = {
  login: async ({ username, password }) => {
    try {
      const payload = { username, password };
      const response = await apiClient.post(API_ENDPOINTS.TOKEN_OBTAIN, payload);

      if (response.data.access) {
        localStorage.setItem('authToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);

        if (!response.data.user) {
          const user = await authService.fetchCurrentUser();
          response.data.user = user;
        }

        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const registrationPayload = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirm_password,
        country: userData.country,
        city: userData.city,
        promotion_methods: userData.promotion_methods,
        role: userData.role,
      };

      const response = await axios.post(`${API_BASE_URL}/users/register/`, registrationPayload, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });

      return { success: true, ...response.data };
    } catch (error) {
      const errData = error.response?.data;
      if (errData) {
        if (typeof errData === 'object') {
          const formatted = {};
          for (const key in errData) {
            formatted[key] = Array.isArray(errData[key]) ? errData[key][0] : errData[key];
          }
          throw formatted;
        }
        throw { general: errData.detail || errData.message };
      }
      throw { general: error.message || 'Unexpected registration error' };
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('authToken');

      if (refreshToken && accessToken) {
        await apiClient.post(
          API_ENDPOINTS.LOGOUT,
          { refresh: refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  fetchCurrentUser: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CURRENT_USER, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }

    throw new Error('No user data returned');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  },

  getAuthToken: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp < Date.now() / 1000;

      if (isExpired) {
        const newToken = await authService.refreshAuthToken();
        return newToken;
      }

      return token;
    } catch {
      return null;
    }
  },

  getRefreshToken: () => localStorage.getItem('refreshToken'),

  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  refreshAuthToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      if (!newAccessToken) throw new Error('No access token returned');

      localStorage.setItem('authToken', newAccessToken);

      try {
        const user = await authService.fetchCurrentUser();
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.warn('User fetch after refresh failed:', e);
      }

      return newAccessToken;
    } catch (error) {
      await authService.logout();
      throw error;
    }
  },
};
