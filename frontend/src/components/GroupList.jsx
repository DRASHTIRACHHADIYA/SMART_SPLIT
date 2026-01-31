import { useEffect, useState } from "react";
import api from "../api/api";

/**
 * Group List with Pending Member Support
 */
function GroupList({ onSelectGroup, selectedGroupId, refreshTrigger }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/groups");
        // Handle both old and new response formats
        const groupData = res.data.groups || res.data;
        setGroups(groupData);
      } catch (error) {
        console.error("Error fetching groups", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [refreshTrigger]);

  if (loading) return <p>Loading groups...</p>;
  if (groups.length === 0) return <p>No groups found.</p>;

  return (
    <div className="group-grid">
      {groups.map((group) => {
        const activeCount = group.members?.length || 0;
        const pendingCount = group.pendingMembers?.filter(
          (pm) => pm.status === "invited"
        ).length || 0;

        return (
          <div
            key={group._id}
            className={`group-card ${selectedGroupId === group._id ? "selected" : ""}`}
            onClick={() => onSelectGroup(group._id)}
          >
            <h3>{group.name}</h3>

            <div className="group-stats">
              <span className="member-count">
                👥 {activeCount} member{activeCount !== 1 ? "s" : ""}
              </span>

              {pendingCount > 0 && (
                <span className="pending-badge">
                  ⏳ {pendingCount} pending
                </span>
              )}
            </div>

            {group.description && (
              <p className="group-desc">{group.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default GroupList;
