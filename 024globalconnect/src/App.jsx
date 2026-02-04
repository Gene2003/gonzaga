import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import Header from './components/login/Header';
import Home from './pages/Home';
import LoginForm from './components/login/LoginForm';
import RegistrationForm from './components/login/RegistrationForm';
import ContactForm from './components/login/ContactForm';
import AboutUs from './pages/AboutUs';
import AffiliatePartner from './components/affiliate/AffiliatePartner';
import GuestCheckout from './pages/guest-checkout';
import ServicesPage from './pages/ServicesPage';
import ServiceProviderDashboard from './components/service-provider/ServiceProviderDashboard';


import PrivateRoute from './components/auth/PrivateRoute';
import ProtectedData from './pages/ProtectedData';
import ProductsPage from './pages/ProductsPage';

import AffiliateDashboard from './components/affiliate/AffiliateDashboard';
import VendorDashboard from './components/vendor/VendorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import ProductMonitor from './components/admin/ProductMonitor';
import CommissionLogs from './components/admin/CommissionLogs';
import PayoutManager from './components/admin/PayoutManager';
import SystemLogs from './components/admin/SystemLogs';
import AdminPanel from './components/admin/AdminPanel'; // tabbed interface

import ProfileOverview from './components/affiliate/ProfileOverview';
import NotFound from './pages/NotFound';
import FullScreenLoader from './components/ui/FullScreenLoader';
import AdminLayout from './layouts/AdminLayout';

import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  const roleBasedRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
    if (user.role === 'service_provider') return <Navigate to="/service-provider/dashboard" replace />;
    return <Navigate to="/affiliate/dashboard" replace />;
  };

  return (
    <div>
      <Header />
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* ✅ Public Routes */}
        <Route 
          path="/"
          element={
            user ? roleBasedRedirect() : <Home />
          }
        />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/affiliate-partner" element={<AffiliatePartner />} />
        <Route path="/guest-checkout" element={<GuestCheckout />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/services" element={<ServicesPage />} />

        {/* ✅ Role-based redirect */}
        <Route path="/dashboard" element={<PrivateRoute>{roleBasedRedirect()}</PrivateRoute>} />

        {/* ✅ Affiliate Dashboard */}
        <Route
          path="/affiliate/dashboard"
          element={
            <PrivateRoute allowedRoles={['user']}>
              <AffiliateDashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ Vendor Dashboard */}
        <Route
          path="/vendor/dashboard"
          element={
            <PrivateRoute allowedRoles={['vendor']}>
              <VendorDashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ Service Provider Dashboard */}
        <Route
          path="/service-provider/dashboard"
          element={
            <PrivateRoute allowedRoles={['service_provider']}>
              <ServiceProviderDashboard />
            </PrivateRoute>
          }
        />

        {/* ✅ Profile */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfileOverview />
            </PrivateRoute>
          }
        />

        {/* ✅ Admin Panel with layout */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          {/* ✅ Default route for /admin */}
          <Route index element={<AdminPanel />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="product-monitor" element={<ProductMonitor />} />
          <Route path="commission-logs" element={<CommissionLogs />} />
          <Route path="payout-manager" element={<PayoutManager />} />
          <Route path="logs" element={<SystemLogs />} />
        </Route>

        {/* ✅ Protected Test Route */}
        <Route
          path="/protected-test"
          element={
            <PrivateRoute>
              <ProtectedData />
            </PrivateRoute>
          }
        />

        {/* ✅ 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
