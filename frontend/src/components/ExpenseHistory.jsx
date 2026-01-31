import { useEffect, useState } from "react";
import api from "../api/api";

/**
 * Expense History with Pending Participant Indicators
 */
function ExpenseHistory({ groupId, userMap, refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/expenses/${groupId}`);
        // Handle new response format
        const expenseData = res.data.expenses || res.data;
        setExpenses(expenseData);
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [groupId, refreshTrigger]);

  if (!groupId) return null;
  if (loading) return <p>Loading expense history...</p>;
  if (!expenses.length) return <p>No expenses added yet.</p>;

  return (
    <div style={{ marginTop: "24px" }}>
      <h3>Expense History</h3>

      <ul className="expense-history-list">
        {expenses.map((exp) => {
          // Get payer name - handle both old and new format
          const payerName =
            exp.paidBy?.name ||
            userMap[exp.paidBy?._id] ||
            userMap[exp.paidBy] ||
            "Someone";

          // Check if any pending participants
          const hasPending = exp.hasPendingParticipants ||
            exp.splitBetween?.some((s) => s.isPending);

          return (
            <li
              key={exp._id}
              className={`expense-item ${hasPending ? "has-pending" : ""}`}
            >
              <div className="expense-header">
                <strong>{exp.title}</strong>
                {hasPending && (
                  <span className="pending-indicator">⏳ Has pending</span>
                )}
              </div>

              <p className="expense-amount">Amount: ₹{exp.amount}</p>

              <p className="expense-payer">Paid by: {payerName}</p>

              {exp.category && exp.category !== "other" && (
                <span className="expense-category">{exp.category}</span>
              )}

              {/* Show split details */}
              {exp.splitBetween && exp.splitBetween.length > 0 && (
                <div className="expense-splits">
                  <small>Split between:</small>
                  <ul>
                    {exp.splitBetween.map((split, idx) => (
                      <li key={idx} className={split.isPending ? "pending" : ""}>
                        {split.name || userMap[split._id] || "Unknown"}
                        {split.isPending && <span className="pending-tag">Invited</span>}
                        : ₹{split.amount?.toFixed(2) || 0}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exp.notes && (
                <p className="expense-notes">📝 {exp.notes}</p>
              )}

              <small className="expense-date">
                {new Date(exp.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </small>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ExpenseHistory;
