import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

/**
 * Groups Page - List all groups with create functionality
 */
function Groups() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Create group form
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupDescription, setNewGroupDescription] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const res = await api.get("/groups");
            const groupData = res.data.groups || res.data || [];
            setGroups(groupData);
        } catch (error) {
            console.error("Failed to fetch groups", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        setCreating(true);
        try {
            const res = await api.post("/groups", {
                name: newGroupName.trim(),
                description: newGroupDescription.trim(),
            });

            if (res.data.success || res.data.group) {
                const newGroup = res.data.group || res.data;
                setShowCreateModal(false);
                setNewGroupName("");
                setNewGroupDescription("");
                // Navigate to new group
                navigate(`/groups/${newGroup._id}`);
            }
        } catch (error) {
            console.error("Failed to create group", error);
        } finally {
            setCreating(false);
        }
    };

    const filteredGroups = groups.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-state">Loading groups...</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* PAGE HEADER */}
            <header className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Groups</h1>
                    <p className="page-subtitle">Manage your expense groups</p>
                </div>
                <button
                    className="primary-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    + New Group
                </button>
            </header>

            {/* SEARCH */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* GROUPS GRID */}
            {filteredGroups.length === 0 ? (
                <div className="empty-state">
                    {searchQuery ? (
                        <p>No groups match "{searchQuery}"</p>
                    ) : (
                        <>
                            <div className="empty-icon">👥</div>
                            <h3>No groups yet</h3>
                            <p>Create a group to start tracking shared expenses</p>
                            <button
                                className="primary-btn"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Create Your First Group
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="groups-grid">
                    {filteredGroups.map((group) => {
                        const memberCount = group.members?.length || 0;
                        const pendingCount =
                            group.pendingMembers?.filter((p) => p.status === "invited")
                                .length || 0;

                        return (
                            <Link
                                key={group._id}
                                to={`/groups/${group._id}`}
                                className="group-card-new"
                            >
                                <div className="group-card-header">
                                    <div className="group-avatar">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="group-info">
                                        <h3 className="group-name">{group.name}</h3>
                                        {group.description && (
                                            <p className="group-description">{group.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="group-card-footer">
                                    <span className="member-count">
                                        👥 {memberCount} member{memberCount !== 1 ? "s" : ""}
                                    </span>
                                    {pendingCount > 0 && (
                                        <span className="pending-badge">
                                            ⏳ {pendingCount} pending
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* CREATE GROUP MODAL */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Group</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateGroup} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="groupName">Group Name</label>
                                <input
                                    id="groupName"
                                    type="text"
                                    placeholder="e.g., Trip to Goa, Roommates"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="groupDesc">Description (optional)</label>
                                <textarea
                                    id="groupDesc"
                                    placeholder="What's this group for?"
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={creating || !newGroupName.trim()}
                                >
                                    {creating ? "Creating..." : "Create Group"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Groups;
