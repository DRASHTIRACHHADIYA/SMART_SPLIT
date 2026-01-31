import { useState, useEffect } from "react";

/**
 * SplitSelector - Advanced expense splitting component
 * Supports equal, percentage, and custom amount splits
 */
function SplitSelector({
    participants,
    totalAmount,
    onSplitChange,
    initialMode = "equal"
}) {
    const [splitMode, setSplitMode] = useState(initialMode);
    const [splits, setSplits] = useState([]);

    // Initialize splits when participants or mode changes
    useEffect(() => {
        if (!participants || participants.length === 0) {
            setSplits([]);
            return;
        }

        if (!totalAmount || totalAmount <= 0) {
            // Still create splits but with 0 amounts
            const emptySplits = participants.map((p) => ({
                ...p,
                amount: 0,
                percentage: 0,
                isSelected: true,
            }));
            setSplits(emptySplits);
            return;
        }

        // Only reinitialize if participants changed or mode changed
        const newSplits = participants.map((p) => {
            // Try to preserve existing split data if participant exists
            const existing = splits.find(s => s.id === p.id);
            return {
                ...p,
                amount: existing?.amount || 0,
                percentage: existing?.percentage || 0,
                isSelected: existing?.isSelected !== undefined ? existing.isSelected : true,
            };
        });

        // Calculate based on mode
        distributeSplit(newSplits, splitMode, totalAmount);
        setSplits(newSplits);
    }, [participants, splitMode, totalAmount]);

    // Recalculate when selections change
    useEffect(() => {
        const selectedSplits = splits.filter(s => s.isSelected);
        onSplitChange({
            splitType: splitMode,
            splits: selectedSplits.map(s => ({
                participantId: s.id,
                participantType: s.type,
                amount: s.amount,
                percentage: s.percentage,
            })),
            isValid: validateSplit(selectedSplits, totalAmount),
        });
    }, [splits, splitMode, totalAmount, onSplitChange]);

    const distributeSplit = (splitList, mode, total) => {
        // Defensive: ensure total is a valid positive number
        const safeTotal = (typeof total === 'number' && !isNaN(total) && total > 0) ? total : 0;

        const selected = splitList.filter(s => s.isSelected);
        const count = selected.length || 1;

        if (mode === "equal") {
            const equalAmount = safeTotal > 0 ? safeTotal / count : 0;
            splitList.forEach(s => {
                if (s.isSelected) {
                    s.amount = Number(equalAmount.toFixed(2)) || 0;
                    s.percentage = Number((100 / count).toFixed(1)) || 0;
                } else {
                    s.amount = 0;
                    s.percentage = 0;
                }
            });
        } else if (mode === "percentage") {
            // Initialize with equal percentages only if not already set
            splitList.forEach(s => {
                if (s.isSelected) {
                    // Keep existing percentage if already set, otherwise initialize equally
                    if (!s.percentage || s.percentage === 0 || isNaN(s.percentage)) {
                        s.percentage = Number((100 / count).toFixed(1)) || 0;
                    }
                    const calcAmount = safeTotal > 0 ? ((s.percentage / 100) * safeTotal) : 0;
                    s.amount = Number(calcAmount.toFixed(2)) || 0;
                } else {
                    s.amount = 0;
                    s.percentage = 0;
                }
            });
        } else if (mode === "custom") {
            // Initialize with equal amounts only if not already set
            const equalAmount = safeTotal > 0 ? safeTotal / count : 0;
            splitList.forEach(s => {
                if (s.isSelected) {
                    // Keep existing amount if already set, otherwise initialize equally
                    if (!s.amount || s.amount === 0 || isNaN(s.amount)) {
                        s.amount = Number(equalAmount.toFixed(2)) || 0;
                    }
                    // Prevent division by zero
                    const calcPercentage = safeTotal > 0 ? ((s.amount / safeTotal) * 100) : 0;
                    s.percentage = Number(calcPercentage.toFixed(1)) || 0;
                } else {
                    s.amount = 0;
                    s.percentage = 0;
                }
            });
        }
    };

    const validateSplit = (selectedSplits, total) => {
        if (!selectedSplits.length) return false;
        // Defensive: ensure total is valid
        const safeTotal = (typeof total === 'number' && !isNaN(total) && total > 0) ? total : 0;
        if (safeTotal === 0) return false;

        const sum = selectedSplits.reduce((acc, s) => acc + (s.amount || 0), 0);
        return Math.abs(sum - safeTotal) < 0.01;
    };

    const toggleParticipant = (id) => {
        setSplits(prev => {
            const updated = prev.map(s =>
                s.id === id ? { ...s, isSelected: !s.isSelected } : s
            );
            distributeSplit(updated, splitMode, totalAmount);
            return updated;
        });
    };

    const handlePercentageChange = (id, value) => {
        setSplits(prev => {
            return prev.map(s => {
                if (s.id === id) {
                    const pct = Math.max(0, Math.min(100, Number(value) || 0));
                    // Defensive: ensure totalAmount is valid for calculation
                    const safeTotal = (typeof totalAmount === 'number' && !isNaN(totalAmount) && totalAmount > 0) ? totalAmount : 0;
                    const calcAmount = safeTotal > 0 ? ((pct / 100) * safeTotal) : 0;
                    return {
                        ...s,
                        percentage: pct,
                        amount: Number(calcAmount.toFixed(2)) || 0,
                    };
                }
                return s;
            });
        });
    };

    const handleAmountChange = (id, value) => {
        setSplits(prev => {
            return prev.map(s => {
                if (s.id === id) {
                    const amt = Math.max(0, Number(value) || 0);
                    // Defensive: ensure totalAmount is valid for percentage calculation
                    const safeTotal = (typeof totalAmount === 'number' && !isNaN(totalAmount) && totalAmount > 0) ? totalAmount : 0;
                    const calcPercentage = safeTotal > 0 ? ((amt / safeTotal) * 100) : 0;
                    return {
                        ...s,
                        amount: amt,
                        percentage: Number(calcPercentage.toFixed(1)) || 0,
                    };
                }
                return s;
            });
        });
    };

    const selectedSplits = splits.filter(s => s.isSelected);
    const totalSplit = selectedSplits.reduce((acc, s) => acc + (s.amount || 0), 0);
    const totalPercentage = selectedSplits.reduce((acc, s) => acc + (s.percentage || 0), 0);
    // Defensive: ensure totalAmount is valid for comparison
    const safeAmount = (typeof totalAmount === 'number' && !isNaN(totalAmount) && totalAmount > 0) ? totalAmount : 0;
    const isBalanced = safeAmount > 0 && Math.abs(totalSplit - safeAmount) < 0.01;

    return (
        <div className="split-selector">
            {/* Split Mode Tabs */}
            <div className="split-mode-tabs">
                <button
                    type="button"
                    className={`split-mode-tab ${splitMode === "equal" ? "active" : ""}`}
                    onClick={() => setSplitMode("equal")}
                >
                    ⚖️ Equal
                </button>
                <button
                    type="button"
                    className={`split-mode-tab ${splitMode === "percentage" ? "active" : ""}`}
                    onClick={() => setSplitMode("percentage")}
                >
                    📊 Percentage
                </button>
                <button
                    type="button"
                    className={`split-mode-tab ${splitMode === "custom" ? "active" : ""}`}
                    onClick={() => setSplitMode("custom")}
                >
                    ✏️ Custom
                </button>
            </div>

            {/* Participant List */}
            <div className="split-participants">
                {splits.map((split) => (
                    <div
                        key={split.id}
                        className={`split-participant ${split.isSelected ? "selected" : ""} ${split.isPending ? "pending" : ""}`}
                    >
                        <label className="participant-checkbox">
                            <input
                                type="checkbox"
                                checked={split.isSelected}
                                onChange={() => toggleParticipant(split.id)}
                            />
                            <span className="participant-name">
                                {split.name}
                                {split.isPending && <span className="pending-tag-small">Pending</span>}
                            </span>
                        </label>

                        {split.isSelected && (
                            <div className="split-input-group">
                                {splitMode === "equal" && (
                                    <span className="split-value">₹{split.amount.toFixed(2)}</span>
                                )}

                                {splitMode === "percentage" && (
                                    <div className="split-input-row">
                                        <input
                                            type="number"
                                            className="split-input percentage"
                                            value={split.percentage}
                                            onChange={(e) => handlePercentageChange(split.id, e.target.value)}
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                        <span className="split-unit">%</span>
                                        <span className="split-value-small">= ₹{split.amount.toFixed(2)}</span>
                                    </div>
                                )}

                                {splitMode === "custom" && (
                                    <div className="split-input-row">
                                        <span className="split-unit">₹</span>
                                        <input
                                            type="number"
                                            className="split-input amount"
                                            value={split.amount}
                                            onChange={(e) => handleAmountChange(split.id, e.target.value)}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className={`split-summary ${isBalanced ? "balanced" : "unbalanced"}`}>
                <div className="split-summary-row">
                    <span style={{ fontWeight: 500 }}>Total Split:</span>
                    <span className="split-total" style={{
                        color: isBalanced ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 600
                    }}>
                        ₹{totalSplit.toFixed(2)} / ₹{safeAmount.toFixed(2)}
                    </span>
                </div>
                {splitMode === "percentage" && (
                    <div className="split-summary-row">
                        <span style={{ fontWeight: 500 }}>Total Percentage:</span>
                        <span style={{
                            color: Math.abs(totalPercentage - 100) < 0.1 ? 'var(--success)' : 'var(--danger)',
                            fontWeight: 600
                        }}>
                            {totalPercentage.toFixed(1)}% / 100%
                        </span>
                    </div>
                )}
                {!isBalanced && (
                    <div className="split-warning" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'var(--danger-light)',
                        borderRadius: '6px',
                        marginTop: '8px'
                    }}>
                        <span style={{ fontSize: '16px' }}>⚠️</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--danger)' }}>
                            {totalSplit > safeAmount
                                ? `Over by ₹${(totalSplit - safeAmount).toFixed(2)}`
                                : `Short by ₹${(safeAmount - totalSplit).toFixed(2)}`}
                        </span>
                    </div>
                )}
                {isBalanced && (
                    <div className="split-success" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: 'var(--success-light)',
                        borderRadius: '6px',
                        marginTop: '8px'
                    }}>
                        <span style={{ fontSize: '16px' }}>✓</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--success)' }}>
                            Perfectly balanced
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SplitSelector;
