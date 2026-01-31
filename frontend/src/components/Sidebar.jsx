import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <h2 className="logo">SmartSplit</h2>

      <ul className="menu">
        <li className="active">Dashboard</li>
        <li>Groups</li>
        <li>Expenses</li>
      </ul>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
