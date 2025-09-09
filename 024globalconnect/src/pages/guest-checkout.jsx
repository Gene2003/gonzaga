import React, { useEffect, useState } from "react";
import axios from "axios";

const GuestCheckout = () => {
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    amount: "",
  
  });

  useEffect(() => {
    const productFromStorage = localStorage.getItem("buyNowProduct");
    if (productFromStorage) {
      setProduct(JSON.parse(productFromStorage));
    } else {
      alert("No product selected. Redirecting...");
      window.location.href = "/";
    }
  }, []);

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

      const res = await axios.post(
        "http://localhost:8000/api/paystack/initialize/",
        orderPayload
      );

      const { authorization_url } = res.data.data;
      window.location.href = authorization_url;
    } catch (err) {
      console.error(err);
      alert("Failed to initiate Paystack payment.");
    }
  };

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
