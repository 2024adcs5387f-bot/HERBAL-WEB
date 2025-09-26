// File: src/pages/user/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../services/userService";
import UserList from "../../components/user/UserList";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard - Users</h1>
      {loading ? <p>Loading users...</p> : <UserList users={users} onDelete={handleDelete} />}
    </div>
  );
};

export default AdminDashboard;
