import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import GroupList from "../components/GroupList";
import ExpenseList from "../components/ExpenseList";
import AddExpense from "../components/AddExpense";
import SettlementList from "../components/SettlementList";
import CreateGroup from "../components/CreateGroup";
import ExpenseHistory from "../components/ExpenseHistory";
import AddMember from "../components/AddMember";
import api from "../api/api";

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [userMap, setUserMap] = useState({});
  const [youOwe, setYouOwe] = useState(0);
  const [youAreOwed, setYouAreOwed] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  /* 
     FETCH GROUPS + USER MAP
   */
  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);

      const map = {};
      res.data.forEach((group) => {
        group.members?.forEach((m) => {
          if (m?._id && m?.name) {
            map[m._id.toString()] = m.name;
          }
        });
      });

      setUserMap(map);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  /* =========================
     CALCULATE TOTALS
     ========================= */
  const calculateTotals = useCallback((balances) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentUserId = payload.id;

    // 1️⃣ TOTAL EXPENSES (avoid double count + round)
    let total = 0;
    Object.values(balances).forEach((amt) => {
      total += Math.abs(amt);
    });

    setTotalExpenses(Number((total / 2).toFixed(2)));

    // 2️⃣ MY BALANCE
    const myBalance = balances[currentUserId] || 0;

    // 3️⃣ YOU OWE / YOU ARE OWED (rounded)
    if (myBalance > 0) {
      setYouAreOwed(Number(myBalance.toFixed(2)));
      setYouOwe(0);
    } else if (myBalance < 0) {
      setYouOwe(Number(Math.abs(myBalance).toFixed(2)));
      setYouAreOwed(0);
    } else {
      setYouOwe(0);
      setYouAreOwed(0);
    }
  }, []);



  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="dashboard-main">
        <h1>Dashboard</h1>

        {/* SUMMARY CARDS */}
        <div className="card-grid">
          <div className="dash-card">
            <h3>Total Groups</h3>
            <p>{groups.length}</p>
          </div>

          <div className="dash-card">
            <h3>Total Expenses</h3>
            <p>₹{totalExpenses}</p>
          </div>

          <div className="dash-card">
            <h3>You Owe</h3>
            <p style={{ color: "red", fontWeight: 600 }}>₹{youOwe}</p>
          </div>

          <div className="dash-card">
            <h3>You Are Owed</h3>
            <p style={{ color: "green", fontWeight: 600 }}>
              ₹{youAreOwed}
            </p>
          </div>
        </div>

        {/* GROUP SECTION */}
        <h2 style={{ marginTop: "32px" }}>Your Groups</h2>

        {/* CREATE GROUP */}
        <CreateGroup onGroupCreated={fetchGroups} />

        {/* GROUP LIST */}
        <GroupList
          onSelectGroup={setSelectedGroupId}
          selectedGroupId={selectedGroupId}
        />

        {/* ADD MEMBER (IMPORTANT STEP) */}
        <AddMember
          groupId={selectedGroupId}
          onMemberAdded={fetchGroups}
        />


        {/* ADD EXPENSE */}
        <AddExpense
          groupId={selectedGroupId}
          onExpenseAdded={() => { }}
        />

        {/* EXPENSE HISTORY */}
        <ExpenseHistory
          groupId={selectedGroupId}
          userMap={userMap}
        />

        {/* BALANCES */}
        <ExpenseList
          groupId={selectedGroupId}
          userMap={userMap}
          onBalancesCalculated={calculateTotals}
        />

        {/* SETTLEMENT */}
        <SettlementList
          groupId={selectedGroupId}
          userMap={userMap}
        />
      </div>
    </div>
  );
}

export default Dashboard;
