import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentStage1.css";

const API_BASE = "http://localhost:3001";

type DashboardStats = {
  jobsApplied: number;
  interviewScheduled: number;
  assessmentCompleted: number; // 0-100
};

type Reminder = {
  id: number;
  title: string;
  reminder_date: string; // YYYY-MM-DD
};

function formatDate(input: string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function StudentStage1({
  username,
  onEmployed,
}: {
  username: string;
  onEmployed: () => void;
}) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user?.id;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    jobsApplied: 0,
    interviewScheduled: 0,
    assessmentCompleted: 0,
  });

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [savingReminder, setSavingReminder] = useState(false);

  const fetchAll = async () => {
    if (!studentId) return;

    try {
      setLoading(true);

      const [statsRes, reminderRes] = await Promise.all([
        axios.get(`${API_BASE}/api/students/${studentId}/dashboard-stats`),
        axios.get(`${API_BASE}/api/students/${studentId}/reminders`),
      ]);

      setStats({
        jobsApplied: Number(statsRes.data?.jobsApplied || 0),
        interviewScheduled: Number(statsRes.data?.interviewScheduled || 0),
        assessmentCompleted: Math.max(0, Math.min(100, Number(statsRes.data?.assessmentCompleted || 0))),
      });

      setReminders(reminderRes.data?.reminders || []);
    } catch (e) {
      console.error(e);
      setStats({ jobsApplied: 0, interviewScheduled: 0, assessmentCompleted: 0 });
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => (a.reminder_date || "").localeCompare(b.reminder_date || ""));
  }, [reminders]);

  const addReminder = async () => {
    if (!studentId) return;
    if (!title.trim()) return alert("Please enter a title");
    if (!date) return alert("Please choose a date");

    try {
      setSavingReminder(true);
      await axios.post(`${API_BASE}/api/students/${studentId}/reminders`, {
        title: title.trim(),
        reminder_date: date,
      });
      setTitle("");
      setDate("");
      fetchAll();
    } catch (e) {
      console.error(e);
      alert("Failed to add reminder");
    } finally {
      setSavingReminder(false);
    }
  };

  const deleteReminder = async (id: number) => {
    if (!studentId) return;
    if (!confirm("Delete this reminder?")) return;

    try {
      await axios.delete(`${API_BASE}/api/students/${studentId}/reminders/${id}`);
      fetchAll();
    } catch (e) {
      console.error(e);
      alert("Failed to delete reminder");
    }
  };

  return (
    <div className="sd1-wrap">
      {/* Hero */}
      <div className="sd1-hero">
        <div className="sd1-heroText">
          <div className="sd1-welcome">
            Welcome back, <span className="sd1-name">{username}</span>
          </div>
          <div className="sd1-sub">
            Ready to land your dream internship? Here’s a quick look at your progress.
          </div>
        </div>

        {/* remove this button later if you want */}
        <button className="sd1-ghostBtn" onClick={onEmployed} type="button">
          Simulate Got Internship
        </button>
      </div>

      {/* Quick Actions */}
      <div className="sd1-sectionHead">
        <h2 className="sd1-h2">Quick Actions</h2>
        <div className="sd1-muted">Jump straight to what you need</div>
      </div>

      <div className="sd1-actionsGrid">
        <button className="sd1-actionCard" onClick={() => navigate("/generate-resume")} type="button">
          <div className="sd1-iconCircle">📄</div>
          <div className="sd1-actionTitle">Generate Resume</div>
          <div className="sd1-actionSub">Create AI resume in minutes</div>
        </button>

        <button className="sd1-actionCard" onClick={() => navigate("/jobs")} type="button">
          <div className="sd1-iconCircle">🔎</div>
          <div className="sd1-actionTitle">View Jobs</div>
          <div className="sd1-actionSub">Find internships & apply</div>
        </button>


        <button className="sd1-actionCard" onClick={() => navigate("/interview-schedule")} type="button">
          <div className="sd1-iconCircle">🗓️</div>
          <div className="sd1-actionTitle">Interview Schedule</div>
          <div className="sd1-actionSub">Accept / reject interviews</div>
        </button>
      </div>

      {/* Progress */}
      <div className="sd1-sectionHead" style={{ marginTop: 18 }}>
        <h2 className="sd1-h2">Progress</h2>
        <div className="sd1-muted">Your internship journey status</div>
      </div>

      <div className="sd1-progressGrid">
        <div className="sd1-statCard">
          <div className="sd1-statTop">
            <div className="sd1-statLabel">Jobs Applied</div>
            <div className="sd1-statBadge">Total</div>
          </div>

          <div className="sd1-statValue">{loading ? "—" : stats.jobsApplied}</div>
        </div>

        <div className="sd1-statCard">
          <div className="sd1-statTop">
            <div className="sd1-statLabel">Interview Scheduled</div>
            <div className="sd1-statBadge">Upcoming</div>
          </div>

          <div className="sd1-statValue">{loading ? "—" : stats.interviewScheduled}</div>
        </div>

        <div className="sd1-statCard">
          <div className="sd1-statTop">
            <div className="sd1-statLabel">Assessment Completed</div>
            <div className="sd1-statBadge">Progress</div>
          </div>

          <div className="sd1-statValue">{loading ? "—" : `${stats.assessmentCompleted}%`}</div>

          <div className="sd1-bar">
            <div className="sd1-barFill" style={{ width: `${stats.assessmentCompleted}%` }} />
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div className="sd1-sectionHead" style={{ marginTop: 18 }}>
        <h2 className="sd1-h2">Reminder</h2>
        <div className="sd1-muted">Stay on track with tasks & interviews</div>
      </div>

      <div className="sd1-reminderGrid">
        {/* Upcoming list */}
        <div className="sd1-card">
          <div className="sd1-cardHead">
            <div>
              <div className="sd1-cardTitle">Upcoming Reminders</div>
              <div className="sd1-cardSub">Your next tasks</div>
            </div>

            <button className="sd1-miniBtn" onClick={fetchAll} type="button">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="sd1-empty">Loading…</div>
          ) : sortedReminders.length === 0 ? (
            <div className="sd1-empty">No reminders yet.</div>
          ) : (
            <div className="sd1-list">
              {sortedReminders.slice(0, 8).map((r) => (
                <div key={r.id} className="sd1-listRow">
                  <div className="sd1-dot" />
                  <div className="sd1-listText">
                    <div className="sd1-listTitle">{r.title}</div>
                    <div className="sd1-listDate">{formatDate(r.reminder_date)}</div>
                  </div>

                  <button className="sd1-trash" onClick={() => deleteReminder(r.id)} type="button" title="Delete">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add reminder form */}
        <div className="sd1-card">
          <div className="sd1-cardHead">
            <div>
              <div className="sd1-cardTitle">Add Reminder</div>
              <div className="sd1-cardSub">Title + date</div>
            </div>
          </div>

          <div className="sd1-form">
            <label className="sd1-label">Title</label>
            <input
              className="sd1-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Interview preparation"
            />

            <label className="sd1-label">Choose Date</label>
            <input
              className="sd1-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button className="sd1-primaryBtn" onClick={addReminder} type="button" disabled={savingReminder}>
              {savingReminder ? "Saving..." : "Submit"}
            </button>
          </div>

          <div className="sd1-hint">Saved to database ✅</div>
        </div>
      </div>
    </div>
  );
}