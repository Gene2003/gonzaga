// src/components/affiliate/ReferralTable.jsx
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import apiClient from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";

const ReferralTable = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("date_desc");

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.AFFILIATE_REFERRALS);
        console.log("Referrals API response:", res.data);

        if (Array.isArray(res.data)) {
          setReferrals(res.data);
        } else if (Array.isArray(res.data.results)) {
          setReferrals(res.data.results);
        } else if (Array.isArray(res.data.referrals)) {
          setReferrals(res.data.referrals);
        } else {
          console.error("Unexpected referral data format:", res.data);
          setReferrals([]);
        }
      } catch (err) {
        console.error("Error fetching referrals:", err.response?.data || err.message);
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const formatKES = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const sortedReferrals = [...referrals].sort((a, b) => {
    switch (sortKey) {
      case "date_asc":
        return new Date(a.created_at) - new Date(b.created_at);
      case "date_desc":
        return new Date(b.created_at) - new Date(a.created_at);
      case "amount_asc":
        return a.purchase_amount - b.purchase_amount;
      case "amount_desc":
        return b.purchase_amount - a.purchase_amount;
      case "commission_asc":
        return a.commission_earned - b.commission_earned;
      case "commission_desc":
        return b.commission_earned - a.commission_earned;
      default:
        return 0;
    }
  });

  return (
    <div className="overflow-x-auto bg-white border shadow rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Referral History</h3>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="border border-gray-300 px-2 py-1 text-sm rounded"
        >
          <option value="date_desc">Date: Newest</option>
          <option value="date_asc">Date: Oldest</option>
          <option value="amount_desc">Amount: High → Low</option>
          <option value="amount_asc">Amount: Low → High</option>
          <option value="commission_desc">Commission: High → Low</option>
          <option value="commission_asc">Commission: Low → High</option>
        </select>
      </div>

      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2 font-semibold">Date</th>
            <th className="px-4 py-2 font-semibold">Product</th>
            <th className="px-4 py-2 font-semibold">Buyer</th>
            <th className="px-4 py-2 font-semibold">Amount</th>
            <th className="px-4 py-2 font-semibold">Commission</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                Loading referrals...
              </td>
            </tr>
          ) : sortedReferrals.length > 0 ? (
            sortedReferrals.map((referral) => (
              <tr key={referral.id} className="border-t">
                <td className="px-4 py-2">
                  {format(new Date(referral.created_at), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-2">{referral.product_name}</td>
                <td className="px-4 py-2">
                  {referral.buyer_username || "—"}
                </td>
                <td className="px-4 py-2">
                  {formatKES(referral.purchase_amount)}
                </td>
                <td className="px-4 py-2 font-bold text-green-600">
                  {formatKES(referral.commission_earned)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No referral activity yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReferralTable;
