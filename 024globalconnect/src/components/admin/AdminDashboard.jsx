import React from 'react';
import { Link } from 'react-router-dom';
import { Users, PackageSearch, BadgeDollarSign, FileBarChart2, MonitorDot } from 'lucide-react';

const AdminDashboard = () => {
  const tools = [
    {
      title: "Users",
      description: "View, filter, and manage all registered users (vendors, affiliates).",
      icon: <Users className="text-blue-600 w-6 h-6" />,
      path: "/admin/users"
    },
    {
      title: "Commission Reports",
      description: "Review payout requests, approve commissions, and export summaries.",
      icon: <BadgeDollarSign className="text-green-600 w-6 h-6" />,
      path: "/admin/commission-logs"
    },
    {
      title: "Product Listings",
      description: "Browse all vendor product submissions for compliance and content checks.",
      icon: <PackageSearch className="text-purple-600 w-6 h-6" />,
      path: "/admin/product-monitor"
    },
    {
      title: "System Logs",
      description: "Track user activity, errors, and referral link usage.",
      icon: <MonitorDot className="text-gray-600 w-6 h-6" />,
      path: "/admin/logs" // optional future
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Admin Dashboard</h1>
      <p className="text-gray-700">Welcome, Admin. Use the tools below to manage vendors, affiliates, products, and finances.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => (
          <Link to={tool.path} key={index} className="bg-white rounded-xl p-4 shadow border border-gray-200 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
              {tool.icon}
              <h2 className="text-xl font-semibold text-gray-800">{tool.title}</h2>
            </div>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
