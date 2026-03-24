import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';

const ServiceProviderPaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Received!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your registration payment of <strong>KES 200</strong>.
          Your service provider account has been created and is now pending admin activation.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3 text-left">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-800">
            Our admin team will review and activate your account shortly.
            You will receive a confirmation email once your account is active and you can log in.
          </p>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default ServiceProviderPaymentSuccess;
