import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTokenExpiry } from "../utils/auth";

export const useAuthTimeout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("adminData");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const expiry = getTokenExpiry(token);
    const remainingTime = expiry - Date.now();

    //  If token is already expired, logout immediately
    if (remainingTime <= 0) {
      logout();
      return;
    }

    //  Set a timer to logout exactly when the token expires
    const timer = setTimeout(() => {
      const refreshToken = localStorage.getItem("adminRefreshToken");
      if (!refreshToken) {
        logout();
      }
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [navigate]);

  return { logout };
};