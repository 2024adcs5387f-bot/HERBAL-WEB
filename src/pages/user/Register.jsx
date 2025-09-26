// File: src/pages/user/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/user/forms/RegisterForm";
import { signUp } from "../../services/userService";
import Layout, { Section, Card } from "../../components/Layout/Layout";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleRegister = async (userData) => {
    setLoading(true);
    setError("");
    try {
      const authData = await signUp(userData);
      // If email confirmation is required, Supabase returns null session
      if (!authData?.session) {
        setInfo("Registration successful. Please check your email to confirm your account before logging in.");
      } else {
        navigate("/dashboard");
      }
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
            <h1 className="text-2xl font-bold mb-4">Create your account</h1>
            {info && (
              <div className="mb-4 p-3 rounded bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                {info} You can now go to <a href="/login">Login</a>.
              </div>
            )}
            <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
          </Card>
        </div>
      </Section>
    </Layout>
  );
};

export default Register;
