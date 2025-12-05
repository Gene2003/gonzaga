
import React, { useEffect, useState } from "react";


const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    fetch(`${BASE_URL}/products/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("products data:", data);
        setProducts(data);
      })
      .catch((err) => {
        console.error("Failed to load products", err);
        setProducts([]);
      });
  }, []);

  const addToCart = (product) => {
    // 🔒 You can store guest cart in localStorage or session
    let cart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const existing =cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1});
    }
    localStorage.setItem("guestCart", JSON.stringify(cart));
    alert("✅ Added to cart!");
  };

  const buyNow = (product) => {
    // Store product in session or context for guest checkout
    localStorage.setItem("buyNowProduct", JSON.stringify(product));
    window.location.href = "/guest-checkout"; // redirect to guest checkout page
  };

  return (
    <div className="bg-gray-100 py-10 px-4">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
        🛍️ Explore Our Latest Products
      </h2>

      {Array.isArray(products) && products.length === 0 ? (
        <p className="text-center text-gray-600">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              {product.image ? (
                <img
                  src={`http://localhost:8000${product.image}`}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-gray-600 truncate">{product.description}</p>
              <p className="text-blue-600 font-bold mt-1">${product.price}</p>
              <p className="text-xs text-gray-500 mt-1">Vendor: {product.vendor_name}</p>

              {/* 🚀 Guest-friendly buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => addToCart(product)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  🛒 Add to Cart
                </button>
                <button
                  onClick={() => buyNow(product)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  ⚡ Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
