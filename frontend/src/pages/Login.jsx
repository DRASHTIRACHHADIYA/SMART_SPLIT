import { useNavigate } from "react-router-dom";
import LoginLeft from "../components/LoginLeft";
import OTPInput from "../components/OTPInput";
import { useState } from "react";
import api from "../api/api";

/**
 * Login/Register Page with Phone + OTP Authentication
 * Supports both OTP-based and legacy email-based authentication
 */
function Login() {
  const navigate = useNavigate();

  // Auth mode: "phone" | "email"
  const [authMode, setAuthMode] = useState("phone");

  // Phone OTP flow states
  const [phoneStep, setPhoneStep] = useState("phone"); // phone | otp | register
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [sessionToken, setSessionToken] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
  const [pendingMemberData, setPendingMemberData] = useState(null);

  // Registration fields (for new users)
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Legacy email login
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================
  // PHONE OTP FLOW
  // =====================

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Combine country code and phone number
      const fullPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : countryCode + phoneNumber.replace(/^0+/, "");

      const res = await api.post("/auth/send-otp", {
        phoneNumber: fullPhone,
        countryCode: "IN",
      });

      if (res.data.success) {
        setSessionToken(res.data.sessionToken);
        setPhoneStep("otp");
        setSuccess("OTP sent! Check your phone.");

        // DEV: Log OTP to console for testing
        if (res.data._devOTP) {
          console.log("🔑 DEV OTP:", res.data._devOTP);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/verify-otp", {
        sessionToken,
        otp,
      });

      if (res.data.success) {
        if (res.data.isNewUser) {
          // New user - show registration form
          setRegistrationToken(res.data.registrationToken);
          setPendingMemberData(res.data.pendingMemberData);
          setPhoneStep("register");
          setSuccess("");
        } else {
          // Existing user - log them in
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/home");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (regPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/complete-registration", {
        registrationToken,
        name: name.trim(),
        email: regEmail.trim() || undefined,
        password: regPassword,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Show reconciliation info if any
        if (res.data.reconciliation) {
          const r = res.data.reconciliation;
          setSuccess(
            `Welcome! You joined ${r.groupsJoined} group(s) with ${r.expensesUpdated} expense(s).`
          );
          setTimeout(() => navigate("/home"), 2000);
        } else {
          navigate("/home");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // LEGACY EMAIL FLOW
  // =====================

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        phoneNumber: countryCode + phoneNumber.replace(/^0+/, ""),
      });

      setSuccess("Registration successful! Please login.");
      setIsLogin(true);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // HELPERS
  // =====================

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRegEmail("");
    setRegPassword("");
  };

  const resetPhoneFlow = () => {
    setPhoneStep("phone");
    setSessionToken("");
    setRegistrationToken("");
    setPendingMemberData(null);
    setError("");
    setSuccess("");
  };

  // =====================
  // RENDER
  // =====================

  return (
    <div className="login-container">
      <LoginLeft />

      <div className="login-right">
        <div className="login-card">
          {/* AUTH MODE TOGGLE */}
          <div className="auth-mode-toggle">
            <button
              className={authMode === "phone" ? "active" : ""}
              onClick={() => {
                setAuthMode("phone");
                setError("");
                setSuccess("");
              }}
            >
              📱 Phone
            </button>
            <button
              className={authMode === "email" ? "active" : ""}
              onClick={() => {
                setAuthMode("email");
                setError("");
                setSuccess("");
              }}
            >
              ✉️ Email
            </button>
          </div>

          {/* PHONE OTP FLOW */}
          {authMode === "phone" && (
            <>
              {/* STEP 1: Enter Phone */}
              {phoneStep === "phone" && (
                <>
                  <h3 className="login-greeting">Welcome!</h3>
                  <h3 className="login-subtitle">Enter your phone number</h3>

                  <form onSubmit={handleSendOTP}>
                    <div className="phone-input-group">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="country-select"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        maxLength={10}
                        required
                      />
                    </div>

                    <button type="submit" disabled={loading || phoneNumber.length < 10}>
                      {loading ? "Sending..." : "Send OTP"}
                    </button>
                  </form>
                </>
              )}

              {/* STEP 2: Enter OTP */}
              {phoneStep === "otp" && (
                <>
                  <h3 className="login-greeting">Verify OTP</h3>
                  <h3 className="login-subtitle">
                    Enter the 6-digit code sent to {countryCode}
                    {phoneNumber}
                  </h3>

                  <OTPInput
                    length={6}
                    onComplete={handleVerifyOTP}
                    disabled={loading}
                  />

                  <p className="resend-text">
                    Didn't receive?{" "}
                    <span className="login-link" onClick={handleSendOTP}>
                      Resend OTP
                    </span>
                  </p>

                  <button
                    type="button"
                    className="back-btn"
                    onClick={resetPhoneFlow}
                  >
                    ← Change Number
                  </button>
                </>
              )}

              {/* STEP 3: Complete Registration (New User) */}
              {phoneStep === "register" && (
                <>
                  <h3 className="login-greeting">Complete Your Profile</h3>
                  <h3 className="login-subtitle">
                    Phone verified: {countryCode}{phoneNumber}
                  </h3>

                  {/* Show pending member info if exists */}
                  {pendingMemberData && (
                    <div className="pending-info-box">
                      <p>🎉 Good news! You're already added to:</p>
                      <ul>
                        {pendingMemberData.groups?.map((g) => (
                          <li key={g.id}>{g.name}</li>
                        ))}
                      </ul>
                      {pendingMemberData.pendingBalance !== 0 && (
                        <p>
                          Pending balance:{" "}
                          <strong>₹{Math.abs(pendingMemberData.pendingBalance)}</strong>
                          {pendingMemberData.pendingBalance < 0 ? " (you owe)" : " (you get)"}
                        </p>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleCompleteRegistration}>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Create password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />

                    <button type="submit" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
                  </form>

                  <button
                    type="button"
                    className="back-btn"
                    onClick={resetPhoneFlow}
                  >
                    ← Start Over
                  </button>
                </>
              )}
            </>
          )}

          {/* LEGACY EMAIL FLOW */}
          {authMode === "email" && (
            <>
              <p className="login-switch-text">
                {isLogin ? (
                  <>
                    New here?{" "}
                    <span
                      className="login-link"
                      onClick={() => {
                        setIsLogin(false);
                        setError("");
                        setSuccess("");
                      }}
                    >
                      Register now
                    </span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span
                      className="login-link"
                      onClick={() => {
                        setIsLogin(true);
                        setError("");
                        setSuccess("");
                      }}
                    >
                      Login
                    </span>
                  </>
                )}
              </p>

              <h3 className="login-greeting">
                {isLogin ? "Hi there!" : "Welcome!"}
              </h3>
              <h3 className="login-subtitle">
                {isLogin ? "Have we met before?" : "Create your account"}
              </h3>

              <form onSubmit={isLogin ? handleEmailLogin : handleEmailRegister}>
                {!isLogin && (
                  <>
                    <input
                      type="text"
                      placeholder="Username"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <div className="phone-input-group">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="country-select"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>
                  </>
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {!isLogin && (
                  <>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <p style={{ fontSize: "12px", color: "#555" }}>
                      Password must be at least 6 characters
                    </p>
                  </>
                )}

                <button type="submit" disabled={loading}>
                  {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
                </button>
              </form>
            </>
          )}

          {/* ERROR / SUCCESS MESSAGES */}
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      </div>
    </div>
  );
}

export default Login;
