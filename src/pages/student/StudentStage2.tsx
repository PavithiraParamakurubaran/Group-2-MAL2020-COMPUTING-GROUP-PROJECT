import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudentMenu from "../../components/menus/StudentMenu";
import "./StudentStage2.css";

const API_BASE = "http://localhost:3001";

type AttendanceRecord = {
  id: number;
  date: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status?: "present" | "absent" | "late" | "halfday";
  notes?: string | null;
};

type DailyReport = {
  id: number;
  report_date: string;
  tasks_done: string;
};

type WeeklyReport = {
  id: number;
  week_start: string;
  week_end: string;
  summary: string;
};

type StudentDocument = {
  id: number | string;
  document_name: string;
  file_path: string;
  file_type: string;
  created_at?: string;
};

type StudentProfile = {
  id: number;
  name: string;
  email?: string;
  course?: string;
  contact_number?: string;
  profile_picture?: string | null;
};

function getUserFromLocalStorage(): any {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDate(d?: string | null) {
  if (!d) return "";
  return d.slice(0, 10);
}

export default function StudentStage2() {
  const navigate = useNavigate();
  const user = useMemo(() => getUserFromLocalStorage(), []);

  const studentId = user?.id;
  const status = (user?.status || "employed") as "unemployed" | "employed";
  const username = user?.name || "Student";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!studentId) {
        setError("Student not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [profileRes, attendanceRes, dailyRes, weeklyRes, docsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/students/${studentId}`),
          axios.get(`${API_BASE}/api/students/${studentId}/attendance`),
          axios.get(`${API_BASE}/api/students/${studentId}/daily-reports`),
          axios.get(`${API_BASE}/api/students/${studentId}/weekly-reports`),
          axios.get(`${API_BASE}/api/students/${studentId}/documents`),
        ]);

        setProfile(profileRes.data || null);
        setAttendance(attendanceRes.data?.records || []);
        setDailyReports(dailyRes.data?.reports || []);
        setWeeklyReports(weeklyRes.data?.reports || []);
        setDocuments(docsRes.data?.documents || []);
      } catch (err: any) {
        console.error("Stage 2 dashboard fetch error:", err);
        setError(err?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [studentId]);

  const todayRecord = useMemo(() => {
    const today = todayISO();
    return attendance.find((a) => normalizeDate(a.date) === today) || null;
  }, [attendance]);

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;

    let filled = 0;
    const fields = [
      profile.name,
      profile.email,
      profile.course,
      profile.contact_number,
      profile.profile_picture,
    ];

    fields.forEach((f) => {
      if (f && String(f).trim() !== "") filled++;
    });

    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const latestDaily = useMemo(() => {
    if (!dailyReports.length) return null;
    return [...dailyReports].sort((a, b) => b.report_date.localeCompare(a.report_date))[0];
  }, [dailyReports]);

  const latestWeekly = useMemo(() => {
    if (!weeklyReports.length) return null;
    return [...weeklyReports].sort((a, b) => b.week_start.localeCompare(a.week_start))[0];
  }, [weeklyReports]);

  const latestDocument = useMemo(() => {
    if (!documents.length) return null;
    return documents[0];
  }, [documents]);

  const attendanceLabel = useMemo(() => {
    if (!todayRecord) return "No record";
    if (todayRecord.status === "present") return "Present";
    if (todayRecord.status === "late") return "Late";
    if (todayRecord.status === "absent") return "Absent";
    if (todayRecord.status === "halfday") return "Halfday";
    return "Recorded";
  }, [todayRecord]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <StudentMenu status={status} username={username} />
        <div className="dashboard-content">
          <div className="ss2-loading-card">Loading Stage 2 dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">

      <div className="dashboard-content">
        <div className="ss2-page">
          <div className="ss2-header">
            <div>
              <h1 className="ss2-title">Internship Dashboard</h1>
              <p className="ss2-subtitle">
                Welcome back, {username}. Manage your internship reports, attendance, profile, and documents here.
              </p>
            </div>

            <div className="ss2-header-badge">
              <div className="ss2-badge-label">Today</div>
              <div className="ss2-badge-date">{todayISO()}</div>
            </div>
          </div>

          {error && <div className="ss2-alert">{error}</div>}

          <div className="ss2-cards">
            <div className="ss2-card">
              <div className="ss2-card-label">Profile Completion</div>
              <div className="ss2-card-value">{profileCompletion}%</div>
              <div className="ss2-card-sub">Keep your profile updated</div>
            </div>

            <div className="ss2-card">
              <div className="ss2-card-label">Today Attendance</div>
              <div className="ss2-card-value">{attendanceLabel}</div>
              <div className="ss2-card-sub">
                In: {todayRecord?.check_in_time || "--:--:--"} | Out: {todayRecord?.check_out_time || "--:--:--"}
              </div>
            </div>

            <div className="ss2-card">
              <div className="ss2-card-label">Daily Reports</div>
              <div className="ss2-card-value">{dailyReports.length}</div>
              <div className="ss2-card-sub">
                Latest: {latestDaily?.report_date || "No report yet"}
              </div>
            </div>

            <div className="ss2-card">
              <div className="ss2-card-label">Weekly Reports</div>
              <div className="ss2-card-value">{weeklyReports.length}</div>
              <div className="ss2-card-sub">
                Latest: {latestWeekly ? `${latestWeekly.week_start} → ${latestWeekly.week_end}` : "No report yet"}
              </div>
            </div>

            <div className="ss2-card">
              <div className="ss2-card-label">Documents</div>
              <div className="ss2-card-value">{documents.length}</div>
              <div className="ss2-card-sub">
                Latest: {latestDocument?.document_name || "No document yet"}
              </div>
            </div>
          </div>

          <div className="ss2-grid">
            <div className="ss2-panel">
              <div className="ss2-panel-head">
                <h2>Recent Activity</h2>
                <span className="ss2-muted">Latest updates</span>
              </div>

              <div className="ss2-activity-list">
                <div className="ss2-activity-item">
                  <div className="ss2-activity-title">Attendance</div>
                  <div className="ss2-activity-text">
                    {todayRecord
                      ? `Today marked as ${attendanceLabel.toLowerCase()}`
                      : "No attendance recorded for today."}
                  </div>
                </div>

                <div className="ss2-activity-item">
                  <div className="ss2-activity-title">Daily Report</div>
                  <div className="ss2-activity-text">
                    {latestDaily
                      ? `Latest report submitted on ${latestDaily.report_date}`
                      : "No daily report submitted yet."}
                  </div>
                </div>

                <div className="ss2-activity-item">
                  <div className="ss2-activity-title">Weekly Report</div>
                  <div className="ss2-activity-text">
                    {latestWeekly
                      ? `Latest weekly report: ${latestWeekly.week_start} → ${latestWeekly.week_end}`
                      : "No weekly report submitted yet."}
                  </div>
                </div>

                <div className="ss2-activity-item">
                  <div className="ss2-activity-title">Documents</div>
                  <div className="ss2-activity-text">
                    {latestDocument
                      ? `Latest uploaded file: ${latestDocument.document_name}`
                      : "No document uploaded yet."}
                  </div>
                </div>
              </div>
            </div>

            <div className="ss2-panel">
              <div className="ss2-panel-head">
                <h2>Quick Actions</h2>
                <span className="ss2-muted">Jump to a task</span>
              </div>

              <div className="ss2-actions">
  <button className="ss2-btn ss2-btn-primary" onClick={() => navigate("/profile")}>
    Edit Profile
  </button>

  <button className="ss2-btn ss2-btn-primary" onClick={() => navigate("/daily-report")}>
    Daily Report
  </button>

  <button className="ss2-btn ss2-btn-primary" onClick={() => navigate("/weekly-report")}>
    Weekly Report
  </button>

  <button className="ss2-btn ss2-btn-primary" onClick={() => navigate("/attendance")}>
    Attendance
  </button>

  <button className="ss2-btn ss2-btn-primary" onClick={() => navigate("/documents")}>
    Documents
  </button>
</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}