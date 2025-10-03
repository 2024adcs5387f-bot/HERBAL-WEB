// File: src/pages/user/DashboardRouter.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/userService";

export default function DashboardRouter() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        const role = u?.profile?.user_type || u?.user_type;
        if (!role) {
          navigate("/login", { replace: true });
          return;
        }
        // Route by role. Sellers go to static Seller.html in public
        if (role === 'seller') {
          window.location.href = '/Seller.html';
          return;
        }
        // Buyers go to home page immediately (fast redirect)
        if (role === 'buyer') {
          window.location.replace('/');
          return;
        }
        const routeByRole = {
          buyer: "/dashboard/buyer",
          herbalist: "/dashboard/herbalist",
          researcher: "/dashboard/researcher",
          admin: "/admin-dashboard",
        };
        const target = routeByRole[role] || "/dashboard/buyer";
        navigate(target, { replace: true });
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  return (
    <div className="pt-28 pb-16 w-full lg:w-[70%] mx-auto px-4 lg:px-0">
      <div className="text-neutral-500">Loading your dashboard…</div>
    </div>
  );
}
