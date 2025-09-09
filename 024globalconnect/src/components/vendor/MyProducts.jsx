// src/components/vendor/MyProduct.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/client";
import toast from "react-hot-toast";

const MyProducts = () => {
  const [products, setProducts] = useState([]);

  const fetchVendorProducts = async () => {
    try {
      const res = await apiClient.get("/products/");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching vendor products:", err);
      toast.error("Failed to load your products");
    }
  };

  const updateStock = async (productId, newStock) => {
    try {
      await apiClient.patch('/products/${productId}/',{ stock: parseInt(newStock, 10) });
      toast.success("Stock updated");
      fetchVendorProducts(); // refresh list
    } catch (err) {
      console.error("Stock update failed:", err);
      toast.error("Failed to update stock");
    }
  };

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Products</h2>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded shadow bg-white">
              <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{product.description}</p>
              <p className="text-sm text-blue-700 mb-1">Price: KES {product.price}</p>

              <div className="flex items-center mb-2">
                <label className="mr-2 text-sm font-medium">Stock:</label>
                <input
                  type="number"
                  value={product.stock}
                  min="0"
                  onChange={(e) => updateStock(product.id, e.target.value)}
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
              </div>

              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  product.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {product.approved ? "Approved" : "Pending Approval"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;