// File: src/components/user/forms/LoginForm.jsx
import React, { useState } from "react";
import { signIn } from "../../../services/authService";
import { ensureAppJwt } from "../../../services/authService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser } from "../../../services/userService";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await signIn({ email, password });
      // Ensure backend JWT is available for protected API calls
      try { await ensureAppJwt(); } catch {}
      console.log("Logged in user session:", session);
      
      // Check if user is a seller
      const user = await getCurrentUser();
      try {
        window.dispatchEvent(new CustomEvent('auth:login', { detail: { user } }));
      } catch {}
      const userType = user?.profile?.user_type || user?.user_type;
      
      // If user is a seller, redirect to Seller.html (static page in /public)
      if (userType === 'seller') {
        window.location.href = '/Seller.html';
      } else {
        // For non-sellers, go to dashboard as usual
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto mt-12 p-8 bg-white shadow-lg rounded-xl"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Login</h2>

      {error && (
        <div className="mb-4 text-red-600 font-medium text-center">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </motion.div>
  );
};

export default LoginForm;
