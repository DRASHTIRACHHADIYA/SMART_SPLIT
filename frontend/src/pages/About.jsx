import { useState } from "react";

/* ─── Section data ─── */
const SECTIONS = [
    {
        id: "what",
        icon: "💸",
        title: "What is SmartSplit?",
        content: (
            <>
                <p>
                    <strong>SmartSplit</strong> is a fintech-grade expense management platform built
                    for groups — friends, roommates, families, and teams. It eliminates the awkwardness
                    of "who owes whom" by automating expense tracking, splitting, and settlement.
                </p>
                <div className="about-highlights">
                    <div className="about-highlight-item">
                        <span className="about-highlight-icon">📊</span>
                        <span>Real-time balance tracking</span>
                    </div>
                    <div className="about-highlight-item">
                        <span className="about-highlight-icon">🔔</span>
                        <span>Smart payment reminders</span>
                    </div>
                    <div className="about-highlight-item">
                        <span className="about-highlight-icon">🏦</span>
                        <span>Financial behaviour scoring</span>
                    </div>
                    <div className="about-highlight-item">
                        <span className="about-highlight-icon">🔒</span>
                        <span>Transparent & auditable</span>
                    </div>
                </div>
            </>
        ),
    },
    {
        id: "splitting",
        icon: "➗",
        title: "Expense Splitting Methods",
        content: (
            <>
                <p>
                    SmartSplit supports three splitting strategies to suit every situation:
                </p>
                <div className="about-split-cards">
                    <div className="about-split-card">
                        <div className="about-split-card-header">
                            <span className="about-split-badge equal">Equal</span>
                        </div>
                        <p>
                            Total amount is divided <strong>equally</strong> among all selected
                            participants. Ideal for shared meals, rent, and subscriptions.
                        </p>
                        <div className="about-formula">
                            <code>Each Share = Total ÷ Number of Participants</code>
                        </div>
                        <p className="about-example">
                            <em>Example: ₹1200 dinner among 4 people → ₹300 each</em>
                        </p>
                    </div>
                    <div className="about-split-card">
                        <div className="about-split-card-header">
                            <span className="about-split-badge percentage">Percentage</span>
                        </div>
                        <p>
                            Each participant pays a <strong>custom percentage</strong> of the total.
                            Perfect for income-proportional sharing.
                        </p>
                        <div className="about-formula">
                            <code>Share = Total × (Assigned % ÷ 100)</code>
                        </div>
                        <p className="about-example">
                            <em>Example: ₹5000 trip — Person A: 50%, Person B: 30%, Person C: 20%</em>
                        </p>
                    </div>
                    <div className="about-split-card">
                        <div className="about-split-card-header">
                            <span className="about-split-badge custom">Custom</span>
                        </div>
                        <p>
                            Manually assign <strong>exact amounts</strong> to each person.
                            Best for itemized bills or uneven contributions.
                        </p>
                        <div className="about-formula">
                            <code>Sum of all shares must equal Total Amount</code>
                        </div>
                        <p className="about-example">
                            <em>Example: ₹3000 bill — Person A: ₹1500, Person B: ₹1000, Person C: ₹500</em>
                        </p>
                    </div>
                </div>
            </>
        ),
    },
    {
        id: "settlement",
        icon: "🤝",
        title: "Settlement Algorithm",
        content: (
            <>
                <p>
                    SmartSplit uses a <strong>greedy minimization algorithm</strong> to reduce the
                    number of transactions needed to settle all debts within a group.
                </p>
                <div className="about-algorithm-steps">
                    <div className="about-step">
                        <div className="about-step-number">1</div>
                        <div className="about-step-content">
                            <strong>Calculate Net Balances</strong>
                            <p>For each member, compute: (Amount Paid) − (Amount Owed). Positive = creditor, Negative = debtor.</p>
                        </div>
                    </div>
                    <div className="about-step">
                        <div className="about-step-number">2</div>
                        <div className="about-step-content">
                            <strong>Sort & Match</strong>
                            <p>Sort debtors and creditors by amount (descending). Match the largest debtor with the largest creditor.</p>
                        </div>
                    </div>
                    <div className="about-step">
                        <div className="about-step-number">3</div>
                        <div className="about-step-content">
                            <strong>Settle Pairwise</strong>
                            <p>Transfer the minimum of the two amounts. Adjust remaining balances and repeat until all debts are zero.</p>
                        </div>
                    </div>
                    <div className="about-step">
                        <div className="about-step-number">4</div>
                        <div className="about-step-content">
                            <strong>Minimal Transactions</strong>
                            <p>This guarantees the fewest possible transfers — no circular payments, no unnecessary intermediaries.</p>
                        </div>
                    </div>
                </div>
            </>
        ),
    },
    {
        id: "credit",
        icon: "📈",
        title: "Credit Score System",
        content: (
            <>
                <p>
                    Every SmartSplit user has a financial behaviour score — a transparent measure of
                    payment reliability and trustworthiness within the platform.
                </p>

                {/* Score range */}
                <div className="about-credit-range">
                    <div className="about-credit-range-bar">
                        <div className="about-range-segment unreliable">
                            <span>300</span>
                        </div>
                        <div className="about-range-segment risky">
                            <span>500</span>
                        </div>
                        <div className="about-range-segment good">
                            <span>650</span>
                        </div>
                        <div className="about-range-segment excellent">
                            <span>800</span>
                        </div>
                        <div className="about-range-end">
                            <span>900</span>
                        </div>
                    </div>
                    <div className="about-credit-labels">
                        <span className="about-tier-label" style={{ color: "#ef4444" }}>Unreliable</span>
                        <span className="about-tier-label" style={{ color: "#f59e0b" }}>Risky</span>
                        <span className="about-tier-label" style={{ color: "#3b82f6" }}>Good</span>
                        <span className="about-tier-label" style={{ color: "#22c55e" }}>Excellent</span>
                    </div>
                </div>

                <div className="about-credit-default">
                    🎯 <strong>Default Score for New Users: 750</strong>
                    <span> (Good tier)</span>
                </div>

                {/* Positive rules */}
                <h4 className="about-rules-heading positive">
                    <span className="about-rules-icon">✅</span> Positive Scoring Rules
                </h4>
                <div className="about-rules-table">
                    <div className="about-rule-row positive">
                        <span className="about-rule-event">On-time settlement (within 24 hours)</span>
                        <span className="about-rule-score positive">+10</span>
                    </div>
                    <div className="about-rule-row positive">
                        <span className="about-rule-event">Settlement within 3 days</span>
                        <span className="about-rule-score positive">+5</span>
                    </div>
                    <div className="about-rule-row positive">
                        <span className="about-rule-event">5 consecutive on-time settlements (bonus)</span>
                        <span className="about-rule-score positive">+20</span>
                    </div>
                </div>

                {/* Negative rules */}
                <h4 className="about-rules-heading negative">
                    <span className="about-rules-icon">⚠️</span> Negative Scoring Rules
                </h4>
                <div className="about-rules-table">
                    <div className="about-rule-row negative">
                        <span className="about-rule-event">Payment delayed &gt; 3 days</span>
                        <span className="about-rule-score negative">−15</span>
                    </div>
                    <div className="about-rule-row negative">
                        <span className="about-rule-event">Payment delayed &gt; 7 days</span>
                        <span className="about-rule-score negative">−25</span>
                    </div>
                    <div className="about-rule-row negative">
                        <span className="about-rule-event">Payment pending &gt; 15 days</span>
                        <span className="about-rule-score negative">−40</span>
                    </div>
                    <div className="about-rule-row negative">
                        <span className="about-rule-event">Reminder ignored</span>
                        <span className="about-rule-score negative">−10</span>
                    </div>
                </div>

                {/* Formula */}
                <div className="about-formula-box">
                    <h4>Score Calculation</h4>
                    <div className="about-formula-display">
                        <code>New Score = clamp(Old Score + Δ, 300, 900)</code>
                    </div>
                    <p>
                        Where <code>Δ</code> is the score delta from the table above. The score
                        is clamped to always remain within the <strong>300–900</strong> range.
                        Each settlement event produces exactly one score change — no stacking
                        of multiple penalties for the same delay period.
                    </p>
                </div>

                {/* Tips */}
                <h4 className="about-rules-heading tips">
                    <span className="about-rules-icon">💡</span> Tips to Improve Your Score
                </h4>
                <ul className="about-tips-list">
                    <li>Settle your share <strong>within 24 hours</strong> for the highest bonus</li>
                    <li>Maintain a <strong>5-settlement streak</strong> to earn the +20 consistency bonus</li>
                    <li>Respond to reminders promptly — <strong>ignoring costs you −10</strong></li>
                    <li>Avoid letting payments age past <strong>3 days</strong> to prevent penalties</li>
                    <li>Check your credit score on the <strong>Profile page</strong> regularly</li>
                </ul>

                {/* Integrity */}
                <div className="about-integrity-box">
                    <div className="about-integrity-icon">🔒</div>
                    <div>
                        <h4>System Integrity</h4>
                        <p>
                            Credit scores are <strong>fully automated</strong> and <strong>tamper-proof</strong>.
                            No user — including group admins — can manually edit, override, or reset
                            a credit score. Every score change is logged in an immutable audit trail
                            with the exact reason, timestamp, old score, and new score. This ensures
                            complete transparency and financial fairness for all users.
                        </p>
                    </div>
                </div>
            </>
        ),
    },
];

/**
 * About Page — Professional explainer for SmartSplit features and credit system
 */
function About() {
    const [activeSection, setActiveSection] = useState("what");

    return (
        <div className="page-container about-page">
            {/* PAGE HEADER */}
            <header className="page-header">
                <div className="header-content">
                    <h1 className="page-title">About SmartSplit</h1>
                    <p className="page-subtitle">
                        Everything you need to know about our platform, algorithms, and credit system
                    </p>
                </div>
            </header>

            {/* SECTION TABS */}
            <div className="about-tabs">
                {SECTIONS.map((s) => (
                    <button
                        key={s.id}
                        className={`about-tab ${activeSection === s.id ? "active" : ""}`}
                        onClick={() => setActiveSection(s.id)}
                    >
                        <span className="about-tab-icon">{s.icon}</span>
                        <span className="about-tab-label">{s.title}</span>
                    </button>
                ))}
            </div>

            {/* ACTIVE SECTION CONTENT */}
            {SECTIONS.map((s) =>
                activeSection === s.id ? (
                    <section key={s.id} className="about-section-card">
                        <div className="about-section-header">
                            <span className="about-section-icon">{s.icon}</span>
                            <h2 className="about-section-title">{s.title}</h2>
                        </div>
                        <div className="about-section-body">{s.content}</div>
                    </section>
                ) : null
            )}

            {/* FOOTER */}
            <footer className="about-footer">
                <div className="about-footer-inner">
                    <p className="about-footer-copyright">© 2026 SmartSplit</p>
                    <p className="about-footer-credit">
                        Designed &amp; Developed by <strong>Drashti</strong>
                    </p>
                    <p className="about-footer-rights">All Rights Reserved</p>
                </div>
            </footer>
        </div>
    );
}

export default About;
