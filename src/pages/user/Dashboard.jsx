// File: src/pages/user/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, signOut } from "../../services/userService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (mounted) setUser(u);
      } catch (e) {
        if (mounted) setError(e?.message || "Failed to load user");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (e) {
      setError(e?.message || "Failed to logout");
    }
  };

  return (
    <div className="container" style={{ paddingTop: 100 }}>
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h4 m-0">User Dashboard</h1>
                <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">Logout</button>
              </div>

              {loading && <div>Loading...</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              {user && (
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded">
                      <h5 className="mb-3">Profile</h5>
                      <div><strong>ID:</strong> {user.id}</div>
                      <div><strong>Name:</strong> {user.profile?.name || "-"}</div>
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>Role:</strong> {user.profile?.user_type || user.user_type || "-"}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 border rounded">
                      <h5 className="mb-3">Status</h5>
                      <div className="text-success">Connected to Supabase</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
