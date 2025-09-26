// File: src/components/user/ProfileCard.jsx

import React from "react";
import { motion } from "framer-motion";
import UserRoleBadge from "./UserRoleBadge";

const ProfileCard = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col items-center text-center"
    >
      <img
        src={user.avatar || "/default-avatar.png"}
        alt={user.name}
        className="w-24 h-24 rounded-full border-4 border-green-500 object-cover mb-4"
      />
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{user.email}</p>
      <div className="mt-2">
        <UserRoleBadge role={user.user_type} />
      </div>
      {user.bio && (
        <p className="mt-4 text-gray-700 dark:text-gray-200 text-sm">{user.bio}</p>
      )}
      <div className="mt-4 w-full flex justify-around text-sm">
        {user.experience !== undefined && (
          <div>
            <span className="font-semibold">{user.experience}</span> yrs exp
          </div>
        )}
        {user.rating !== undefined && (
          <div>
            <span className="font-semibold">{user.rating.toFixed(1)}</span> ★
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileCard;
