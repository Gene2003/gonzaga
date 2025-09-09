// src/hooks/useAuth.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../api/services/authService';

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
          : '/affiliate/dashboard';

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

  const register = async (formData) => {
    setLoading(true);
    try {
      const promotionMethods = Array.isArray(formData.promotion_methods)
        ? formData.promotion_methods
        : [];

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        country: formData.country,
        city: formData.city,
        promotion_methods: promotionMethods,
        role: formData.role?.trim() || 'user',
      };

      const registrationResult = await authService.register(payload);

      if (registrationResult.success) {
        return {
          success: true,
          message: 'Registration successful. Please check your email.',
          requiresActivation: true,
        };
      }

      return {
        success: false,
        errors: registrationResult.errors || registrationResult,
      };
    } catch (error) {
      console.error("🔥 useAuth registration error:", JSON.stringify(error, null, 2));
      return { success: false, errors: error };
    } finally {
      setLoading(false);
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
