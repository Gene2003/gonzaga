import React, { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Download } from "lucide-react";

const PayoutManager = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [affiliate, setAffiliate] = useState("");

  useEffect(() => {
    fetchReferrals();
  }, [startDate, endDate, affiliate]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;
      if (affiliate) params.affiliate = affiliate;
      const res = await apiClient.get("/users/admin/commissions/", { params });
      setReferrals(res.data);
    } catch (err) {
      console.error("Failed to fetch referrals", err);
    } finally {
      setLoading(false);
    }
  };

  const togglePaid = async (id, current) => {
    try {
      await apiClient.patch(`/users/admin/commissions/${id}/payout/`, {
        is_paid: !current,
      });
      fetchReferrals();
    } catch (err) {
      console.error("Failed to toggle paid status", err);
    }
  };

  const toggleApproval = async (id, current) => {
    try {
      await apiClient.patch(`/users/admin/commissions/${id}/approve/`, {
        is_approved: !current,
      });
      fetchReferrals();
    } catch (err) {
      console.error("Failed to toggle approval status", err);
    }
  };

  const exportCSV = () => {
    const csv = [
      ["Date", "Affiliate", "Product", "Amount", "Commission", "Approved", "Paid"],
      ...referrals.map((r) => [
        format(new Date(r.created_at), "yyyy-MM-dd"),
        r.affiliate,
        r.product_name,
        r.purchase_amount,
        r.commission_earned,
        r.is_approved ? "Yes" : "No",
        r.is_paid ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payout_logs.csv";
    link.click();
  };

  const paidStats = referrals.reduce(
    (acc, r) => {
      if (r.is_paid) acc.paid += parseFloat(r.commission_earned);
      else acc.unpaid += parseFloat(r.commission_earned);
      return acc;
    },
    { paid: 0, unpaid: 0 }
  );

  const chartData = [
    { name: "Paid", total: paidStats.paid },
    { name: "Unpaid", total: paidStats.unpaid },
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
        <h1 className="text-2xl font-semibold text-blue-700">Payout Manager</h1>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Affiliate</label>
          <input
            type="text"
            value={affiliate}
            onChange={(e) => setAffiliate(e.target.value)}
            placeholder="Username or ID"
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 mb-4 rounded shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Commission Overview</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3B82F6" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading payouts...</p>
      ) : referrals.length === 0 ? (
        <p>No payout records found.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-200 rounded">
            <thead className="bg-gray-100 text-sm text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Affiliate</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2 text-right">Commission</th>
                <th className="px-3 py-2 text-center">Approved</th>
                <th className="px-3 py-2 text-center">Paid</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {referrals.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{format(new Date(r.created_at), "yyyy-MM-dd")}</td>
                  <td className="px-3 py-2">{r.affiliate}</td>
                  <td className="px-3 py-2">{r.product_name}</td>
                  <td className="px-3 py-2 text-right">{r.purchase_amount}</td>
                  <td className="px-3 py-2 text-right">{r.commission_earned}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={r.is_approved ? "text-green-600 font-semibold" : "text-red-500"}>
                      {r.is_approved ? "✅" : "❌"}
                    </span>
                    <br />
                    <button
                      onClick={() => toggleApproval(r.id, r.is_approved)}
                      className="text-xs text-blue-600 underline"
                    >
                      {r.is_approved ? "Unapprove" : "Approve"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => togglePaid(r.id, r.is_paid)}
                      className={`px-2 py-1 text-xs rounded font-medium text-white ${
                        r.is_paid ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"
                      }`}
                    >
                      {r.is_paid ? "Mark Unpaid" : "Mark Paid"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PayoutManager;
