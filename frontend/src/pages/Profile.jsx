import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import api from "../api/api";

/* ─── helpers ─── */
function getTier(score) {
    if (score >= 800) return { label: "Excellent", color: "#22c55e", bg: "rgba(34,197,94,0.12)" };
    if (score >= 650) return { label: "Good", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" };
    if (score >= 500) return { label: "Risky", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
    return { label: "Unreliable", color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
}

function formatReason(reason) {
    const map = {
        on_time_settlement: "On-time settlement",
        settlement_within_3d: "Settled within 3 days",
        consecutive_bonus: "5× on-time bonus",
        delayed_gt3: "Delayed > 3 days",
        delayed_gt7: "Delayed > 7 days",
        delayed_gt15: "Pending > 15 days",
        reminder_ignored: "Reminder ignored",
    };
    return map[reason] || reason;
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/* ─── Animated score counter hook ─── */
function useAnimatedCounter(target, duration = 1200) {
    const [value, setValue] = useState(0);
    const rafRef = useRef(null);

    useEffect(() => {
        if (target <= 0) return;
        let start = null;
        const from = 0;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(from + (target - from) * eased));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);
        return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    }, [target, duration]);

    return value;
}

/**
 * Profile Page — User info, Credit Score, and settings
 */
function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Credit score state
    const [creditScore, setCreditScore] = useState(750);
    const [consecutiveOnTime, setConsecutiveOnTime] = useState(0);
    const [tier, setTier] = useState(getTier(750));
    const [history, setHistory] = useState([]);
    const [recentChanges, setRecentChanges] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    // Animated counter
    const animatedScore = useAnimatedCounter(creditScore);

    useEffect(() => {
        fetchUser();
        fetchCreditData();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get("/auth/me");
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem("user", JSON.stringify(res.data.user));
            }
        } catch (error) {
            const userData = localStorage.getItem("user");
            if (userData) {
                try { setUser(JSON.parse(userData)); } catch (e) { }
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCreditData = async () => {
        try {
            // Fetch score
            const scoreRes = await api.get("/credit/score");
            if (scoreRes.data.success) {
                setCreditScore(scoreRes.data.creditScore);
                setConsecutiveOnTime(scoreRes.data.consecutiveOnTime || 0);
                setTier(getTier(scoreRes.data.creditScore));
            }

            // Fetch history for trend chart + recent changes
            const histRes = await api.get("/credit/history?limit=10");
            if (histRes.data.success && histRes.data.history.length > 0) {
                // Chart data — oldest first
                const chartData = histRes.data.history
                    .slice()
                    .reverse()
                    .map((h) => ({
                        date: new Date(h.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                        }),
                        score: h.newScore,
                        change: h.changeAmount,
                        reason: formatReason(h.reason),
                    }));
                setHistory(chartData);

                // Recent changes — newest first (last 5)
                setRecentChanges(
                    histRes.data.history.slice(0, 5).map((h) => ({
                        reason: formatReason(h.reason),
                        change: h.changeAmount,
                        time: timeAgo(h.createdAt),
                        rawTime: h.createdAt,
                    }))
                );
            }
        } catch (err) {
            console.error("Credit data fetch error:", err);
        } finally {
            setHistoryLoading(false);
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

            {/* ═══════════ CREDIT SCORE CARD ═══════════ */}
            <section className="credit-score-section">
                <h2 className="section-title">Credit Score</h2>

                <div className="credit-score-card" style={{ borderColor: tier.color }}>
                    {/* Score display */}
                    <div className="credit-score-top">
                        <div className="credit-score-gauge">
                            <span className="credit-score-number" style={{ color: tier.color }}>
                                {animatedScore}
                            </span>
                            <span className="credit-score-range">/ 900</span>
                        </div>
                        <div>
                            <div
                                className="credit-score-badge"
                                style={{ background: tier.bg, color: tier.color }}
                            >
                                {tier.label}
                            </div>
                            {consecutiveOnTime > 0 && (
                                <div className="credit-streak-badge">
                                    🔥 {consecutiveOnTime} on-time streak
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="credit-score-bar-track">
                        <div
                            className="credit-score-bar-fill"
                            style={{
                                width: `${((creditScore - 300) / 600) * 100}%`,
                                background: tier.color,
                            }}
                        ></div>
                    </div>
                    <div className="credit-score-bar-labels">
                        <span>300</span>
                        <span>900</span>
                    </div>

                    {/* Trend Chart */}
                    {!historyLoading && history.length > 0 && (
                        <div className="credit-score-chart">
                            <h3 className="credit-chart-title">Score Trend</h3>
                            <ResponsiveContainer width="100%" height={160}>
                                <LineChart data={history}>
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={[300, 900]}
                                        tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={35}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "var(--card-bg, #1e1e2e)",
                                            border: "1px solid var(--border-color, #333)",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                        }}
                                        formatter={(value, name, props) => [
                                            `${value} (${props.payload.change > 0 ? "+" : ""}${props.payload.change})`,
                                            props.payload.reason,
                                        ]}
                                    />
                                    <ReferenceLine y={750} stroke="#555" strokeDasharray="3 3" />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke={tier.color}
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: tier.color }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Recent Changes */}
                    {!historyLoading && recentChanges.length > 0 && (
                        <div className="credit-recent-changes">
                            <h3 className="credit-recent-title">Recent Changes</h3>
                            {recentChanges.map((item, i) => (
                                <div className="credit-change-item" key={i}>
                                    <div className="credit-change-left">
                                        <span className="credit-change-reason">{item.reason}</span>
                                        <span className="credit-change-time">{item.time}</span>
                                    </div>
                                    <span
                                        className={`credit-change-delta ${item.change >= 0 ? "positive" : "negative"}`}
                                    >
                                        {item.change > 0 ? "+" : ""}{item.change}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {!historyLoading && history.length === 0 && (
                        <p className="credit-no-history">
                            No score changes yet. Settle expenses to build your credit history.
                        </p>
                    )}
                </div>
            </section>

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
