import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import UserManagement from "./UserManagement";
import ProductMonitor from "./ProductMonitor";
import CommissionLogs from "./CommissionLogs";
import PayoutManager from "./PayoutManager";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "users", label: "👥 Users" },
    { id: "products", label: "🛒 Products" },
    { id: "commissions", label: "📈 Commissions" },
    { id: "payouts", label: "💸 Payouts" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "products":
        return <ProductMonitor />;
      case "commissions":
        return <CommissionLogs />;
      case "payouts":
        return <PayoutManager />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-gray-200 p-4 space-y-2">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Admin Panel</h2>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 p-6 bg-gray-50">{renderTab()}</main>
    </div>
  );
};

export default AdminPanel;
