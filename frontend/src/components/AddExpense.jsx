import { useEffect, useState } from "react";
import api from "../api/api";

function AddExpense({ groupId, onExpenseAdded }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [members, setMembers] = useState([]);
  const [splitType, setSplitType] = useState("equal"); // equal | percentage | custom
  const [splits, setSplits] = useState({}); // userId -> value

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

          // initialize splits
          const initial = {};
          group.members.forEach((m) => {
            initial[m._id] = "";
          });
          setSplits(initial);
        }
      } catch (err) {
        console.error("Failed to fetch members", err);
      }
    };

    fetchMembers();
  }, [groupId]);

  /* =========================
     HANDLE SPLIT INPUT CHANGE
  ========================= */
  const handleSplitChange = (userId, value) => {
    setSplits((prev) => ({
      ...prev,
      [userId]: value,
    }));
  };

  /* =========================
     SUBMIT EXPENSE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!members.length || !amount) return;

    const totalAmount = Number(amount);
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
        percentSum += Number(splits[m._id] || 0);
      });

      if (percentSum !== 100) {
        alert("Total percentage must be 100%");
        return;
      }

      splitBetween = members.map((m) => ({
        user: m._id,
        amount: Number(
          ((totalAmount * Number(splits[m._id])) / 100).toFixed(2)
        ),
      }));
    }

    /* ---- CUSTOM SPLIT ---- */
    if (splitType === "custom") {
      let sum = 0;

      members.forEach((m) => {
        sum += Number(splits[m._id] || 0);
      });

      if (sum !== totalAmount) {
        alert("Custom amounts must equal total expense");
        return;
      }

      splitBetween = members.map((m) => ({
        user: m._id,
        amount: Number(splits[m._id]),
      }));
    }

    try {
      await api.post("/expenses", {
        groupId,
        title,
        amount: totalAmount,
        splitBetween,
      });

      setTitle("");
      setAmount("");
      onExpenseAdded();
    } catch (err) {
      console.error("Error adding expense", err);
    }
  };

  if (!groupId) return null;

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

        {/* SPLIT INPUTS */}
        {splitType !== "equal" &&
          members.map((m) => (
            <div key={m._id} style={{ marginTop: "8px" }}>
              <label style={{ fontSize: "13px" }}>
                {m.name}
              </label>
              <input
                type="number"
                placeholder={
                  splitType === "percentage" ? "%" : "Amount"
                }
                value={splits[m._id]}
                onChange={(e) =>
                  handleSplitChange(m._id, e.target.value)
                }
                required
              />
            </div>
          ))}

        <button type="submit" style={{ marginTop: "12px" }}>
          Add Expense
        </button>
      </form>
    </div>
  );
}

export default AddExpense;
