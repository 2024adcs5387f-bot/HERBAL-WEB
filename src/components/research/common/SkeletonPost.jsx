// File: src/components/research/common/SkeletonPost.jsx

import { motion } from "framer-motion";

const SkeletonPost = () => {
  return (
    <motion.div
      layout
      className="p-6 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 animate-pulse space-y-4"
    >
      {/* Title */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>

      {/* Author & Date */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded ml-auto"></div>
      </div>

      {/* Abstract / Content */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </motion.div>
  );
};

export default SkeletonPost;
