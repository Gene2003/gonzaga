import React, { useEffect, useState } from "react";
import axios from "../../utils/axios"; // your axios instance
import { Trash2,KeyRound, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users/");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async () => {
    try {
      setLoading(true);
      await axios.post("/admin/users/create/", newUser);
      toast.success("User created successfully");
      setNewUser({ username: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch {
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`/admin/users/${id}/delete/`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const resetPassword = async (id) => {
  const password = prompt("Enter new password (min 8 characters)");
    if (!password) return;

    try {
      await axios.post(`/admin/users/${id}/reset-password/`, {password});
      toast.success("Password reset successfully");
    } catch {
      toast.error("Failed to reset password");
    }
 };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Create User */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <UserPlus /> Create New User
        </h2>

        <div className="grid md:grid-cols-4 gap-3">
          <input
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="border p-2 rounded"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="user">Affiliate</option>
            <option value="vendor">Vendor</option>
            <option value="service_provider">Service Provider</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          onClick={createUser}
          disabled={loading}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Username</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.username}</td>
                <td>{user.email}</td>
                <td className="capitalize">{user.role}</td>
                <td>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
