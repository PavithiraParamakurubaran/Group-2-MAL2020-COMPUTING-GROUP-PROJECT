import "./EmployerMenu.css";
import { useNavigate } from "react-router-dom";

import dashboardIcon from "../../assets/dashboard.png";
import profileIcon from "../../assets/companyprofile.png";
import postJobIcon from "../../assets/postjobs.png";
import jobListIcon from "../../assets/joblisting.png";
import applicationIcon from "../../assets/viewapplications.png";
import reportIcon from "../../assets/employmentreport.png";
import interviewIcon from "../../assets/interview.png";
import logoutIcon from "../../assets/logout.png";
import logo from "../../assets/logo.png";


export default function EmployerMenu({
  companyName,
}: {
  companyName: string;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="employer-sidebar">
      {/* Logo & Title */}
      <div className="sidebar-header">
        <img src={logo} className="sidebar-logo" />
        <h3>Industrial Training System</h3>
      </div>

      {/* Welcome */}
      <div className="sidebar-welcome">
        <p>
          Welcome, <strong>{companyName}</strong>
        </p>
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">
        <li onClick={() => navigate("/employer/dashboard")}>
          <img src={dashboardIcon} /> Dashboard
        </li>

        <li onClick={() => navigate("/employer/profile")}>
          <img src={profileIcon} /> Company Profile
        </li>

        <li onClick={() => navigate("/employer/post-job")}>
          <img src={postJobIcon} /> Post Jobs
        </li>

        <li onClick={() => navigate("/employer/job-list")}>
          <img src={jobListIcon} /> Job Listing
        </li>

        <li onClick={() => navigate("/employer/applications")}>
          <img src={applicationIcon} /> View Applications
        </li>

        <li onClick={() => navigate("/employer/employment-report")}>
          <img src={reportIcon} /> Employment Report
        </li>

        <li onClick={() => navigate("/employer/interview-schedule")}>
          <img src={interviewIcon} /> Interview Schedule
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
