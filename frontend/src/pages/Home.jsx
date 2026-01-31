import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import ExpenseChart from "../components/ExpenseChart";
import CategoryChart from "../components/CategoryChart";

/**
 * Home Page - Overview with summary cards and quick actions
 */
function Home() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalGroups: 0,
        totalExpenses: 0,
        youOwe: 0,
        youAreOwed: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse user");
            }
        }

        fetchOverviewData();
    }, []);

    const fetchOverviewData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/groups");
            const groups = res.data.groups || res.data || [];

            // Calculate stats from all groups
            let totalExpenses = 0;
            let youOwe = 0;
            let youAreOwed = 0;

            // Get current user ID from token
            const token = localStorage.getItem("token");
            let currentUserId = null;
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    currentUserId = payload.id;
                } catch (e) { }
            }

            // Fetch balances for each group
            for (const group of groups.slice(0, 5)) {
                try {
                    const balanceRes = await api.get(`/expenses/balance/${group._id}`);
                    const data = balanceRes.data;

                    if (data.summary?.totalExpenses) {
                        totalExpenses += data.summary.totalExpenses;
                    }

                    // Find current user's balance
                    const myBalance = data.balances?.active?.find(
                        (b) => b.participantId === currentUserId
                    );
                    if (myBalance) {
                        if (myBalance.balance > 0) {
                            youAreOwed += myBalance.balance;
                        } else {
                            youOwe += Math.abs(myBalance.balance);
                        }
                    }
                } catch (e) { }
            }

            setStats({
                totalGroups: groups.length,
                totalExpenses: Number(totalExpenses.toFixed(2)),
                youOwe: Number(youOwe.toFixed(2)),
                youAreOwed: Number(youAreOwed.toFixed(2)),
            });

            // Create recent activity from groups
            const activity = groups.slice(0, 5).map((g) => ({
                id: g._id,
                type: "group",
                name: g.name,
                memberCount: g.members?.length || 0,
                pendingCount: g.pendingMembers?.filter((p) => p.status === "invited").length || 0,
                updatedAt: g.updatedAt,
            }));
            setRecentActivity(activity);

            // Fetch all expenses for charts
            const expensesPromises = groups.map(g =>
                api.get(`/expenses/${g._id}`).catch(() => ({ data: { expenses: [] } }))
            );
            const expensesResults = await Promise.all(expensesPromises);
            const allExp = expensesResults.flatMap(res => res.data.expenses || res.data || []);
            setAllExpenses(allExp);
        } catch (error) {
            console.error("Failed to fetch overview data", error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">Loading your dashboard...</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* PAGE HEADER */}
            <header className="page-header">
                <div className="header-content">
                    <h1 className="page-title">
                        {getGreeting()}, {user?.name?.split(" ")[0] || "there"}! 👋
                    </h1>
                    <p className="page-subtitle">Here's your expense overview</p>
                </div>
                <Link to="/groups" className="primary-btn">
                    + Create Group
                </Link>
            </header>

            {/* STATS CARDS */}
            <section className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon groups">👥</div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalGroups}</span>
                        <span className="stat-label">Total Groups</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon expenses">📊</div>
                    <div className="stat-content">
                        <span className="stat-value">₹{stats.totalExpenses}</span>
                        <span className="stat-label">Total Expenses</span>
                    </div>
                </div>

                <div className="stat-card highlight-red">
                    <div className="stat-icon owe">↗️</div>
                    <div className="stat-content">
                        <span className="stat-value">₹{stats.youOwe}</span>
                        <span className="stat-label">You Owe</span>
                    </div>
                </div>

                <div className="stat-card highlight-green">
                    <div className="stat-icon owed">↙️</div>
                    <div className="stat-content">
                        <span className="stat-value">₹{stats.youAreOwed}</span>
                        <span className="stat-label">You Are Owed</span>
                    </div>
                </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions">
                    <Link to="/groups" className="action-card">
                        <span className="action-icon">➕</span>
                        <span className="action-label">New Group</span>
                    </Link>
                    <Link to="/groups" className="action-card">
                        <span className="action-icon">💰</span>
                        <span className="action-label">Add Expense</span>
                    </Link>
                    <Link to="/groups" className="action-card">
                        <span className="action-icon">🤝</span>
                        <span className="action-label">Settle Up</span>
                    </Link>
                    <Link to="/profile" className="action-card">
                        <span className="action-icon">⚙️</span>
                        <span className="action-label">Settings</span>
                    </Link>
                </div>
            </section>

            {/* INSIGHTS SECTION */}
            {allExpenses.length > 0 && (
                <section className="section">
                    <h2 className="section-title">Insights</h2>
                    <div className="insights-grid">
                        <div className="insight-card">
                            <h3 className="insight-title">Spending Trend (Last 30 Days)</h3>
                            <ExpenseChart expenses={allExpenses} mode="line" days={30} />
                        </div>
                        <div className="insight-card">
                            <h3 className="insight-title">Category Breakdown</h3>
                            <CategoryChart expenses={allExpenses} />
                        </div>
                    </div>
                </section>
            )}

            {/* RECENT GROUPS */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-title">Recent Groups</h2>
                    <Link to="/groups" className="view-all-link">
                        View All →
                    </Link>
                </div>

                {recentActivity.length === 0 ? (
                    <div className="empty-state">
                        <p>No groups yet. Create one to get started!</p>
                        <Link to="/groups" className="primary-btn">
                            Create Your First Group
                        </Link>
                    </div>
                ) : (
                    <div className="recent-list">
                        {recentActivity.map((item) => (
                            <Link
                                key={item.id}
                                to={`/groups/${item.id}`}
                                className="recent-item"
                            >
                                <div className="recent-icon">👥</div>
                                <div className="recent-content">
                                    <span className="recent-name">{item.name}</span>
                                    <span className="recent-meta">
                                        {item.memberCount} member{item.memberCount !== 1 ? "s" : ""}
                                        {item.pendingCount > 0 && (
                                            <span className="pending-badge-small">
                                                +{item.pendingCount} pending
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <span className="recent-arrow">→</span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
