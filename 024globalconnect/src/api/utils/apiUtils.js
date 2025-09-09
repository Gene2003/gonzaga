// api/utils/apiutils.js

/**
 * Handles API errors and returns a user-friendly error message
 * @param {any} error - The error object or string
 * @returns {string} - User-friendly error message
 */
export const handleApiError = (error) => {
  // If error is a string, return it directly
  if (typeof error === 'string') {
    return error;
  }
  
  // If error has a message property
  if (error?.message) {
    return error.message;
  }
  
  // If error has a general property (our custom general errors)
  if (error?.general) {
    return error.general;
  }
  
  // If error has field-specific errors, return the first one
  if (error && typeof error === 'object') {
    const errorKeys = Object.keys(error);
    if (errorKeys.length > 0) {
      const firstError = error[errorKeys[0]];
      if (Array.isArray(firstError)) {
        return firstError[0];
      }
      return firstError;
    }
  }
  
  // Fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Helper function to format field errors for form display
 * @param {object} errors - The errors object
 * @returns {object} - Formatted errors object with first error for each field
 */
export const formatFieldErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return {};
  }
  
  const formattedErrors = {};
  
  Object.keys(errors).forEach(key => {
    const error = errors[key];
    if (Array.isArray(error)) {
      formattedErrors[key] = error[0];
    } else {
      formattedErrors[key] = error;
    }
  });
  
  return formattedErrors;
};

/**
 * Checks if an error object has field-specific errors
 * @param {any} error - The error object
 * @returns {boolean} - True if error has field errors
 */
export const hasFieldErrors = (error) => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  
  // Exclude common error properties that aren't field errors
  const excludeKeys = ['message', 'general', 'status', 'statusText', 'code'];
  const errorKeys = Object.keys(error).filter(key => !excludeKeys.includes(key));
  
  return errorKeys.length > 0;
};

/**
 * Gets all error messages from an error object as an array
 * @param {any} error - The error object
 * @returns {string[]} - Array of error messages
 */
export const getAllErrorMessages = (error) => {
  const messages = [];
  
  if (typeof error === 'string') {
    return [error];
  }
  
  if (error?.message) {
    messages.push(error.message);
  }
  
  if (error?.general) {
    messages.push(error.general);
  }
  
  if (error && typeof error === 'object') {
    const excludeKeys = ['message', 'general', 'status', 'statusText', 'code'];
    Object.keys(error).forEach(key => {
      if (!excludeKeys.includes(key)) {
        const fieldError = error[key];
        if (Array.isArray(fieldError)) {
          messages.push(...fieldError);
        } else if (typeof fieldError === 'string') {
          messages.push(fieldError);
        }
      }
    });
  }
  
  return messages.length > 0 ? messages : ['An unexpected error occurred. Please try again.'];
};

/**
 * Creates FormData from an object, handling arrays and files properly
 * @param {object} data - The data object to convert
 * @returns {FormData} - FormData object
 */
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item instanceof File) {
            formData.append(`${key}[${index}]`, item);
          } else {
            formData.append(`${key}[${index}]`, String(item));
          }
        });
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};

/**
 * Safely extracts error message from axios error
 * @param {object} axiosError - Axios error object
 * @returns {string} - Error message
 */
export const handleAxiosError = (axiosError) => {
  if (axiosError.response) {
    // Server responded with error status
    const { data } = axiosError.response;
    return handleApiError(data);
  } else if (axiosError.request) {
    // Network error
    return 'Network error. Please check your connection and try again.';
  } else {
    // Other error
    return axiosError.message || 'An error occurred.';
  }
};