// api/services/globalConnectService.js
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const globalConnectService = {
  getOpportunities: async (filters = {}) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.OPPORTUNITIES, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch opportunities' };
    }
  },

  getPartnerships: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PARTNERSHIPS);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch partnerships' };
    }
  },

  getServices: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SERVICES);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch services' };
    }
  }
};