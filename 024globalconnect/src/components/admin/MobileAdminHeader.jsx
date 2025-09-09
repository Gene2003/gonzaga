// src/components/admin/MobileAdminHeader.jsx
import React from 'react';

const MobileAdminHeader = () => {
  return (
    <header className="md:hidden bg-white shadow px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold text-blue-700">Admin Panel</h1>
      {/* Add hamburger menu or logout button here if needed */}
    </header>
  );
};

export default MobileAdminHeader;
