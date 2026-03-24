import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Phone, ShoppingBag, Home, Loader2 } from 'lucide-react';
import apiClient from '../api/client';

const ContactVendor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('No order information found.');
      setLoading(false);
      return;
    }
    apiClient
      .get(`/orders/vendor-contact/?order_id=${orderId}`)
      .then((res) => setVendorInfo(res.data))
      .catch(() => setError('Could not load vendor contact details. Please try again.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-10 text-center max-w-md w-full">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const formattedPhone = vendorInfo.vendor_phone
    ? vendorInfo.vendor_phone.replace(/^0/, '+254')
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-8">
          Your order for <span className="font-semibold text-gray-700">{vendorInfo.product_name}</span> has been confirmed.
          <br />Please contact your vendor to arrange delivery.
        </p>

        {/* Vendor card */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-1">Your Vendor</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{vendorInfo.vendor_name}</p>
          {vendorInfo.vendor_phone ? (
            <p className="text-blue-700 font-semibold text-lg">{vendorInfo.vendor_phone}</p>
          ) : (
            <p className="text-gray-400 text-sm">Phone number not available</p>
          )}
        </div>

        {/* Call button */}
        {formattedPhone && (
          <a
            href={`tel:${formattedPhone}`}
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition mb-4"
          >
            <Phone className="w-5 h-5" />
            Call Vendor
          </a>
        )}

        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-700 font-semibold py-3 rounded-xl transition"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ContactVendor;
