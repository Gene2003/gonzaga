import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { User, Mail, Phone, Check, X, Trash2, Search, Filter } from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, affiliate, vendor, customer
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.role = filter;
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.get('/users/admin/users/', { params });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/users/admin/dashboard-stats/');
      setStats(response.data.users);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiClient.patch(`/users/admin/users/${userId}/status/`, {
        is_active: !currentStatus
      });
      fetchUsers();
      alert('User status updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await apiClient.delete(`/users/admin/users/${userId}/delete/`);
      fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Users Management</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Users</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.users.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Affiliates</h3>
            <p className="text-2xl font-bold text-green-600">{stats.users.affiliates}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Vendors</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.users.vendors}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Customers</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.users.customers}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Role Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('affiliate')}
              className={`px-4 py-2 rounded-lg ${filter === 'affiliate' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              Affiliates
            </button>
            <button
              onClick={() => setFilter('vendor')}
              className={`px-4 py-2 rounded-lg ${filter === 'vendor' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
            >
              Vendors
            </button>
            <button
              onClick={() => setFilter('customer')}
              className={`px-4 py-2 rounded-lg ${filter === 'customer' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
            >
              Customers
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'affiliate' ? 'bg-green-100 text-green-800' :
                        user.role === 'vendor' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{user.vendor_code || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.is_active ? (
                          <span className="flex items-center text-green-600">
                            <Check className="w-4 h-4 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <X className="w-4 h-4 mr-1" /> Inactive
                          </span>
                        )}
                        {user.role === 'vendor' && (
                          <span className={`text-xs ${user.registration_paid ? 'text-green-600' : 'text-orange-600'}`}>
                            ({user.registration_paid ? 'Paid' : 'Unpaid'})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className={`p-2 rounded ${
                            user.is_active
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;