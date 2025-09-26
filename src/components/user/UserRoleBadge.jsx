// File: src/components/user/UserRoleBadge.jsx

import React from "react";
import { motion } from "framer-motion";

// Color scheme for roles
const roleColors = {
  buyer: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
  seller: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
  herbalist: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100",
  researcher: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  admin: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
};

const UserRoleBadge = ({ role }) => {
  const colors = roleColors[role] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`px-3 py-1 rounded-full font-semibold text-sm ${colors}`}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </motion.span>
  );
};

export default UserRoleBadge;
