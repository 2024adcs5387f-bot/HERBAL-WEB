// File: src/components/user/forms/RegisterForm.jsx
import React, { useState } from "react";
import { signUp } from "../../../services/userService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer"); // default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await signUp({ name, email, password, role });
      console.log("Registered user session:", session);
      navigate("/dashboard"); // Redirect after registration
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
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
      <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
        Register
      </h2>

      {error && (
        <div className="mb-4 text-red-600 font-medium text-center">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

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

        <div>
          <label className="block mb-1 font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="herbalist">Herbalist</option>
            <option value="researcher">Researcher</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </motion.div>
  );
};

export default RegisterForm;
