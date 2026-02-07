import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import SplitSelector from "../components/SplitSelector";
import ActivityFeed from "../components/ActivityFeed";
import ExpenseChart from "../components/ExpenseChart";
import CategoryChart from "../components/CategoryChart";
import ErrorBoundary from "../components/ErrorBoundary";
import { useNotifications } from "../contexts/NotificationContext";
import { detectCategory, getCategoryLabel, getCategoryEmoji } from "../utils/categoryDetector";

/**
 * Group Detail Page - Members, Expenses, Settlements in tabs
 */
function GroupDetail() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { addNotification, showToast } = useNotifications();

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("expenses");

    // Expenses data
    const [expenses, setExpenses] = useState([]);
    const [balanceData, setBalanceData] = useState(null);
    const [settlements, setSettlements] = useState(null);

    // Add member state
    const [showAddMember, setShowAddMember] = useState(false);
    const [memberPhone, setMemberPhone] = useState("");
    const [memberName, setMemberName] = useState("");
    const [addingMember, setAddingMember] = useState(false);
    const [memberMessage, setMemberMessage] = useState({ type: "", text: "" });

    // Add expense state
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [expenseTitle, setExpenseTitle] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseCategory, setExpenseCategory] = useState("other");
    const [expenseNotes, setExpenseNotes] = useState("");
    const [splitData, setSplitData] = useState({ splitType: "equal", splits: [], isValid: false });
    const [addingExpense, setAddingExpense] = useState(false);

    // Search/filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    // Auto-detected category suggestion
    const [suggestedCategory, setSuggestedCategory] = useState(null);

    // Auto-detect category when expense title changes
    const handleTitleChange = (value) => {
        setExpenseTitle(value);
        if (value.trim().length >= 3) {
            const detected = detectCategory(value);
            if (detected.category !== 'other' && detected.confidence >= 50) {
                setSuggestedCategory(detected);
                setExpenseCategory(detected.category);
            } else {
                setSuggestedCategory(null);
            }
        } else {
            setSuggestedCategory(null);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchGroupData();
        }
    }, [groupId]);

    const fetchGroupData = async () => {
        try {
            setLoading(true);

            // Fetch group details
            const groupRes = await api.get(`/groups/${groupId}`);
            const groupData = groupRes.data.group || groupRes.data;
            setGroup(groupData);

            // Fetch expenses
            const expenseRes = await api.get(`/expenses/${groupId}`);
            setExpenses(expenseRes.data.expenses || expenseRes.data || []);

            // Fetch balances
            const balanceRes = await api.get(`/expenses/balance/${groupId}`);
            setBalanceData(balanceRes.data);

            // Fetch settlements
            const settlementRes = await api.get(`/expenses/settlement/${groupId}`);
            setSettlements(settlementRes.data);
        } catch (error) {
            console.error("Failed to fetch group data", error);
            if (error.response?.status === 404 || error.response?.status === 403) {
                navigate("/groups");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!memberPhone || memberPhone.length < 10) return;

        setAddingMember(true);
        setMemberMessage({ type: "", text: "" });

        try {
            const res = await api.post(`/groups/${groupId}/add-member`, {
                phoneNumber: "+91" + memberPhone.replace(/^0+/, ""),
                displayName: memberName.trim() || "Unknown",
            });

            if (res.data.success) {
                const name = res.data.member.name || res.data.member.displayName;
                setMemberMessage({
                    type: res.data.memberType === "active" ? "success" : "pending",
                    text:
                        res.data.memberType === "active"
                            ? `✅ ${name} added to the group!`
                            : `📱 Invitation sent! They'll join when they register.`,
                });
                setMemberPhone("");
                setMemberName("");
                fetchGroupData();
            }
        } catch (error) {
            setMemberMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to add member",
            });
        } finally {
            setAddingMember(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();

        // Defensive: validate all required fields
        const parsedAmount = parseFloat(expenseAmount);
        if (!expenseTitle || !expenseAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
            console.warn("[AddExpense] Invalid form data", { expenseTitle, expenseAmount, parsedAmount });
            return;
        }
        if (!splitData.isValid) {
            console.warn("[AddExpense] Split data not valid", splitData);
            return;
        }

        setAddingExpense(true);

        try {
            await api.post("/expenses", {
                groupId,
                title: expenseTitle.trim(),
                amount: parsedAmount,
                category: expenseCategory,
                notes: expenseNotes.trim(),
                splitType: splitData.splitType,
                splitBetween: splitData.splits,
            });

            setShowAddExpense(false);
            setExpenseTitle("");
            setExpenseAmount("");
            setExpenseCategory("other");
            setExpenseNotes("");
            setSplitData({ splitType: "equal", splits: [], isValid: false });
            fetchGroupData();
        } catch (error) {
            console.error("[AddExpense] Failed to add expense", error);
        } finally {
            setAddingExpense(false);
        }
    };

    // Memoized callback for SplitSelector
    const handleSplitChange = useCallback((data) => {
        setSplitData(data);
    }, []);

    // Memoize participants to prevent infinite re-render loop in SplitSelector
    const allParticipants = useMemo(() => {
        const participants = [];

        // Active members
        group?.members?.forEach((m) => {
            participants.push({
                id: m._id,
                name: m.name,
                type: "User",
                isPending: false,
            });
        });

        // Pending members
        group?.pendingMembers
            ?.filter((p) => p.status === "invited")
            .forEach((p) => {
                participants.push({
                    id: p._id,
                    name: p.displayName,
                    type: "PendingMember",
                    isPending: true,
                });
            });

        return participants;
    }, [group?.members, group?.pendingMembers]);

    const toggleParticipant = (participant) => {
        setSelectedParticipants((prev) => {
            const exists = prev.find((p) => p.id === participant.id);
            if (exists) {
                return prev.filter((p) => p.id !== participant.id);
            }
            return [...prev, participant];
        });
    };

    // Generate activity feed from expenses and group data
    const generateActivityFeed = () => {
        const activities = [];

        // Add expense activities
        expenses.forEach(exp => {
            activities.push({
                type: 'expense',
                text: `<strong>${exp.paidBy?.name || 'Someone'}</strong> added "${exp.title}"`,
                timestamp: exp.createdAt,
                amount: exp.amount
            });
        });

        // Add member activities
        group?.members?.forEach(member => {
            activities.push({
                type: 'member',
                text: `<strong>${member.name}</strong> joined the group`,
                timestamp: member.createdAt || group.createdAt
            });
        });

        // Sort by timestamp descending
        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    // Filter expenses based on search and category
    const getFilteredExpenses = () => {
        return expenses.filter(exp => {
            const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    };

    const categoryLabels = {
        food: 'Food',
        transport: 'Transport',
        entertainment: 'Entertainment',
        utilities: 'Utilities',
        rent: 'Rent',
        shopping: 'Shopping',
        health: 'Health',
        other: 'Other'
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">Loading group...</div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <p>Group not found</p>
                    <Link to="/groups" className="primary-btn">
                        Back to Groups
                    </Link>
                </div>
            </div>
        );
    }

    const activeMembers = group.members || [];
    const pendingMembers =
        group.pendingMembers?.filter((p) => p.status === "invited") || [];

    return (
        <div className="page-container">
            {/* BREADCRUMB */}
            <nav className="breadcrumb">
                <Link to="/groups">Groups</Link>
                <span className="breadcrumb-sep">/</span>
                <span>{group.name}</span>
            </nav>

            {/* GROUP HEADER */}
            <header className="group-detail-header">
                <div className="group-avatar-large">
                    {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="group-header-content">
                    <h1 className="page-title">{group.name}</h1>
                    {group.description && (
                        <p className="group-description">{group.description}</p>
                    )}
                    <div className="group-meta">
                        <span>👥 {activeMembers.length} members</span>
                        {pendingMembers.length > 0 && (
                            <span className="pending-badge">
                                ⏳ {pendingMembers.length} pending
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* TABS */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === "expenses" ? "active" : ""}`}
                    onClick={() => setActiveTab("expenses")}
                >
                    💰 Expenses
                </button>
                <button
                    className={`tab ${activeTab === "members" ? "active" : ""}`}
                    onClick={() => setActiveTab("members")}
                >
                    👥 Members
                </button>
                <button
                    className={`tab ${activeTab === "balances" ? "active" : ""}`}
                    onClick={() => setActiveTab("balances")}
                >
                    📊 Balances
                </button>
                <button
                    className={`tab ${activeTab === "activity" ? "active" : ""}`}
                    onClick={() => setActiveTab("activity")}
                >
                    📋 Activity
                </button>
                <button
                    className={`tab ${activeTab === "settlements" ? "active" : ""}`}
                    onClick={() => setActiveTab("settlements")}
                >
                    🤝 Settle Up
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="tab-content">
                {/* EXPENSES TAB */}
                {activeTab === "expenses" && (
                    <div className="expenses-tab">
                        <div className="tab-header">
                            <h2>Expense History</h2>
                            <button
                                className="primary-btn"
                                onClick={() => setShowAddExpense(true)}
                            >
                                + Add Expense
                            </button>
                        </div>

                        {/* Search and Filter */}
                        {expenses.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="Search expenses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                    style={{ flex: 1, maxWidth: '100%' }}
                                />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    style={{
                                        padding: '12px 16px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="all">All Categories</option>
                                    {Object.entries(categoryLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Charts */}
                        {expenses.length > 0 && (
                            <div className="insights-grid" style={{ marginBottom: '24px' }}>
                                <div className="insight-card">
                                    <h3 className="insight-title">Spending Trend</h3>
                                    <ExpenseChart expenses={expenses} mode="bar" days={30} />
                                </div>
                                <div className="insight-card">
                                    <h3 className="insight-title">Category Breakdown</h3>
                                    <CategoryChart expenses={expenses} />
                                </div>
                            </div>
                        )}

                        {getFilteredExpenses().length === 0 && expenses.length > 0 ? (
                            <div className="empty-state-small">
                                <p>No expenses match your filters</p>
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="empty-state-small">
                                <p>No expenses yet</p>
                                <button
                                    className="secondary-btn"
                                    onClick={() => setShowAddExpense(true)}
                                >
                                    Add First Expense
                                </button>
                            </div>
                        ) : (
                            <div className="expense-list-new">
                                {getFilteredExpenses().map((exp) => (
                                    <div
                                        key={exp._id}
                                        className={`expense-card ${exp.hasPendingParticipants ? "has-pending" : ""}`}
                                    >
                                        <div className="expense-card-main">
                                            <div className="expense-icon">💸</div>
                                            <div className="expense-details">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span className="expense-title">{exp.title}</span>
                                                    {exp.category && exp.category !== 'other' && (
                                                        <span style={{
                                                            fontSize: '11px',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            background: 'var(--primary-light)',
                                                            color: 'var(--primary)',
                                                            fontWeight: 500
                                                        }}>
                                                            {categoryLabels[exp.category]}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="expense-meta">
                                                    Paid by {exp.paidBy?.name || "Someone"} •{" "}
                                                    {new Date(exp.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </span>
                                                {exp.notes && (
                                                    <span style={{
                                                        fontSize: '13px',
                                                        color: 'var(--text-muted)',
                                                        marginTop: '4px',
                                                        display: 'block'
                                                    }}>
                                                        📝 {exp.notes}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="expense-amount-large">
                                                ₹{exp.amount}
                                            </span>
                                        </div>
                                        {exp.hasPendingParticipants && (
                                            <div className="expense-pending-note">
                                                ⏳ Includes pending members
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MEMBERS TAB */}
                {activeTab === "members" && (
                    <div className="members-tab">
                        <div className="tab-header">
                            <h2>Group Members</h2>
                            <button
                                className="primary-btn"
                                onClick={() => setShowAddMember(!showAddMember)}
                            >
                                + Add Member
                            </button>
                        </div>

                        {/* Add Member Form */}
                        {showAddMember && (
                            <form onSubmit={handleAddMember} className="add-member-form">
                                <div className="form-row">
                                    <input
                                        type="tel"
                                        placeholder="Phone number (10 digits)"
                                        value={memberPhone}
                                        onChange={(e) =>
                                            setMemberPhone(e.target.value.replace(/\D/g, ""))
                                        }
                                        maxLength={10}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Name (optional)"
                                        value={memberName}
                                        onChange={(e) => setMemberName(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="primary-btn"
                                        disabled={addingMember || memberPhone.length < 10}
                                    >
                                        {addingMember ? "..." : "Add"}
                                    </button>
                                </div>
                                {memberMessage.text && (
                                    <p className={`form-message ${memberMessage.type}`}>
                                        {memberMessage.text}
                                    </p>
                                )}
                            </form>
                        )}

                        {/* Active Members */}
                        <div className="members-section">
                            <h3>Active Members</h3>
                            <div className="members-list">
                                {activeMembers.map((member) => (
                                    <div key={member._id} className="member-card">
                                        <div className="member-avatar">
                                            {member.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <div className="member-info">
                                            <span className="member-name">{member.name}</span>
                                            <span className="member-phone">{member.phoneNumber}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pending Members */}
                        {pendingMembers.length > 0 && (
                            <div className="members-section pending">
                                <h3>⏳ Pending Invitations</h3>
                                <p className="section-note">
                                    These members will join when they register
                                </p>
                                <div className="members-list">
                                    {pendingMembers.map((member) => (
                                        <div key={member._id} className="member-card pending">
                                            <div className="member-avatar pending">
                                                {member.displayName?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div className="member-info">
                                                <span className="member-name">
                                                    {member.displayName}
                                                    <span className="pending-tag">Invited</span>
                                                </span>
                                                <span className="member-phone">
                                                    {member.phoneNumber}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* BALANCES TAB */}
                {activeTab === "balances" && (
                    <div className="balances-tab">
                        <h2>Group Balances</h2>

                        {/* Active Balances */}
                        {balanceData?.balances?.active?.length > 0 && (
                            <div className="balance-section">
                                {balanceData.balances.active.map((b) => (
                                    <div key={b.participantId} className="balance-card">
                                        <div className="balance-user">
                                            <div className="balance-avatar">
                                                {b.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <span>{b.name}</span>
                                        </div>
                                        <span
                                            className={`balance-value ${b.balance > 0 ? "positive" : b.balance < 0 ? "negative" : ""}`}
                                        >
                                            {b.balance > 0
                                                ? `Gets ₹${b.balance.toFixed(2)}`
                                                : b.balance < 0
                                                    ? `Owes ₹${Math.abs(b.balance).toFixed(2)}`
                                                    : "Settled ✓"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pending Balances */}
                        {balanceData?.balances?.pending?.length > 0 && (
                            <div className="balance-section pending">
                                <h3>⏳ Pending Members</h3>
                                <p className="section-note">
                                    These balances will be confirmed when members register
                                </p>
                                {balanceData.balances.pending.map((b) => (
                                    <div key={b.participantId} className="balance-card pending">
                                        <div className="balance-user">
                                            <div className="balance-avatar pending">
                                                {b.name?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <span>
                                                {b.name}
                                                <span className="pending-tag">Invited</span>
                                            </span>
                                        </div>
                                        <span
                                            className={`balance-value ${b.balance > 0 ? "positive" : "negative"}`}
                                        >
                                            {b.balance > 0
                                                ? `Gets ₹${b.balance.toFixed(2)}`
                                                : `Owes ₹${Math.abs(b.balance).toFixed(2)}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!balanceData?.balances?.active?.length &&
                            !balanceData?.balances?.pending?.length && (
                                <div className="empty-state-small">
                                    <p>No balances yet. Add an expense to see balances.</p>
                                </div>
                            )}
                    </div>
                )}

                {/* SETTLEMENTS TAB */}
                {activeTab === "settlements" && (
                    <div className="settlements-tab">
                        <h2>Settle Up</h2>

                        {/* Ready Settlements */}
                        {settlements?.settlements?.ready?.length > 0 && (
                            <div className="settlement-section">
                                <h3>✅ Ready to Settle</h3>
                                {settlements.settlements.ready.map((s, idx) => (
                                    <div key={idx} className="settlement-card ready">
                                        <div className="settlement-flow">
                                            <span className="settlement-name">{s.from?.name}</span>
                                            <span className="settlement-arrow">
                                                → pays ₹{s.amount} to →
                                            </span>
                                            <span className="settlement-name">{s.to?.name}</span>
                                        </div>
                                        <button
                                            className="reminder-btn"
                                            onClick={() => {
                                                addNotification({
                                                    type: 'reminder',
                                                    message: `Payment reminder: ${s.from?.name} owes ₹${s.amount} to ${s.to?.name}`,
                                                    priority: 'high',
                                                    showToast: true
                                                });
                                                showToast({
                                                    type: 'success',
                                                    message: 'Reminder sent!',
                                                    duration: 3000
                                                });
                                            }}
                                            style={{
                                                marginTop: '12px',
                                                padding: '8px 16px',
                                                background: 'var(--primary-light)',
                                                color: 'var(--primary)',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            ⏰ Send Reminder
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pending Settlements */}
                        {settlements?.settlements?.pending?.length > 0 && (
                            <div className="settlement-section pending">
                                <h3>⏳ Waiting for Registration</h3>
                                <p className="section-note">
                                    Can't settle until these members register
                                </p>
                                {settlements.settlements.pending.map((s, idx) => (
                                    <div key={idx} className="settlement-card pending">
                                        <span className="settlement-name">
                                            {s.name}
                                            <span className="pending-tag">Invited</span>
                                        </span>
                                        <span className="settlement-amount">
                                            {s.direction === "to_pay"
                                                ? `Owes ₹${s.amount}`
                                                : `Gets ₹${s.amount}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!settlements?.settlements?.ready?.length &&
                            !settlements?.settlements?.pending?.length && (
                                <div className="empty-state-small">
                                    <p>🎉 Everyone is settled! No payments needed.</p>
                                </div>
                            )}
                    </div>
                )}

                {/* ACTIVITY TAB */}
                {activeTab === "activity" && (
                    <div className="activity-tab">
                        <h2>Activity Timeline</h2>
                        <ActivityFeed groupId={groupId} activities={generateActivityFeed()} />
                    </div>
                )}
            </div>

            {/* ADD EXPENSE MODAL */}
            {showAddExpense && (
                <div className="modal-overlay" onClick={() => setShowAddExpense(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <ErrorBoundary fallbackMessage="Failed to load expense form. Please close and try again.">
                            <div className="modal-header">
                                <h2>Add Expense</h2>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowAddExpense(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleAddExpense} className="modal-form">
                                <div className="form-group">
                                    <label>What's it for?</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Dinner, Groceries, Uber"
                                        value={expenseTitle}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    {suggestedCategory && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginTop: '8px',
                                            padding: '8px 12px',
                                            background: 'var(--success-light)',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            color: 'var(--success)'
                                        }}>
                                            <span>{getCategoryEmoji(suggestedCategory.category)}</span>
                                            <span>Detected: <strong>{getCategoryLabel(suggestedCategory.category)}</strong></span>
                                            <span style={{ opacity: 0.7 }}>({suggestedCategory.confidence}% match)</span>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={expenseAmount}
                                        onChange={(e) => {
                                            // Defensive: only set value, don't navigate or submit
                                            const val = e.target.value;
                                            setExpenseAmount(val);
                                        }}
                                        onKeyDown={(e) => {
                                            // Prevent form submission on Enter in this input
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                            }
                                        }}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={expenseCategory}
                                        onChange={(e) => setExpenseCategory(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {Object.entries(categoryLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Notes (optional)</label>
                                    <textarea
                                        placeholder="Add any additional details..."
                                        value={expenseNotes}
                                        onChange={(e) => setExpenseNotes(e.target.value)}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Split between</label>
                                    {expenseAmount && parseFloat(expenseAmount) > 0 ? (
                                        <SplitSelector
                                            participants={allParticipants}
                                            totalAmount={parseFloat(expenseAmount) || 0}
                                            onSplitChange={handleSplitChange}
                                            initialMode="equal"
                                        />
                                    ) : (
                                        <p className="form-hint">Enter an amount above to configure split</p>
                                    )}
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={() => setShowAddExpense(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="primary-btn"
                                        disabled={
                                            addingExpense ||
                                            !expenseTitle ||
                                            !expenseAmount ||
                                            !splitData.isValid
                                        }
                                    >
                                        {addingExpense ? "Adding..." : "Add Expense"}
                                    </button>
                                </div>
                            </form>
                        </ErrorBoundary>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GroupDetail;
