import React, { useEffect, useState } from "react";
import {  useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/client";

const GuestCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    amount: "",
  
  });

  useEffect(() => {
    //first from react router state
    if (location.state?.product) {
      setProduct(location.state.product);
      setFormData((prev) => ({
        ...prev,
        amount: location.state.product.price || 0
      }));
    }
    else {
    const productFromStorage = localStorage.getItem("buyNowProduct");
    if (productFromStorage) {
      const parsedProduct = JSON.parse(productFromStorage);
      setProduct(parsedProduct);
      setFormData((prev) => ({
        ...prev,
        amount: parsedProduct.price || ""
      }));
    } else {
      alert("No product selected. Redirecting...");
      navigate("/products");
    }
  }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaystack = async (e) => {
    e.preventDefault();

    if (!product) {
      alert("No product found.");
      return;
    }

    try {
      const orderPayload = {
        ...formData,
        product: product.id,
      };

      const res = await apiClient.post(`/paystack/initialize/`, 
        orderPayload
      );

      const { authorization_url } = res.data.data;
      window.location.href = authorization_url;
    } catch (err) {
      console.error(err);
      alert("Failed to initiate Paystack payment.");
    }
  };

  if (!product) {
    return(
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (  
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <h2>Guest Checkout - Pay with Paystack</h2>
      <form onSubmit={handlePaystack} className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <input name="name" placeholder="Name"  className="w-full p-3 mb-4 border rounded" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="w-full p-3 mb-4 border rounded" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" className="w-full p-3 mb-4 border rounded" onChange={handleChange} required />
        <input name="address" placeholder="Address" className="w-full p-3 mb-4 border rounded" onChange={handleChange} required />
        <input name="amount" type="number" placeholder="Amount" className="w-full p-3 mb-4 border rounded" onChange={handleChange} required />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">Pay Now with Paystack</button>
      </form>
    </div>
  );
};

export default GuestCheckout;
