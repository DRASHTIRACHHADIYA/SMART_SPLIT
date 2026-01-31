import { useState } from "react";
import api from "../api/api";

function CreateGroup({ onGroupCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await api.post("/groups", { name });
      setName("");
      onGroupCreated(); // 🔁 refresh groups in dashboard
    } catch (err) {
      console.error("Error creating group", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <h3>Create Group</h3>

      <form onSubmit={handleCreate} style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}

export default CreateGroup;
