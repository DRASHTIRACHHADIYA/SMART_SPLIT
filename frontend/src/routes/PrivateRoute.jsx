import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Onboarding from "../components/Onboarding";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (token) {
      // Check if onboarding has been completed
      const onboardingComplete = localStorage.getItem("smartsplit-onboarding-complete");
      if (!onboardingComplete) {
        setShowOnboarding(true);
      }
    }
    setIsChecking(false);
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (isChecking) {
    return null; // Brief loading state
  }

  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  return children;
}

export default PrivateRoute;
