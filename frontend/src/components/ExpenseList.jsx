import { useEffect, useState } from "react";
import api from "../api/api";

/**
 * Expense List with Active vs Pending Balance Support
 */
function ExpenseList({ groupId, userMap, onBalancesCalculated }) {
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const fetchBalances = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/expenses/balance/${groupId}`);
        const data = res.data;

        setBalanceData(data);

        // Notify Dashboard with balance data for totals calculation
        if (typeof onBalancesCalculated === "function") {
          // Convert new format to old format for backward compatibility
          const legacyFormat = {};
          if (data.balances?.active) {
            data.balances.active.forEach((b) => {
              legacyFormat[b.participantId] = b.balance;
            });
          }
          if (data.balances?.pending) {
            data.balances.pending.forEach((b) => {
              legacyFormat[b.participantId] = b.balance;
            });
          }
          onBalancesCalculated(legacyFormat);
        }
      } catch (error) {
        console.error("Error fetching balances", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [groupId, onBalancesCalculated]);

  if (!groupId) return <p>Select a group to view expenses.</p>;
  if (loading) return <p>Loading expenses...</p>;
  if (!balanceData) return <p>No expenses found for this group.</p>;

  const activeBalances = balanceData.balances?.active || [];
  const pendingBalances = balanceData.balances?.pending || [];

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Group Balances</h3>

      {/* ACTIVE BALANCES */}
      {activeBalances.length > 0 && (
        <ul className="balance-list">
          {activeBalances.map((b) => (
            <li key={b.participantId} className="balance-item">
              <span className="balance-name">
                {b.name || userMap[b.participantId] || "Unknown"}
              </span>

              {b.balance > 0 ? (
                <span className="balance-amount positive">
                  Gets ₹{b.balance.toFixed(2)}
                </span>
              ) : b.balance < 0 ? (
                <span className="balance-amount negative">
                  Owes ₹{Math.abs(b.balance).toFixed(2)}
                </span>
              ) : (
                <span className="balance-amount settled">Settled ✓</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* PENDING BALANCES */}
      {pendingBalances.length > 0 && (
        <>
          <h4 className="pending-header">
            ⏳ Pending Members
            <span className="pending-note">
              (Will be confirmed when they register)
            </span>
          </h4>

          <ul className="balance-list pending">
            {pendingBalances.map((b) => (
              <li key={b.participantId} className="balance-item pending">
                <span className="balance-name">
                  {b.name}
                  <span className="pending-tag">Invited</span>
                </span>

                {b.balance > 0 ? (
                  <span className="balance-amount positive">
                    Gets ₹{b.balance.toFixed(2)}
                  </span>
                ) : b.balance < 0 ? (
                  <span className="balance-amount negative">
                    Owes ₹{Math.abs(b.balance).toFixed(2)}
                  </span>
                ) : (
                  <span className="balance-amount settled">Settled</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* SUMMARY */}
      {balanceData.summary && (
        <div className="balance-summary">
          <p>
            Total Expenses: <strong>₹{balanceData.summary.totalExpenses?.toFixed(2) || 0}</strong>
          </p>
          {balanceData.summary.pendingAmount > 0 && (
            <p className="pending-warning">
              ⚠️ ₹{balanceData.summary.pendingAmount.toFixed(2)} pending confirmation
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ExpenseList;
