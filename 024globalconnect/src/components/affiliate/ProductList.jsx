// src/components/affiliate/ProductList.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import apiClient from "../../api/client";
import { Clipboard, Check } from "lucide-react";
import toast from "react-hot-toast";

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [copied, setCopied] = useState(null);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams();
if (showInStockOnly) queryParams.append("stock__gt", 0);
if (sortOrder === "low-high") queryParams.append("ordering", "price");
if (sortOrder === "high-low") queryParams.append("ordering", "-price");

const res = await apiClient.get(`/products/?${queryParams.toString()}`);
        let fetched = [];

        if (Array.isArray(res.data.results)) {
          fetched = res.data.results;
        } else if (Array.isArray(res.data)) {
          fetched = res.data;
        } else if (Array.isArray(res.data.products)) {
          fetched = res.data.products;
        } else {
          console.warn("Unexpected product data format:", res.data);
          toast.error("Unexpected product data format.");
          return;
        }

        setProducts(fetched);
      } catch (error) {
        console.error("Product fetch error:", error);
        toast.error("Failed to load products.");
      }
    };

    fetchProducts();
  }, []);

  const handleCopy = (productId) => {
    const link = `${window.location.origin}/products/${productId}?ref=${user?.username}`;
    navigator.clipboard.writeText(link);
    setCopied(productId);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = showInStockOnly
    ? products.filter((p) => p.stock > 0)
    : products;

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "low-high") return a.price - b.price;
    if (sortOrder === "high-low") return b.price - a.price;
    return 0;
  });

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Products You Can Promote</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={(e) => setShowInStockOnly(e.target.checked)}
            />
            <span>Show In Stock Only</span>
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="default">Sort by</option>
            <option value="low-high">Price: Low → High</option>
            <option value="high-low">Price: High → Low</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((product) => {
            const isOutOfStock = product.stock === 0;
            return (
              <div
                key={product.id}
                className={`relative bg-white p-4 rounded-2xl shadow-md border hover:shadow-lg transition ${
                  isOutOfStock ? "opacity-60" : ""
                }`}
              >
                <img
                  src={
                    product.image ||
                    "https://via.placeholder.com/300x150.png?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />

                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {product.description}
                </p>

                {/* ✅ Vendor display */}
                {product.vendor_name && (
                  <p className="text-xs text-gray-400 mb-2">
                    Sold by <span className="font-medium">{product.vendor_name}</span>
                  </p>
                )}

                <p className={`text-sm mb-2 ${isOutOfStock ? "text-red-600" : "text-green-600"}`}>
                  {isOutOfStock ? "Out of Stock" : `In Stock: ${product.stock}`}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-bold text-base">
                    KES {product.price}
                  </span>
                  {!isOutOfStock && (
                    <button
                      onClick={() => handleCopy(product.id)}
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      {copied === product.id ? (
                        <>
                          <Check size={16} className="mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Clipboard size={16} className="mr-1" /> Copy Link
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isOutOfStock && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                    Unavailable
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;
