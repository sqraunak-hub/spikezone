// TokenChecker.js
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function TokenChecker() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now();
        const exp = decoded.exp * 1000;

        if (now > exp) {
          logout();
        } else {
          const timeout = setTimeout(logout, exp - now);
          return () => clearTimeout(timeout);
        }
      } catch (err) {
        logout();
      }
    }

    function logout() {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      navigate("/login");
    }
  }, [navigate]);

  return null;
}
