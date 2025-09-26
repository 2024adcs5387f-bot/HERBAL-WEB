// File: src/components/user/UserList.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileCard from "./ProfileCard";
import userService from "../../services/userService"; // Handles Supabase calls

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers(); // Fetch from Supabase
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Example admin actions
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(userId);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {loading ? (
        <p className="text-center col-span-full">Loading users...</p>
      ) : (
        <AnimatePresence>
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileCard user={user} />
              <div className="flex justify-center mt-2 gap-2">
                <button
                  onClick={() => alert("Edit functionality coming soon!")}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default UserList;
