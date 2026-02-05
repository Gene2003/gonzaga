// src/components/vendor/MyProduct.jsx
import React, { use, useEffect, useState } from "react";
import apiClient from "../../api/client";
import toast from "react-hot-toast";
import { Import } from "lucide-react";
import { API_ENDPOINTS } from "../../api/endpoints";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products/my_products/`);
      console.log(" Vendor Products response:", res.data);
      setProducts(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.error("Error fetching vendor products:", err);
      console.error("Error details:", err?.response?.data);
      toast.error("Failed to load your products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newStock) => {
    try {
      await apiClient.patch(`/products/${productId}/`,{ quantity_kg: parseInt(newStock, 10) });
      toast.success("Stock updated");
      fetchVendorProducts(); // refresh list
    } catch (err) {
      console.error("Stock update failed:", err);
      console.error("Error response:", err?.response?.data || err.message);
      toast.error("Failed to update stock");
    }
  };

  useEffect(() => {
    fetchVendorProducts();
  }, []);


  useEffect(() => {
    fetchVendorProducts();
  }, []);

  if (loading) {
    return <p>Loading your products...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Products</h2>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded shadow bg-white">
              {product.image_url && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{product.description}</p>
              <p className="text-sm text-blue-700 mb-1">Price: KES {product.price}</p>
              <p className="text-sm text-blue-700 mb-1">
                price: KES {product.farmer_price || product.wholesaler_price || product.retailer_price}
              </p>
                  

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

              <div className="text-xs text-gray-500 mb-2">
                Visible to: <span className="font-semibold">{product.visible_to}</span>
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