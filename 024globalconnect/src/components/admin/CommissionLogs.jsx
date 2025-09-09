// src/components/admin/CommissionLogs.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/client";
import { format } from "date-fns";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

const CommissionLogs = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [affiliate, setAffiliate] = useState("");

  useEffect(() => {
    fetchCommissions();
  }, [startDate, endDate, affiliate]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;
      if (affiliate) params.affiliate = affiliate;

      const res = await apiClient.get("/admin/commissions/", { params });
      setCommissions(res.data);
      setCurrentPage(1);
    } catch (err) {
      toast.error("Failed to load commission logs");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id, currentStatus) => {
    try {
      await apiClient.patch(`/admin/commissions/${id}/approve/`, {
        is_approved: !currentStatus,
      });
      toast.success("Approval status updated");
      fetchCommissions();
    } catch (err) {
      toast.error("Failed to update approval");
    }
  };

  const handlePayout = async (id, currentStatus) => {
    try {
      await apiClient.patch(`/admin/commissions/${id}/payout/`, {
        is_paid: !currentStatus,
      });
      toast.success("Payout status updated");
      fetchCommissions();
    } catch (err) {
      toast.error("Failed to update payout");
    }
  };

  const exportCSV = () => {
    const csv = [
      ["Date", "Affiliate", "Buyer", "Product", "Amount", "Commission", "Approved", "Paid"],
      ...commissions.map(c => [
        format(new Date(c.created_at), "yyyy-MM-dd"),
        c.affiliate,
        c.buyer_username,
        c.product_name,
        c.purchase_amount,
        c.commission_earned,
        c.is_approved ? "Yes" : "No",
        c.is_paid ? "Yes" : "No"
      ])
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "commission_logs.csv";
    link.click();
  };

  const totalPages = Math.ceil(commissions.length / itemsPerPage);
  const paginated = commissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-blue-700">Commission Logs</h1>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
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
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">Loading commission logs...</p>
      ) : commissions.length === 0 ? (
        <p className="text-gray-500">No commission records found.</p>
      ) : (
        <>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full bg-white border border-gray-200 rounded">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Affiliate</th>
                  <th className="px-3 py-2 text-left">Buyer</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-right">Commission</th>
                  <th className="px-3 py-2 text-center">Approved</th>
                  <th className="px-3 py-2 text-center">Paid</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginated.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2">{format(new Date(c.created_at), "yyyy-MM-dd")}</td>
                    <td className="px-3 py-2">{c.affiliate}</td>
                    <td className="px-3 py-2">{c.buyer_username}</td>
                    <td className="px-3 py-2">{c.product_name}</td>
                    <td className="px-3 py-2 text-right">{c.purchase_amount}</td>
                    <td className="px-3 py-2 text-right">{c.commission_earned}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleApproval(c.id, c.is_approved)}
                        className={`text-xs px-2 py-1 rounded ${
                          c.is_approved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.is_approved ? "Approved" : "Not Approved"}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handlePayout(c.id, c.is_paid)}
                        className={`text-xs px-2 py-1 rounded ${
                          c.is_paid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {c.is_paid ? "Paid" : "Pending"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CommissionLogs;
