import React, { useState } from "react";
import MyProduct from "./MyProducts";
import AddProductForm from "./AddProductForm";
import SalesOverview from "./SalesOverview";

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");

  const renderTab = () => {
    switch (activeTab) {
      case "products": return <MyProduct />;
      case "add": return <AddProductForm />;
      case "sales": return <SalesOverview />;
      default: return <MyProduct />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6">Vendor Dashboard</h1>

      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
        {[
          { key: "products", label: "📦 My Products" },
          { key: "add", label: "➕ Add Product" },
          { key: "sales", label: "📊 Sales Overview" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded text-sm sm:text-base ${
              activeTab === key ? "bg-blue-600 text-white" : "bg-white text-blue-600 border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow border border-gray-200">
        {renderTab()}
      </div>
    </div>
  );
};

export default VendorDashboard;


