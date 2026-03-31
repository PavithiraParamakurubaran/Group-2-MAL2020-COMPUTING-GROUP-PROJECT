import "./AdminMenu.css";
import { useNavigate } from "react-router-dom";

import dashboardIcon from "../../assets/dashboard.png";
import studentIcon from "../../assets/profile.png";
import employerIcon from "../../assets/profile.png";
import reminderIcon from "../../assets/document.png";
import reportIcon from "../../assets/studentreport.png";
import addAdminIcon from "../../assets/profile.png";
import logoutIcon from "../../assets/logout.png";
import docIcon from "../../assets/resume.png";
import logo from "../../assets/logo.png";

export default function AdminMenu({
  adminName,
}: {
  adminName: string;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="admin-sidebar">
      {/* Logo & Title */}
      <div className="sidebar-header">
        <img src={logo} className="sidebar-logo" />
        <h3>Industrial Training System</h3>
      </div>

      {/* Welcome */}
      <div className="sidebar-welcome">
        <p>
          Welcome, <strong>{adminName}</strong>
        </p>
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">
        <li onClick={() => navigate("/admin/dashboard")}>
          <img src={dashboardIcon} /> Dashboard
        </li>

        <li onClick={() => navigate("/admin/profile")}>
          <img src={studentIcon} /> Profile
        </li>

        <li onClick={() => navigate("/admin/students")}>
          <img src={studentIcon} /> Student Management
        </li>

        <li onClick={() => navigate("/admin/employers")}>
          <img src={employerIcon} /> Employer Management
        </li>

        <li onClick={() => navigate("/admin/reminders")}>
          <img src={reminderIcon} /> Post Reminder
        </li>

        <li onClick={() => navigate("/admin/student-documents")}>
          <img src={docIcon} /> Student Documents
        </li>

        <li onClick={() => navigate("/admin/reports")}>
          <img src={reportIcon} /> Analytical Report
        </li>

        <li onClick={() => navigate("/admin/newadmin")}>
          <img src={addAdminIcon} /> Add New Admin
        </li>
      </ul>

      {/* Logout */}
      <div className="sidebar-logout" onClick={handleLogout}>
        <img src={logoutIcon} />
        Logout
      </div>
    </div>
  );
}
