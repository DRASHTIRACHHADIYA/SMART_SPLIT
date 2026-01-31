import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

/**
 * Profile Page - User info and settings
 */
function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get("/auth/me");
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
            }
        } catch (error) {
            // Fallback to localStorage
            const userData = localStorage.getItem("user");
            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (e) { }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* PAGE HEADER */}
            <header className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">Manage your account</p>
                </div>
            </header>

            {/* PROFILE CARD */}
            <div className="profile-card">
                <div className="profile-avatar-large">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="profile-info">
                    <h2>{user?.name || "User"}</h2>
                    <p className="profile-detail">
                        <span className="detail-icon">📱</span>
                        {user?.phoneNumber || "No phone"}
                    </p>
                    {user?.email && (
                        <p className="profile-detail">
                            <span className="detail-icon">✉️</span>
                            {user.email}
                        </p>
                    )}
                    <p className="profile-status">
                        <span
                            className={`status-dot ${user?.accountStatus === "active" ? "active" : ""}`}
                        ></span>
                        Account {user?.accountStatus || "active"}
                    </p>
                </div>
            </div>

            {/* ACCOUNT SECTION */}
            <section className="section">
                <h2 className="section-title">Account</h2>

                <div className="settings-list">
                    <div className="settings-item">
                        <div className="settings-info">
                            <span className="settings-icon">🔐</span>
                            <div>
                                <span className="settings-label">Phone Verified</span>
                                <span className="settings-value">
                                    {user?.phoneVerified ? "Yes" : "No"}
                                </span>
                            </div>
                        </div>
                        <span className="settings-check">
                            {user?.phoneVerified ? "✓" : "—"}
                        </span>
                    </div>

                    <div className="settings-item">
                        <div className="settings-info">
                            <span className="settings-icon">📅</span>
                            <div>
                                <span className="settings-label">Member Since</span>
                                <span className="settings-value">
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-item">
                        <div className="settings-info">
                            <span className="settings-icon">🕐</span>
                            <div>
                                <span className="settings-label">Last Login</span>
                                <span className="settings-value">
                                    {user?.lastLoginAt
                                        ? new Date(user.lastLoginAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ACTIONS */}
            <section className="section">
                <button className="danger-btn" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </section>

            {/* VERSION */}
            <p className="version-text">SmartSplit v2.0 • Phone-based membership</p>
        </div>
    );
}

export default Profile;
