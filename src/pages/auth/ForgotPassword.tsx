import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Login.css";
import logo from "../../assets/logo.png";
import background from "../../assets/backgroundimg.png";
import { FaEnvelope } from "react-icons/fa";

export default function ForgotPassword() {
  const nav = useNavigate();
  const { role } = useParams<{ role: string }>();

  // Only allow valid roles
  const validRoles = ["admin", "student", "employer"];
  if (!role || !validRoles.includes(role)) {
    return (
      <div
        className="login-page"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="overlay">
          <div className="login-container">
            <h3>Invalid role!</h3>
            <button className="login-btn" onClick={() => nav("/")}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentRole = role; // guaranteed to be valid
  const capitalizedRole = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetEmail = async () => {
    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      setMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
  const res = await fetch("http://localhost:3001/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: currentRole, email }),
  });

  const data = await res.json(); // parse JSON first

  if (res.ok && data.success) {
    setMessage("Demo reset email sent! Check your inbox.");
    setError("");
  } else {
    setError(data.message || "Error sending email.");
    setMessage("");
  }
} catch (err: any) {
  console.error("ForgotPassword Error:", err);
  setError(err.message || "Network error. Please check your server and try again.");
  setMessage("");
} finally {
  setLoading(false);
}

  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="overlay">
        <div className="login-container">
          <img src={logo} className="logo" />
          <div className="portal-title">{capitalizedRole} Portal</div>

          <h3>Forgot Password</h3>

          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder={`${capitalizedRole} Email`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="login-btn" onClick={sendResetEmail} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Email"}
          </button>

          <div className="forgot" onClick={() => nav(`/${currentRole}/login`)}>
            Back to Login
          </div>

          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
