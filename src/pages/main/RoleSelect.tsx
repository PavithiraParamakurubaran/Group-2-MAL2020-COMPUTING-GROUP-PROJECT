import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelect.css";
import logo from "../../assets/logo.png";
import background from "../../assets/backgroundimg.png";

const RoleSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="role-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="overlay">
        <div className="content">
          <img src={logo} alt="College Logo" className="logo" />

          <h1 className="title">
            Welcome to Industrial Training System
          </h1>

          <div className="button-group">
            <button onClick={() => navigate("/admin/login")}>
              Admin Portal
            </button>
            <button onClick={() => navigate("/student/login")}>
              Student Portal
            </button>
            <button onClick={() => navigate("/employer/login")}>
              Employer Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
