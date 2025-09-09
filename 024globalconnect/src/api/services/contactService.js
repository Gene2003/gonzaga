// api/services/contactService.js
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const contactService = {
  submitContactForm: async (formData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONTACT_FORM, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit contact form' };
    }
  }
};
