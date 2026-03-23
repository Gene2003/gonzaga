import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';
import { Check, X, Trash2, Search, Pencil } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', phone: '', new_password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'affiliate') params.role = 'user';
      else if (filter === 'vendor') params.role = 'vendor';
      if (searchTerm) params.search = searchTerm;

      const res = await apiClient.get('/users/admin/users/', { params });
      const raw = res.data;
      let list = Array.isArray(raw) ? raw : (raw.users || []);

      if (filter === 'pending') {
        // re-fetch without role filter to get all inactive
        const all = await apiClient.get('/users/admin/users/');
        const allList = Array.isArray(all.data) ? all.data : (all.data.users || []);
        list = allList.filter(u => !u.is_active);
      }

      setUsers(list);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/users/admin/dashboard-stats/');
      setStats(res.data);
    } catch {}
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleStatus = async (user) => {
    try {
      await apiClient.patch(`/users/admin/users/${user.id}/update-status/`, {
        is_active: !user.is_active,
      });
      toast.success(user.is_active ? 'User deactivated' : 'User activated');
      fetchUsers();
      fetchStats();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete "${user.username}"? This will also remove their products.`)) return;
    try {
      await apiClient.delete(`/users/admin/users/${user.id}/delete/`);
      toast.success('User deleted');
      fetchUsers();
      fetchStats();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      new_password: '',
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const { new_password, ...infoData } = editForm;

      // Update profile info
      await apiClient.patch(`/users/admin/users/${editingUser.id}/update/`, infoData);

      // Reset password only if provided
      if (new_password.trim()) {
        if (new_password.length < 8) {
          toast.error('Password must be at least 8 characters');
          setSaving(false);
          return;
        }
        await apiClient.post(`/users/admin/users/${editingUser.id}/reset-password/`, { password: new_password });
      }

      toast.success('User updated');
      setEditingUser(null);
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = users.filter ? undefined : 0; // computed below in render

  const filterTabs = [
    { id: 'all', label: 'All Users' },
    { id: 'affiliate', label: 'Affiliates' },
    { id: 'vendor', label: 'Vendors' },
    { id: 'pending', label: 'Pending Activation' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">User Management</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-blue-600">{stats.users?.total ?? '-'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-xs text-gray-500">Affiliates</p>
            <p className="text-2xl font-bold text-green-600">{stats.users?.affiliates ?? '-'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-xs text-gray-500">Vendors</p>
            <p className="text-2xl font-bold text-purple-600">{stats.users?.vendors ?? '-'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-xs text-gray-500">Vendors (Paid)</p>
            <p className="text-2xl font-bold text-orange-600">{stats.vendors?.paid ?? '-'}</p>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${!user.is_active ? 'bg-yellow-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{user.first_name || user.username} {user.last_name || ''}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        user.role === 'user' ? 'bg-green-100 text-green-800' :
                        user.role === 'vendor' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'user' ? 'Affiliate' : user.role}
                      </span>
                      {user.role === 'vendor' && user.vendor_type && (
                        <div className="text-xs text-gray-400 mt-0.5">{user.vendor_type}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{user.vendor_code || user.certificate_number || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {user.is_active ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                            <X className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {user.role === 'vendor' && (
                          <span className={`text-xs ${user.registration_paid ? 'text-green-600' : 'text-red-400'}`}>
                            {user.registration_paid ? 'Fee paid' : 'Fee unpaid'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Activate / Deactivate */}
                        <button
                          onClick={() => toggleStatus(user)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded text-xs font-medium ${
                            user.is_active
                              ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEdit(user)}
                          title="Edit user info"
                          className="p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(user)}
                          title="Delete user"
                          className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">Edit User — {editingUser.username}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  New Password <span className="text-gray-400">(leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  value={editForm.new_password}
                  onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })}
                  placeholder="Min 8 characters"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
