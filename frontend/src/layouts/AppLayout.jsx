import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import NotificationBell from "../components/NotificationBell";
import Toast from "../components/Toast";
import Onboarding from "../components/Onboarding";

/**
 * AppLayout - Persistent sidebar layout for all authenticated pages
 */
function AppLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [isReady, setIsReady] = useState(false);

    // Onboarding state - initialized to false, set after checking conditions
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Load user and check onboarding on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        const onboardingComplete = sessionStorage.getItem('smartsplit-onboarding-session');

        console.log('[AppLayout] Mount check:', {
            hasToken: !!token,
            hasUser: !!userData,
            onboardingComplete: !!onboardingComplete
        });

        // Only proceed if we have a valid token
        if (!token) {
            console.log('[AppLayout] No token, redirecting');
            navigate("/login");
            return;
        }

        // Parse user data
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("[AppLayout] Failed to parse user data");
            }
        }

        // Show onboarding only if:
        // 1. User is authenticated (token exists)
        // 2. Onboarding has not been completed (no localStorage flag)
        if (!onboardingComplete) {
            console.log('[Onboarding] Showing onboarding - first time user');
            setShowOnboarding(true);
        } else {
            console.log('[Onboarding] Skipping - already completed');
        }

        setIsReady(true);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Clear onboarding flag so it shows again on next login
        sessionStorage.removeItem('smartsplit-onboarding-session');
        navigate("/login");
    };

    const navItems = [
        { path: "/home", icon: "🏠", label: "Home" },
        { path: "/groups", icon: "👥", label: "Groups" },
        { path: "/profile", icon: "👤", label: "Profile" },
        { path: "/about", icon: "ℹ️", label: "About Us" },
    ];

    // Handle onboarding completion
    const handleOnboardingComplete = () => {
        console.log('[Onboarding] Completed - saving to session');
        sessionStorage.setItem('smartsplit-onboarding-session', 'true');
        setShowOnboarding(false);
    };

    // Don't render anything until ready
    if (!isReady) {
        return null;
    }

    // Show fullscreen onboarding for first-time users after login
    if (showOnboarding) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    return (
        <div className="app-layout">
            {/* SIDEBAR */}
            <aside className={`sidebar-new ${sidebarCollapsed ? "collapsed" : ""}`}>
                {/* LOGO */}
                <div className="sidebar-header">
                    <div className="logo-container">
                        <span className="logo-icon">💸</span>
                        {!sidebarCollapsed && <span className="logo-text">SmartSplit</span>}
                    </div>
                    <button
                        className="collapse-btn"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? "→" : "←"}
                    </button>
                </div>

                {/* NAVIGATION */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? "active" : ""}`
                            }
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* USER SECTION */}
                <div className="sidebar-footer">
                    {/* Theme Toggle */}
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    >
                        <span className="theme-icon">{theme === "light" ? "🌙" : "☀️"}</span>
                        {!sidebarCollapsed && (
                            <span className="theme-label">
                                {theme === "light" ? "Dark Mode" : "Light Mode"}
                            </span>
                        )}
                    </button>

                    {user && (
                        <div className="user-info">
                            <div className="user-avatar">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            {!sidebarCollapsed && (
                                <div className="user-details">
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-phone">{user.phoneNumber}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <button className="logout-btn-new" onClick={handleLogout}>
                        {sidebarCollapsed ? "🚪" : "Logout"}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content">
                {/* Header with Notification Bell */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '16px 40px',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)'
                }}>
                    <NotificationBell />
                </div>
                <Outlet />
                <Toast />
            </main>
        </div>
    );
}

export default AppLayout;

