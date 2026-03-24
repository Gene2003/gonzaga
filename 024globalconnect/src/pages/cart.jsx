import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../api/client";
import { API_ENDPOINTS } from "../api/endpoints";
import { getCart, saveCart, removeFromCart, updateCartQuantity } from "../api/utils/cart";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);

  // Guest info state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [goodsDescription, setGoodsDescription] = useState("");

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleIncrease = (id) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updated);
    setCart(updated);
  };

  const handleDecrease = (id) => {
    const updated = cart
      .map((item) => item.id === id ? { ...item, quantity: item.quantity - 1 } : item)
      .filter((item) => item.quantity > 0);
    saveCart(updated);
    setCart(updated);
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    setCart(getCart());
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!guestName || !guestEmail || !guestPhone || !guestAddress) {
      toast.error("Please fill in all required fields including delivery address.");
      return;
    }
    if (cart.length === 0) return;

    setCheckingOut(true);
    try {
      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,  // send cart price so Paystack amount matches exactly
      }));

      const hasFarmProduct = cart.some((item) => item.is_farm_product);
      const res = await apiClient.post(API_ENDPOINTS.CART_CHECKOUT, {
        items,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        guest_address: guestAddress,
        goods_description: hasFarmProduct ? goodsDescription : '',
      });

      const { payment_urls } = res.data;
      if (payment_urls && payment_urls.length > 0) {
        // Save remaining payment URLs to process after each payment completes
        localStorage.setItem("pendingCartPayments", JSON.stringify(payment_urls.slice(1)));
        localStorage.removeItem("guest_cart");
        // payment_urls[0] is an object — extract the actual URL string
        window.location.href = payment_urls[0].payment_url;
      } else {
        toast.error("No payment link returned. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/products")} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Your Cart
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-green-600 font-bold">KES {Number(item.price).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">each</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                      <button onClick={() => handleDecrease(item.id)} className="text-gray-500 hover:text-gray-700">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => handleIncrease(item.id)} className="text-gray-500 hover:text-gray-700">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-green-600">KES {total.toLocaleString()}</span>
            </div>

            {/* Guest Info */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Your Details</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (e.g. 0712345678)"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Delivery Address (town, street, building, landmark...)"
                  value={guestAddress}
                  onChange={(e) => setGuestAddress(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                {cart.some((item) => item.is_farm_product) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description of Goods <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Describe exactly what you want, e.g. I want big potatoes for making fries"
                      value={goodsDescription}
                      onChange={(e) => setGoodsDescription(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {checkingOut ? "Processing..." : `Pay KES ${total.toLocaleString()}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
