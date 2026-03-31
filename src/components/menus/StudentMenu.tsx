import "./StudentMenu.css";
import { useNavigate } from "react-router-dom";

import dashboardIcon from "../../assets/dashboard.png";
import profileIcon from "../../assets/profile.png";
import documentIcon from "../../assets/document.png";
import resumeIcon from "../../assets/resume.png";
import jobsIcon from "../../assets/jobs.png";
import appliedIcon from "../../assets/applied.png";
import interviewIcon from "../../assets/interview.png";
import reportIcon from "../../assets/studentreport.png";       // add this icon
import attendanceIcon from "../../assets/attendance.png"; 
import weeklyreportIcon from "../../assets/employmentreport.png";// add this icon
import logoutIcon from "../../assets/logout.png";
import logo from "../../assets/logo.png";

export default function StudentMenu({
  status,
  username,
}: {
  status: "unemployed" | "employed";
  username: string;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="student-sidebar">
      {/* Logo & Title */}
      <div className="sidebar-header">
        <img src={logo} className="sidebar-logo" />
        <h3>Industrial Training System</h3>
      </div>

      {/* Welcome */}
      <div className="sidebar-welcome">
        <p>
          Welcome, <strong>{username}</strong>
        </p>
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">
        {/* COMMON */}
        <li onClick={() => navigate("/student/dashboard")}>
  <img src={dashboardIcon} /> Dashboard
</li>

<li onClick={() => navigate("/profile")}>
  <img src={profileIcon} /> Profile
</li>


        {/* UNEMPLOYED MENU */}
        {status === "unemployed" && (
          <>
            <li onClick={() => navigate("/documents")}><img src={documentIcon} /> Documents</li>
            <li onClick={() => navigate("/generate-resume")}><img src={resumeIcon} /> Generate Resume</li>
            <li onClick={() => navigate("/jobs")}><img src={jobsIcon} /> View Jobs</li>
            <li onClick={() => navigate("/applied-jobs")}><img src={appliedIcon} /> Applied Jobs</li>
            <li onClick={() => navigate("/interview-schedule")}><img src={interviewIcon} /> Interview Schedule</li>
          </>
        )}

        {/* EMPLOYED MENU */}
        {status === "employed" && (
          <>
            <li onClick={() => navigate("/daily-report")}><img src={reportIcon} /> Daily Report</li>
            <li onClick={() => navigate("/weekly-report")}><img src={weeklyreportIcon} /> Weekly Report</li>
            <li onClick={() => navigate("/attendance")}><img src={attendanceIcon} /> Attendance</li>
            <li onClick={() => navigate("/documents")}><img src={documentIcon} /> Documents</li>
          </>
        )}
      </ul>

      {/* Logout */}
      <div className="sidebar-logout" onClick={handleLogout}>
        <img src={logoutIcon} />
        Logout
      </div>
    </div>
  );
}
