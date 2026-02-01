import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Onboarding from "../components/Onboarding";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Debug: Log onboarding check
    const onboardingComplete = localStorage.getItem("smartsplit-onboarding-complete");
    console.log("[Onboarding] Token exists:", !!token);
    console.log("[Onboarding] Onboarding complete flag:", onboardingComplete);

    if (token) {
      // Check if onboarding has been completed
      if (!onboardingComplete) {
        console.log("[Onboarding] Decision: showing onboarding");
        setShowOnboarding(true);
      } else {
        console.log("[Onboarding] Decision: skipping onboarding, already completed");
        setShowOnboarding(false);
      }
    }
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

  // Show onboarding if not completed
  if (showOnboarding) {
    console.log("[Onboarding] Rendering Onboarding component");
    return (
      <Onboarding
        onComplete={() => {
          console.log("[Onboarding] Onboarding completed, setting flag");
          setShowOnboarding(false);
        }}
      />
    );
  }

  // Otherwise, render protected content
  return children;
}

export default PrivateRoute;
