import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import AdminMenu from "../../components/menus/AdminMenu";
import "./AdminDashboard.css";

const API_BASE = "http://localhost:3001";

type DashboardStats = {
  totalStudents: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;

  startedResume: number;
  assessmentAvgProgress: number;

  serverTime?: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = user.name || "Admin";

  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    startedResume: 0,
    assessmentAvgProgress: 0,
  });

  const [sseStatus, setSseStatus] = useState<"connecting" | "live" | "offline">(
    "connecting"
  );

  // Quick reminder form
  const [remTitle, setRemTitle] = useState("");
  const [remDate, setRemDate] = useState("");
  const [remMsg, setRemMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOnce = async () => {
    const { data } = await axios.get(`${API_BASE}/api/admin/dashboard/stats`);
    setStats(data);
  };

  useEffect(() => {
    fetchOnce().catch(() => {});

    const es = new EventSource(`${API_BASE}/api/admin/dashboard/stream`);
    setSseStatus("connecting");

    const onStats = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        setStats(payload);
        setSseStatus("live");
      } catch {
        // ignore
      }
    };

    const onErr = () => {
      setSseStatus("offline");
      es.close();

      // fallback polling
      const t = setInterval(() => {
        fetchOnce().catch(() => {});
      }, 5000);

      return () => clearInterval(t);
    };

    es.addEventListener("stats", onStats);
    es.onerror = onErr;

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const livePill = useMemo(() => {
    if (sseStatus === "live") return { text: "LIVE", cls: "pill pill-live" };
    if (sseStatus === "connecting")
      return { text: "CONNECTING", cls: "pill pill-warn" };
    return { text: "OFFLINE", cls: "pill pill-off" };
  }, [sseStatus]);

  const submitReminder = async () => {
    if (!remTitle.trim() || !remDate) {
      alert("Please fill Title and Date.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/admin/reminders`, {
        title: remTitle.trim(),
        message: remMsg.trim() || "Reminder from Admin",
        deadline: `${remDate} 23:59:00`,
      });

      setRemTitle("");
      setRemDate("");
      setRemMsg("");
      alert("Reminder created!");
    } catch (err) {
      console.error(err);
      alert("Failed to create reminder.");
    } finally {
      setSubmitting(false);
    }
  };

  const progressWidth = Math.min(100, Math.max(0, stats.assessmentAvgProgress));

  return (
    <div className="admin-shell">
      <AdminMenu adminName={adminName} />

      <div className="admin-main">
        {/* Header / Hero */}
        <div className="hero">
          <div>
            <div className="hero-top">
              <div>
                <div className="hero-kicker">Admin Dashboard</div>
                <h2 className="hero-title">
                  Welcome back, <span>{adminName}</span>
                </h2>
                <p className="hero-sub">
                  Clean overview of your internship system in real time.
                </p>
              </div>

              
            </div>

            <div className="hero-progress">
              <div className="hero-progress-head">
                <div>
                  <div className="hero-progress-label">
                    Assessment Completed (Avg Progress)
                  </div>
                  <div className="hero-progress-value">
                    {stats.assessmentAvgProgress}%
                    <span className="muted">
                      {" "}
                      · Started resume: {stats.startedResume}
                    </span>
                  </div>
                </div>
                <button
                  className="link-btn"
                  onClick={() => navigate("/admin/students")}
                >
                  View students →
                </button>
              </div>

              <div className="progress-track" aria-label="Assessment average">
                <div
                  className="progress-fill"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hero-actions">
            <div className="card-title">Quick Actions</div>

            <button
              className="action-card"
              onClick={() => navigate("/admin/students")}
            >
              <div className="action-icon">🎓</div>
              <div className="action-text">
                <div className="action-title">Student Management</div>
                <div className="action-sub">View & manage students</div>
              </div>
              <div className="action-arrow">→</div>
            </button>

            <button
              className="action-card"
              onClick={() => navigate("/admin/employers")}
            >
              <div className="action-icon">🏢</div>
              <div className="action-text">
                <div className="action-title">Employer Management</div>
                <div className="action-sub">Companies & jobs</div>
              </div>
              <div className="action-arrow">→</div>
            </button>

            <button
              className="action-card"
              onClick={() => navigate("/admin/reminders")}
            >
              <div className="action-icon">⏰</div>
              <div className="action-text">
                <div className="action-title">Reminders</div>
                <div className="action-sub">Deadlines & emails</div>
              </div>
              <div className="action-arrow">→</div>
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-label">Total Students</div>
            <div className="kpi-value">{stats.totalStudents}</div>
          </div>

          <div className="kpi">
            <div className="kpi-label">Total Employers</div>
            <div className="kpi-value">{stats.totalEmployers}</div>
          </div>

          <div className="kpi">
            <div className="kpi-label">Total Jobs</div>
            <div className="kpi-value">{stats.totalJobs}</div>
          </div>

          <div className="kpi">
            <div className="kpi-label">Total Applications</div>
            <div className="kpi-value">{stats.totalApplications}</div>
          </div>
        </div>

        {/* Reminder section */}
        <div className="section-head">
          <h3>Reminder</h3>
          <p className="muted">Quick create here, or manage in reminders page.</p>
        </div>

        <div className="reminder-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Calendar</div>
                <div className="panel-sub muted">Plan important dates</div>
              </div>
            </div>

            <div className="calendar-wrap">
              <Calendar value={new Date()} calendarType="gregory" />
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Add Reminder</div>
                <div className="panel-sub muted">
                  Title + date (optional message)
                </div>
              </div>
              <button
                className="link-btn"
                onClick={() => navigate("/admin/reminders")}
              >
                Manage →
              </button>
            </div>

            <div className="form">
              <label>
                Title
                <input
                  type="text"
                  placeholder="e.g. Internship report deadline"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                />
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={remDate}
                  onChange={(e) => setRemDate(e.target.value)}
                />
              </label>

              <label>
                Message (optional)
                <textarea
                  placeholder="Add extra info..."
                  value={remMsg}
                  onChange={(e) => setRemMsg(e.target.value)}
                />
              </label>

              <button
                className="primary"
                onClick={submitReminder}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}