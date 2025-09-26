// File: src/pages/Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../services/userService";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await signOut();
      } catch (_) {
        // ignore
      } finally {
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  return null;
};

export default Logout;
