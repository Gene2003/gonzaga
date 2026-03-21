// src/components/vendor/SalesOverview.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";

const SalesOverview = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.VENDOR_SALES);
        setSales(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setSales([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const totalCollected = sales.reduce((sum, s) => sum + s.total_collected, 0);

  if (loading) return <p className="text-gray-500 py-4">Loading sales data...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Sales Overview</h2>

      {sales.length === 0 ? (
        <p className="text-gray-500">No completed sales yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow text-sm">
              <thead className="bg-blue-50 text-blue-800">
                <tr>
                  <th className="py-3 px-4 border-b text-left">Product</th>
                  <th className="py-3 px-4 border-b text-right">Price (KES)</th>
                  <th className="py-3 px-4 border-b text-right">Units Sold</th>
                  <th className="py-3 px-4 border-b text-right">Total Collected (KES)</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((row) => (
                  <tr key={row.product_id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{row.product_name}</td>
                    <td className="py-2 px-4 text-right">{Number(row.price).toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">
                      {row.units_sold}{row.is_farm_product ? ' kg' : ''}
                    </td>
                    <td className="py-2 px-4 text-right font-semibold text-green-700">
                      {Number(row.total_collected).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td className="py-3 px-4" colSpan={3}>Total Earnings</td>
                  <td className="py-3 px-4 text-right text-green-700">
                    KES {totalCollected.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesOverview;
