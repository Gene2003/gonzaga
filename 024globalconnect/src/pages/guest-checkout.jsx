import React, { useEffect, useState } from "react";
import {  useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/client";

const GuestCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [affiliateCode, setAffiliateCode] = useState(null);
  const [isloading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    quantity: 1,
  
  });

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) setAffiliateCode(refCode);

    //first from react router state
    if (location.state?.product) {
      setProduct(location.state.product);
      if (location.state?.affiliate_code) {
        setAffiliateCode(location.state.affiliate_code);
      }
    }
    else {
    const productFromStorage = localStorage.getItem("buyNowProduct");
    if (productFromStorage) {
      setProduct(JSON.parse(productFromStorage));
    } else {
      alert("No product selected. Redirecting...");
      navigate("/products");
    }
  }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product) {
      alert("No product found.");
      return;
    }
    setIsLoading(true);

    try {
      const orderPayload = {
        product: product.id,
        quantity: formData.quantity,
        affiliate_code: affiliateCode || null,
        guest_name: formData.name,
        guest_email: formData.email,
        guest_phone: formData.phone,
        guest_address: formData.address,
      };

      const res = await apiClient.post("/orders/checkout", orderPayload);

      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        alert("Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      const errData = err.response?.data;
      if (errData?.error) {
        alert(errData.error);
      } else {
        alert("Failed to initiate payment. Please try again.");
      }
    } finally {
      setIsLoading(false);
  }
    };
  if (!product) {
    return(
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  const price = product.price || 0;
  const total = price * formData.quantity;

 return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 pt-24 pb-10">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Checkout</h2>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Order Summary</h3>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{product.name}</span>
            <span>KES {price.toLocaleString()}</span>
          </div>
          {affiliateCode && (
            <div className="text-xs text-green-600 mt-2">
              ✅ Referral code applied: <strong>{affiliateCode}</strong>
            </div>
          )}
          <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input name="name" placeholder="John Doe" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" placeholder="john@example.com" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" placeholder="0712345678" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
            <input name="address" placeholder="123 Main St, Nairobi" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input name="quantity" type="number" min="1" value={formData.quantity} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={handleChange} required />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Processing..." : `Pay KES ${total.toLocaleString()} with Paystack`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestCheckout;