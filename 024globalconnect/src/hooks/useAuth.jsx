// src/hooks/useAuth.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../api/services/authService';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();

        if (currentUser && isAuth) {
          setUser(currentUser);
        } else {
          authService.logout();
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const loginData = {
        username: credentials.username || credentials.email,
        password: credentials.password,
      };

      const data = await authService.login(loginData);
      const { access, refresh, user } = data;

      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      // ✅ Redirect to role-based dashboard
      window.location.href =
        user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'vendor'
          ? '/vendor/dashboard'
          : user.role === 'user'
          ? '/affiliate/dashboard'
          : '/';

      return { success: true, data };
    } catch (error) {
      const apiMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.non_field_errors?.[0] ||
        "Login failed. Please check your credentials.";

      console.error('Login error:', apiMessage);

      return {
        success: false,
        errors: { message: apiMessage, raw: error },
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const promotionMethods = Array.isArray(userData.promotion_methods)
        ? userData.promotion_methods
        : [];

      const payload = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirm_password,
        country: userData.country,
        city: userData.city,
        promotion_methods: promotionMethods,
        certificate_number: userData.certificate_number || '',
        role: userData.role?.trim() || 'user',
      };

      const response = await apiClient.post(API_ENDPOINTS.REGISTER, payload,
        {
          timeout: 30000, // 30 seconds timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.log('Full error response:', error.response);
      console.log('Error data:', error.response?.data);

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
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      const newToken = await authService.refreshAuthToken();

      if (newToken.user) {
        const updatedUser = { ...user, ...newToken.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated() && user !== null;
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
    loading,
    isAuthenticated: isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
