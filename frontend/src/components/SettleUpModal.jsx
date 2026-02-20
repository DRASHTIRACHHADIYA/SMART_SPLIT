import { useState } from "react";
import api from "../api/api";

/**
 * SettleUpModal — GPay-style full-screen payment modal
 * Props:
 *   settlement: { from: { participantId, name }, to: { participantId, name }, amount }
 *   groupId: string
 *   onClose: () => void
 *   onSuccess: () => void
 */
function SettleUpModal({ settlement, groupId, onClose, onSuccess }) {
    const [amount, setAmount] = useState(settlement.amount.toString());
    const [method, setMethod] = useState("upi");
    const [note, setNote] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    const parsedAmount = parseFloat(amount) || 0;
    const maxAmount = settlement.amount;
    const isValid = parsedAmount > 0 && parsedAmount <= maxAmount + 0.01;

    const handleSend = async () => {
        if (!isValid || sending) return;
        setError("");
        setSending(true);

        try {
            const res = await api.post("/settlements", {
                groupId,
                toUserId: settlement.to.participantId,
                amount: parsedAmount,
                method,
                note: note.trim(),
            });

            if (res.data.success) {
                setSuccess(res.data);
                // Auto-redirect after 2.5 seconds
                setTimeout(() => {
                    onSuccess();
                }, 2500);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to record settlement");
        } finally {
            setSending(false);
        }
    };

    // Success screen
    if (success) {
        return (
            <div className="settle-up-overlay" onClick={onClose}>
                <div className="settle-up-modal success-state" onClick={(e) => e.stopPropagation()}>
                    <div className="settle-up-success">
                        <div className="success-checkmark">
                            <svg viewBox="0 0 52 52" className="checkmark-svg">
                                <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                            </svg>
                        </div>
                        <h2 className="success-title">Payment Recorded!</h2>
                        <p className="success-amount">₹{parsedAmount.toFixed(2)}</p>
                        <p className="success-detail">
                            {settlement.from.name} → {settlement.to.name}
                        </p>
                        {success.creditScore && success.creditScore.change !== 0 && (
                            <div className="success-credit">
                                <span>Credit Score: </span>
                                <span className={success.creditScore.change > 0 ? "credit-positive" : "credit-negative"}>
                                    {success.creditScore.change > 0 ? "+" : ""}
                                    {success.creditScore.change} pts
                                </span>
                            </div>
                        )}
                        <p className="success-redirect-text">Returning to group...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Payment form
    return (
        <div className="settle-up-overlay" onClick={onClose}>
            <div className="settle-up-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="settle-up-header">
                    <button className="settle-up-close" onClick={onClose}>
                        ✕
                    </button>
                    <h2>Settle Up</h2>
                    <div style={{ width: 32 }} />
                </div>

                {/* User avatars */}
                <div className="settle-up-users">
                    <div className="settle-up-user">
                        <div className="settle-up-avatar paying">
                            {settlement.from.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="settle-up-user-label">Paying</span>
                        <span className="settle-up-user-name">{settlement.from.name}</span>
                    </div>

                    <div className="settle-up-arrow-container">
                        <div className="settle-up-flow-arrow">→</div>
                    </div>

                    <div className="settle-up-user">
                        <div className="settle-up-avatar receiving">
                            {settlement.to.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="settle-up-user-label">To</span>
                        <span className="settle-up-user-name">{settlement.to.name}</span>
                    </div>
                </div>

                {/* Amount input */}
                <div className="settle-up-amount-section">
                    <span className="settle-up-currency">₹</span>
                    <input
                        type="number"
                        className="settle-up-amount-input"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            setError("");
                        }}
                        min="0.01"
                        max={maxAmount}
                        step="0.01"
                        autoFocus
                    />
                    <p className="settle-up-due-info">
                        Due: ₹{maxAmount.toFixed(2)}
                        {parsedAmount > 0 && parsedAmount < maxAmount - 0.01 && (
                            <span className="partial-tag"> · Partial Payment</span>
                        )}
                    </p>
                </div>

                {/* Method selector */}
                <div className="settle-up-field">
                    <label>Payment Method</label>
                    <div className="settle-up-method-grid">
                        {[
                            { value: "cash", label: "💵 Cash" },
                            { value: "upi", label: "📱 UPI" },
                            { value: "bank", label: "🏦 Bank" },
                            { value: "other", label: "📋 Other" },
                        ].map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                className={`method-chip ${method === m.value ? "active" : ""}`}
                                onClick={() => setMethod(m.value)}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Note */}
                <div className="settle-up-field">
                    <label>Note (optional)</label>
                    <input
                        type="text"
                        className="settle-up-note-input"
                        placeholder="Add a note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={300}
                    />
                </div>

                {/* Error */}
                {error && <p className="settle-up-error">{error}</p>}

                {/* Send button */}
                <button
                    className="settle-up-send-btn"
                    onClick={handleSend}
                    disabled={!isValid || sending}
                >
                    {sending ? (
                        <span className="settle-up-spinner" />
                    ) : (
                        <>Send ₹{parsedAmount > 0 ? parsedAmount.toFixed(2) : "0.00"}</>
                    )}
                </button>
            </div>
        </div>
    );
}

export default SettleUpModal;
