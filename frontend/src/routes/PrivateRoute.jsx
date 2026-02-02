import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";


function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Debug: Log token check
    console.log("[PrivateRoute] Token exists:", !!token);
    setIsChecking(false);
  }, [token]);

  // No token = redirect to login
  if (!token) {
    console.log("[Onboarding] No token, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Still checking = show nothing briefly 
  if (isChecking) {
    return null;
  }

  // Otherwise, render protected content
  return children;
}

export default PrivateRoute;
