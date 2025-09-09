import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-white px-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Page Not Found</p>
      <Link
        to="/"
        className="text-blue-600 font-medium hover:underline"
      >
        Go back home
      </Link>
    </div>
  </div>
);

export default NotFound;
