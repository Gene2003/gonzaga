// src/components/vendor/SalesOverview.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { authService } from "../../api/services/authService";
import { API_ENDPOINTS } from "../../api/endpoints";

const SalesOverview = () => {
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = authService.getAuthToken();
        const res = await axios.get(API_ENDPOINTS.AFFILIATE_REFERRALS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReferrals(res.data);
      } catch (err) {
        console.error("Error fetching sales data:", err);
      }
    };

    fetchSales();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Sales Overview</h2>
      {referrals.map((r) => (
        <div key={r.id}>
          <p>Product: {r.product_name}</p>
          <p>Commission: {r.commission_earned}</p>
        </div>
      ))}
    </div>
  );
};

export default SalesOverview;
