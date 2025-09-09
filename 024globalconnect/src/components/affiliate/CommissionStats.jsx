// src/components/affiliate/CommissionStats.jsx
import React, { useEffect, useState } from "react";
import {
  Coins,
  Gift,
  ClipboardCheck,
  TrendingUp,
  Download,
} from "lucide-react";
import apiClient from "../../api/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

const CommissionStats = () => {
  const [stats, setStats] = useState({
    total_commission: 0,
    total_referrals: 0,
    total_purchases: 0,
    conversion_rate: 0,
  });

  const [referrals, setReferrals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/users/affiliate/summary/");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching commission stats", err);
      }
    };

    const fetchReferrals = async () => {
      try {
        const res = await apiClient.get("/users/affiliate/referrals/");
        setReferrals(res.data);
      } catch (err) {
        console.error("Error fetching referrals", err);
      }
    };

    fetchStats();
    fetchReferrals();
  }, []);

  useEffect(() => {
    const filteredData = referrals.filter((ref) => {
      const refDate = new Date(ref.created_at);
      const afterStart = startDate ? refDate >= new Date(startDate) : true;
      const beforeEnd = endDate ? refDate <= new Date(endDate) : true;
      return afterStart && beforeEnd;
    });
    setFiltered(filteredData);
  }, [startDate, endDate, referrals]);

  const monthlyData = {};
  filtered.forEach((ref) => {
    const date = new Date(ref.created_at);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: format(new Date(`${key}-01`), "MMM yyyy"),
        commission: 0,
        amount: 0,
      };
    }

    monthlyData[key].commission += parseFloat(ref.commission_earned || 0);
    monthlyData[key].amount += parseFloat(ref.purchase_amount || 0);
  });

  const chartData = Object.values(monthlyData).map((entry) => ({
    ...entry,
    commission: parseFloat(entry.commission.toFixed(2)),
    amount: parseFloat(entry.amount.toFixed(2)),
  }));

  const statCards = [
    {
      label: "Total Commission",
      value: `KES ${stats.total_commission}`,
      icon: Coins,
      bg: "bg-green-100 text-green-700",
    },
    {
      label: "Total Referrals",
      value: stats.total_referrals,
      icon: Gift,
      bg: "bg-blue-100 text-blue-700",
    },
    {
      label: "Purchases",
      value: stats.total_purchases,
      icon: ClipboardCheck,
      bg: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "Conversion Rate",
      value: `${stats.conversion_rate}%`,
      icon: TrendingUp,
      bg: "bg-purple-100 text-purple-700",
    },
  ];

  const downloadCSV = () => {
    const headers = ["Month", "Commission", "Purchase Amount"];
    const rows = chartData.map((item) => [
      item.month,
      item.commission,
      item.amount,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "monthly_commissions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10">
      {/* 📊 Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, bg }, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl shadow-sm flex items-center space-x-4 ${bg}`}
          >
            <div className="p-2 rounded-lg bg-white">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium">{label}</div>
              <div className="text-lg font-bold">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 📅 Filter + Export */}
      <div className="p-4 bg-white shadow-sm rounded-xl border flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <button
          onClick={downloadCSV}
          className="ml-auto px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* 📈 Stacked Bar Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">
          Monthly Purchases & Commission (Stacked)
        </h2>
        {chartData.length === 0 ? (
          <p className="text-gray-500">No referral data in selected range.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) =>
                  name === "amount"
                    ? `KES ${value} (Total)`
                    : `KES ${value} (Commission)`
                }
              />
              <Bar dataKey="amount" stackId="a" fill="#c7d2fe" name="Purchase Amount" />
              <Bar dataKey="commission" stackId="a" fill="#4ade80" name="Commission" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CommissionStats;
