import { useState } from "react";
import api from "../api/api";

/**
 * Add Member Component - Phone-based with pending support
 */
function AddMember({ groupId, onMemberAdded }) {
  const [inputMode, setInputMode] = useState("phone"); // phone | email
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleAddByPhone = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setMessage({ type: "error", text: "Enter a valid phone number" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const fullPhone = countryCode + phoneNumber.replace(/^0+/, "");

      const res = await api.post(`/groups/${groupId}/add-member`, {
        phoneNumber: fullPhone,
        displayName: displayName.trim() || "Unknown",
        countryCode: "IN",
      });

      if (res.data.success) {
        const memberType = res.data.memberType;
        const memberName = res.data.member.name || res.data.member.displayName;

        if (memberType === "active") {
          setMessage({
            type: "success",
            text: `✅ ${memberName} added to the group!`
          });
        } else {
          setMessage({
            type: "pending",
            text: `📱 Invitation sent to ${fullPhone}. They'll join when they register.`
          });
        }

        // Reset form
        setPhoneNumber("");
        setDisplayName("");
        onMemberAdded && onMemberAdded();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to add member"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddByEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: "error", text: "Enter a valid email" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.post(`/groups/${groupId}/add-member-by-email`, {
        email,
      });

      setMessage({ type: "success", text: res.data.message });
      setEmail("");
      onMemberAdded && onMemberAdded();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.msg || "Failed to add member"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!groupId) return null;

  return (
    <div className="add-member-card">
      <h3>Add Member</h3>

      {/* MODE TOGGLE */}
      <div className="member-mode-toggle">
        <button
          className={inputMode === "phone" ? "active" : ""}
          onClick={() => setInputMode("phone")}
          type="button"
        >
          📱 Phone
        </button>
        <button
          className={inputMode === "email" ? "active" : ""}
          onClick={() => setInputMode("email")}
          type="button"
        >
          ✉️ Email
        </button>
      </div>

      {/* PHONE INPUT */}
      {inputMode === "phone" && (
        <form onSubmit={handleAddByPhone}>
          <div className="phone-input-row">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="country-select-small"
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
            </select>
            <input
              type="tel"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              maxLength={10}
            />
          </div>

          <input
            type="text"
            placeholder="Display name (optional, e.g. 'Mom')"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Member"}
          </button>
        </form>
      )}

      {/* EMAIL INPUT */}
      {inputMode === "email" && (
        <form onSubmit={handleAddByEmail}>
          <input
            type="email"
            placeholder="Enter member email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Member"}
          </button>
        </form>
      )}

      {/* MESSAGE */}
      {message.text && (
        <p className={`add-member-msg ${message.type}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

export default AddMember;
