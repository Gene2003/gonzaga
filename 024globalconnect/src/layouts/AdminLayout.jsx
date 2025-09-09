// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, X, LayoutDashboard, Users, PackageSearch, Receipt, Wallet, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import MobileAdminHeader from '../components/admin/MobileAdminHeader';
import { Toaster } from 'react-hot-toast';

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/product-monitor', label: 'Product Monitor', icon: PackageSearch },
  { to: '/admin/commission-logs', label: 'Commission Logs', icon: Receipt },
  { to: '/admin/payout-manager', label: 'Payout Manager', icon: Wallet },
  { to: '/admin/logs', label: 'System Logs', icon: FileText },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderLinks = () =>
    navLinks.map(({ to, label, icon: Icon }) => (
      <Link
        key={to}
        to={to}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors ${
          location.pathname === to ? 'bg-gray-700 font-semibold' : ''
        }`}
      >
        <Icon className="w-4 h-4 mr-3" />
        {!isCollapsed && label}
      </Link>
    ));

  const getBreadcrumb = () => {
    const segments = location.pathname.split('/').filter(Boolean).slice(1); // skip 'admin'
    return segments.map((seg, idx) => (
      <span key={idx} className="capitalize text-gray-600">
        {seg.replace(/-/g, ' ')}
        {idx < segments.length - 1 && ' / '}
      </span>
    ));
  };

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-gray-800 text-white p-4 space-y-4 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">{!isCollapsed && 'Admin'}</div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="flex-1 space-y-2">{renderLinks()}</nav>
        <div className="pt-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-red-400 hover:text-red-200 hover:bg-red-700/30 rounded"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Header */}
      <MobileAdminHeader onMenuClick={() => setIsMobileOpen(true)} />

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative z-50 w-64 bg-gray-800 text-white p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Admin</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X />
              </button>
            </div>
            <nav className="space-y-2">{renderLinks()}</nav>
            <div className="pt-6 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-red-400 hover:text-red-200 hover:bg-red-700/30 rounded"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100 w-full overflow-auto">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800 capitalize">
            {getBreadcrumb()}
          </h1>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
