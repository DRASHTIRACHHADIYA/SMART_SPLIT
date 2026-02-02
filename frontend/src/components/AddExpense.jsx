import { useEffect, useState } from "react";
import api from "../api/api";

function AddExpense({ groupId, onExpenseAdded }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [members, setMembers] = useState([]);
  const [splitType, setSplitType] = useState("equal"); // equal | percentage | custom
  const [splits, setSplits] = useState({}); // userId -> value
  const [renderError, setRenderError] = useState(null);

  /* =========================
     FETCH GROUP MEMBERS
  ========================= */
  useEffect(() => {
    if (!groupId) return;

    const fetchMembers = async () => {
      try {
        const res = await api.get("/groups");
        const group = res.data.find((g) => g._id === groupId);

        if (group?.members) {
          setMembers(group.members);

          // initialize splits with empty strings
          const initial = {};
          group.members.forEach((m) => {
            initial[m._id] = "";
          });
          setSplits(initial);
        }
      } catch (err) {
        console.error("[AddExpense] Failed to fetch members", err);
      }
    };

    fetchMembers();
  }, [groupId]);

  /* =========================
     RESET SPLITS WHEN SPLIT TYPE CHANGES
  ========================= */
  useEffect(() => {
    // Only reset when we have members and split type changes
    if (members.length === 0) return;

    const resetSplits = {};
    members.forEach((m) => {
      resetSplits[m._id] = "";
    });
    setSplits(resetSplits);
  }, [splitType, members.length]);

  /* =========================
     HANDLE SPLIT INPUT CHANGE
  ========================= */
  const handleSplitChange = (userId, value) => {
    // Create new object to avoid mutation
    setSplits((prev) => {
      const newSplits = { ...prev };
      newSplits[userId] = value;
      return newSplits;
    });
  };

  /* =========================
     SAFE VALUE GETTER
  ========================= */
  const getSplitValue = (userId) => {
    const val = splits[userId];
    // Return empty string if undefined/null, otherwise return the value
    return val === undefined || val === null ? "" : val;
  };

  /* =========================
     CHECK IF SPLIT UI SHOULD RENDER
  ========================= */
  const canRenderSplitUI = () => {
    // Defensive check: only show split inputs when amount is valid and members loaded
    const parsedAmount = parseFloat(amount);
    const hasValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;
    const hasMembers = Array.isArray(members) && members.length > 0;
    return hasValidAmount && hasMembers;
  };

  /* =========================
     SUBMIT EXPENSE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!members.length || !amount) {
        console.error("[AddExpense] Submit blocked: no members or amount");
        return;
      }

      const totalAmount = Number(amount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        console.error("[AddExpense] Submit blocked: invalid amount", amount);
        alert("Please enter a valid amount");
        return;
      }

      let splitBetween = [];

      /* ---- EQUAL SPLIT ---- */
      if (splitType === "equal") {
        const perPerson = totalAmount / members.length;

        splitBetween = members.map((m) => ({
          user: m._id,
          amount: Number(perPerson.toFixed(2)),
        }));
      }

      /* ---- PERCENTAGE SPLIT ---- */
      if (splitType === "percentage") {
        let percentSum = 0;

        members.forEach((m) => {
          const val = Number(getSplitValue(m._id) || 0);
          percentSum += isNaN(val) ? 0 : val;
        });

        if (percentSum !== 100) {
          alert("Total percentage must be 100%");
          return;
        }

        splitBetween = members.map((m) => {
          const pct = Number(getSplitValue(m._id) || 0);
          return {
            user: m._id,
            amount: Number(((totalAmount * pct) / 100).toFixed(2)),
          };
        });
      }

      /* ---- CUSTOM SPLIT ---- */
      if (splitType === "custom") {
        let sum = 0;

        members.forEach((m) => {
          const val = Number(getSplitValue(m._id) || 0);
          sum += isNaN(val) ? 0 : val;
        });

        if (sum !== totalAmount) {
          alert("Custom amounts must equal total expense");
          return;
        }

        splitBetween = members.map((m) => ({
          user: m._id,
          amount: Number(getSplitValue(m._id) || 0),
        }));
      }

      await api.post("/expenses", {
        groupId,
        title,
        amount: totalAmount,
        splitBetween,
      });

      setTitle("");
      setAmount("");
      // Reset splits
      const resetSplits = {};
      members.forEach((m) => {
        resetSplits[m._id] = "";
      });
      setSplits(resetSplits);

      onExpenseAdded();
    } catch (err) {
      console.error("[AddExpense] Error adding expense", err);
    }
  };

  // Early return if no groupId
  if (!groupId) return null;

  // Error boundary for render
  try {
    return (
      <div className="add-expense-card">
        <h3>Add Expense</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Expense title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Total amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            required
          />

          {/* SPLIT TYPE */}
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
          >
            <option value="equal">Split equally</option>
            <option value="percentage">Split by percentage</option>
            <option value="custom">Split by custom amount</option>
          </select>

          {/* SPLIT INPUTS - Only render when amount > 0 and members loaded */}
          {splitType !== "equal" && canRenderSplitUI() && (
            <>
              {members.map((m) => (
                <div key={m._id} style={{ marginTop: "8px" }}>
                  <label style={{ fontSize: "13px" }}>
                    {m.name || "Unknown"}
                  </label>
                  <input
                    type="number"
                    placeholder={splitType === "percentage" ? "%" : "Amount"}
                    value={getSplitValue(m._id)}
                    onChange={(e) => handleSplitChange(m._id, e.target.value)}
                    min="0"
                    step="any"
                    required
                  />
                </div>
              ))}
            </>
          )}

          {/* Show hint when split type is not equal but conditions not met */}
          {splitType !== "equal" && !canRenderSplitUI() && (
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
              Enter a valid amount to configure split details
            </p>
          )}

          <button type="submit" style={{ marginTop: "12px" }}>
            Add Expense
          </button>
        </form>
      </div>
    );
  } catch (err) {
    console.error("[AddExpense] Render error:", err);
    return (
      <div className="add-expense-card">
        <h3>Add Expense</h3>
        <p style={{ color: "red" }}>Error loading expense form. Please refresh.</p>
      </div>
    );
  }
}

export default AddExpense;
