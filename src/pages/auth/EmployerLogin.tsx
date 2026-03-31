import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../assets/logo.png";
import background from "../../assets/backgroundimg.png";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function EmployerLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Auto-redirect if already logged in and role is employer
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const role = JSON.parse(user).role;
      if (role === "employer") {
        nav("/employer/dashboard");
      }
      // else do nothing, stay on this page
    }
  }, [nav]);

  const login = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "employer", email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Login fetch error:", text);
        setError(`Server error: ${text}`);
        return;
      }

      const data = await res.json();
      console.log("Login response data:", data);

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        // Redirect only to employer dashboard
        nav("/employer/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || "Network error");
      else setError("An unknown error occurred");
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${background})` }}>
      <div className="overlay">
        <div className="login-container">
          <img src={logo} className="logo" />
          <div className="portal-title">Employer Portal</div>

          <h3>Login</h3>

          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder="Employer Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-btn" onClick={login}>
            Login
          </button>

          <div className="forgot" onClick={() => nav("/forgot-password/employer")}>
            Forgot Password?
          </div>

          {error && <div className="error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
