// src/components/admin/ProductMonitor.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { Eye, EyeOff } from "lucide-react";

const ProductMonitor = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get("/users/admin/products/");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await apiClient.patch(`/users/admin/products/${id}/toggle/`);
      fetchProducts(); // Refresh list after toggle
    } catch (err) {
      console.error("Error toggling product visibility", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Product Monitor</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="py-2 px-4 text-left">Product</th>
                <th className="py-2 px-4 text-left">Vendor</th>
                <th className="py-2 px-4 text-left">Price</th>
                <th className="py-2 px-4 text-left">Stock</th>
                <th className="py-2 px-4 text-center">Status</th>
                <th className="py-2 px-4 text-left">Created</th>
                <th className="py-2 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="border-b hover:bg-blue-50 transition">
                  <td className="py-2 px-4">{prod.name}</td>
                  <td className="py-2 px-4">{prod.vendor}</td>
                  <td className="py-2 px-4">KSh {prod.price}</td>
                  <td className="py-2 px-4">{prod.stock}</td>
                  <td className="py-2 px-4 text-center">
                    {prod.is_active ? (
                      <span className="text-green-600 flex items-center justify-center gap-1">
                        <Eye size={16} /> Active
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center justify-center gap-1">
                        <EyeOff size={16} /> Hidden
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-500">
                    {new Date(prod.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleToggle(prod.id)}
                      className="text-sm px-3 py-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-800"
                    >
                      {prod.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductMonitor;
