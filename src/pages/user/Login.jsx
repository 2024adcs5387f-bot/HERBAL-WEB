// File: src/pages/user/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/user/forms/LoginForm";
import { signIn, getCurrentUser } from "../../services/userService";
import Layout, { Section, Card } from "../../components/Layout/Layout";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError("");
    try {
      await signIn(credentials);
      const user = await getCurrentUser();

      const role = user?.profile?.user_type || user?.user_type;
      if (role === "admin") navigate("/admin-dashboard");
      else navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Section spacing="relaxed" background="subtle">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg">
            <h1 className="text-2xl font-bold mb-4">Welcome back</h1>
            <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
          </Card>
        </div>
      </Section>
    </Layout>
  );
};

export default Login;
