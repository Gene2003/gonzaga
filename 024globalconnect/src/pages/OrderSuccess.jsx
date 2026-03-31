import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Phone, Home, Loader2, ShoppingBag } from 'lucide-react';
import apiClient from '../api/client';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    apiClient
      .get(`/orders/vendor-contact/?order_id=${orderId}`)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center">

        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">
          {order ? (
            <>Your order for <span className="font-semibold text-gray-700">{order.product_name}</span> has been confirmed.</>
          ) : (
            'Your order has been confirmed.'
          )}
        </p>

        {/* What happens next card */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="font-bold text-blue-900">What happens next?</p>
          </div>
          <p className="text-blue-700 text-sm leading-relaxed">
            Our team will call you shortly to confirm your order and arrange delivery.
            You do not need to do anything — just wait for our call.
          </p>
        </div>

        {/* Order reference */}
        {orderId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Order Reference</p>
            <p className="text-xl font-bold text-gray-900">#{orderId}</p>
          </div>
        )}

        {/* Steps */}
        <div className="text-left mb-8 space-y-3">
          {[
            { num: '1', text: 'Our team reviews your order' },
            { num: '2', text: 'We call you to confirm details' },
            { num: '3', text: 'We arrange a transporter for delivery' },
            { num: '4', text: 'Your goods are delivered to you' },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                {step.num}
              </div>
              <span className="text-gray-600 text-sm">{step.text}</span>
            </div>
          ))}
        </div>

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

export default OrderSuccess;
