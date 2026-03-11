// src/components/vendor/SalesOverview.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { authService } from "../../api/services/authService";
import { API_ENDPOINTS } from "../../api/endpoints";
import apiClient from "../../api/client";

const SalesOverview = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
      const res = await apiClient.get('/products/my_products/');
      const data = res.data;
      setOrders(Array.isArray(data) ? data : (data.results || []));
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setOrders([]);
      } finally {
        setLoading(false);

      }
    };

    fetchSales();
  }, []);

  if (loading) return <p className="text-gray-500">Loading sales data...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Sales Overview</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No sales data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead className="bg-blue-50 text-blue-800">
              <tr>
                <th className="py-2 px-4 border-b">Product</th>
                <th className="py-2 px-4 border-b">Price (KES)</th>
                <th className="py-2 px-4 border-b">Stock</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{product.name}</td>
                  <td className="py-2 px-4">{product.farmer_price || product.wholesaler_price || product.retailer_price || '—'}</td>
                  <td className="py-2 px-4">{product.quantity_kg ?? product.stock ?? 0} kg</td>
                  <td className="py-2 px-4"> <span className={`px-2 py-1 rounded text-xs font-semibold ${product.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {product.approved ? 'Approved' : 'Pending Approval'}
                  </span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesOverview;
