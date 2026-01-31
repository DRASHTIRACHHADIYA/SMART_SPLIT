import { useEffect, useState } from "react";
import api from "../api/api";

/**
 * Settlement List with Ready vs Pending Separation
 */
function SettlementList({ groupId, userMap }) {
  const [settlementData, setSettlementData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId) return;

    const fetchSettlements = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/expenses/settlement/${groupId}`);
        setSettlementData(res.data);
      } catch (error) {
        console.error("Error fetching settlements", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettlements();
  }, [groupId]);

  if (!groupId) return null;
  if (loading) return <p>Calculating settlements...</p>;

  // Handle both old array format and new object format
  const readySettlements = settlementData?.settlements?.ready ||
    (Array.isArray(settlementData) ? settlementData : []);
  const pendingSettlements = settlementData?.settlements?.pending || [];

  const hasNoSettlements =
    readySettlements.length === 0 && pendingSettlements.length === 0;

  if (hasNoSettlements) {
    return <p>No settlements needed. Everyone is settled 👍</p>;
  }

  return (
    <div style={{ marginTop: "32px" }}>
      <h3>Settlement Summary</h3>

      {/* READY TO SETTLE */}
      {readySettlements.length > 0 && (
        <>
          <h4 className="settlement-header ready">
            ✅ Ready to Settle
          </h4>
          <ul className="settlement-list">
            {readySettlements.map((s, index) => {
              // Handle both old and new formats
              const fromName = s.from?.name || userMap[s.from] || "Unknown";
              const toName = s.to?.name || userMap[s.to] || "Unknown";

              return (
                <li key={index} className="settlement-item ready">
                  <span className="settlement-from">{fromName}</span>
                  <span className="settlement-arrow">→ pays ₹{s.amount} to →</span>
                  <span className="settlement-to">{toName}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* PENDING (can't settle yet) */}
      {pendingSettlements.length > 0 && (
        <>
          <h4 className="settlement-header pending">
            ⏳ Pending Registrations
            <span className="pending-note">
              (Can't settle until members register)
            </span>
          </h4>
          <ul className="settlement-list pending">
            {pendingSettlements.map((s, index) => (
              <li key={index} className="settlement-item pending">
                <span className="settlement-name">
                  {s.name}
                  <span className="pending-tag">Invited</span>
                </span>
                <span className="settlement-amount">
                  {s.direction === "to_pay"
                    ? `Owes ₹${s.amount}`
                    : `Gets ₹${s.amount}`}
                </span>
                <small className="settlement-reason">{s.reason}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default SettlementList;
