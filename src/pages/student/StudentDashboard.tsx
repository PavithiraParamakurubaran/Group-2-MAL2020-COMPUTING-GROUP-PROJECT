import { useState } from "react";
import StudentMenu from "../../components/menus/StudentMenu";
import StudentStage1 from "./StudentStage1";
import StudentStage2 from "./StudentStage2";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [status, setStatus] = useState<"unemployed" | "employed">(
    user.status || "unemployed"
  );

  const username = user.name || "Student";

  return (
    <div className="dashboard-layout">
      <StudentMenu status={status} username={username} />

      <div className="dashboard-contents">
       {status === "unemployed" ? (
  <StudentStage1
    username={username}
    onEmployed={() => {
      setStatus("employed");

      // ✅ update localStorage so other pages use employed menu
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const updated = { ...u, status: "employed" };
      localStorage.setItem("user", JSON.stringify(updated));
    }}
  />
) : (
  <StudentStage2 />
)}
      </div>
    </div>
  );
}