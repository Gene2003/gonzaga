// src/pages/ProtectedData.jsx
import { useEffect, useState } from 'react';
import apiClient from '../api/client';

const ProtectedData = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProtected = async () => {
      try {
        const response = await apiClient.get('/protected/');
        setMessage(response.data.message);
      } catch (err) {
        setError(err.response?.data?.detail || 'Access denied');
      }
    };

    fetchProtected();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-2">Protected API Test</h2>
      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-700">{error}</p>}
    </div>
  );
};

export default ProtectedData;
