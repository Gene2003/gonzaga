// src/components/login/LoginForm.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from "../../hooks/useAuth";
import axios from 'axios';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'vendor') navigate('/vendor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/affiliate/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowResendLink(false);

    try {
      const result = await login({
        username: formData.email,
        password: formData.password
      });

      if (result.success) {
        toast.success('✅ Login successful');
        // Redirect handled by auto-redirect useEffect
      } else {
        throw result.errors;
      }
    } catch (err) {
      console.error("🔥 Full login error object:", err);

      const apiMessage =
        err?.message?.toLowerCase?.() || "login failed";

      if (apiMessage.includes("not verified")) {
        toast.error("Please activate your account via the link sent to your email.");
        setShowResendLink(true);
      } else if (apiMessage.includes("no active account")) {
        toast.error("No account found. Please register or check your credentials.");
        setError("No active account found with the provided credentials.");
      } else if (apiMessage.includes("invalid") || apiMessage.includes("unable to log in")) {
        toast.error("Invalid login. Please check your username/email and password.");
        setError("Invalid username or password.");
      } else {
        toast.error("Login failed. Please try again.");
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendActivation = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email first.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.post("/api/auth/registration/resend-email/", {
        email: formData.email.trim(),
      });

      toast.success("✅ Activation email resent! Check your inbox.");
      setShowResendLink(false);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        "Could not resend activation email.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const params = new URLSearchParams(location.search);
    if (params.get('activated') === 'true') {
      toast.success('✅ Your account has been activated. You can now log in.');
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500">Sign in to your 024 Global Connect account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                id="email"
                name="email"
                type="text"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email or username"
                className="w-full focus:outline-none"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 flex items-center border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
              <Lock className="w-5 h-5 text-gray-400 mr-2" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full focus:outline-none"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="mr-2"
                disabled={isLoading}
              />
              Remember me
            </label>
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-2 px-4 rounded-lg transition duration-200 font-bold ${
              isLoading
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {showResendLink && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Didn't get the email?{' '}
              <button
                onClick={handleResendActivation}
                className="text-blue-600 hover:underline font-medium"
              >
                Resend Activation Email
              </button>
            </p>
          </div>
        )}

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
