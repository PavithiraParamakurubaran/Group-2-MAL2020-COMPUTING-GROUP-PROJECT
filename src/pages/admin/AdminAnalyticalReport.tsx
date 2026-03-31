import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminMenu from "../../components/menus/AdminMenu";
import "./AdminAnalyticalReport.css";

const API_BASE = "http://localhost:3001";

type AdminStats = {
  totalStudents: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  startedResume: number;
  assessmentAvgProgress: number;
};

export default function AdminAnalyticalReport() {
  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    startedResume: 0,
    assessmentAvgProgress: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/api/admin/dashboard/stats`);
      setStats({
        totalStudents: Number(res.data?.totalStudents || 0),
        totalEmployers: Number(res.data?.totalEmployers || 0),
        totalJobs: Number(res.data?.totalJobs || 0),
        totalApplications: Number(res.data?.totalApplications || 0),
        startedResume: Number(res.data?.startedResume || 0),
        assessmentAvgProgress: Number(res.data?.assessmentAvgProgress || 0),
      });
    } catch (err) {
      console.error("Fetch admin analytical report error:", err);
      setError("Failed to load analytical report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const derived = useMemo(() => {
    const applicationRate =
      stats.totalJobs > 0
        ? ((stats.totalApplications / stats.totalJobs) * 100).toFixed(1)
        : "0.0";

    const employerCoverage =
      stats.totalStudents > 0
        ? ((stats.totalEmployers / stats.totalStudents) * 100).toFixed(1)
        : "0.0";

    return {
      applicationRate,
      employerCoverage,
    };
  }, [stats]);

  return (
    <div className="ar-layout">
      <AdminMenu adminName={admin?.name || "Admin"} />

      <div className="ar-main">
        <div className="ar-header">
          <div>
            <h1 className="ar-title">Analytical Report</h1>
            <p className="ar-subtitle">
              Overview of platform activity, resume readiness, and internship engagement.
            </p>
          </div>

          <button className="ar-refresh-btn" onClick={fetchStats} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <div className="ar-alert">{error}</div>}

        <div className="ar-grid-cards">
          <div className="ar-card">
            <div className="ar-card-label">Total Students</div>
            <div className="ar-card-value">{stats.totalStudents}</div>
            <div className="ar-card-note">Registered student accounts</div>
          </div>

          <div className="ar-card">
            <div className="ar-card-label">Total Employers</div>
            <div className="ar-card-value">{stats.totalEmployers}</div>
            <div className="ar-card-note">Active employer accounts</div>
          </div>

          <div className="ar-card">
            <div className="ar-card-label">Total Jobs</div>
            <div className="ar-card-value">{stats.totalJobs}</div>
            <div className="ar-card-note">Jobs posted on the platform</div>
          </div>

          <div className="ar-card">
            <div className="ar-card-label">Applications</div>
            <div className="ar-card-value">{stats.totalApplications}</div>
            <div className="ar-card-note">Total student job applications</div>
          </div>

          <div className="ar-card">
            <div className="ar-card-label">Started Resume</div>
            <div className="ar-card-value">{stats.startedResume}</div>
            <div className="ar-card-note">Students who started resume flow</div>
          </div>

          <div className="ar-card">
            <div className="ar-card-label">Avg Assessment Progress</div>
            <div className="ar-card-value">{stats.assessmentAvgProgress}%</div>
            <div className="ar-progress-wrap">
              <div
                className="ar-progress-bar"
                style={{ width: `${Math.min(100, Math.max(0, stats.assessmentAvgProgress))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="ar-grid-panels">
          <div className="ar-panel">
            <div className="ar-panel-head">
              <h2>Platform Summary</h2>
            </div>

            <div className="ar-summary-list">
              <div className="ar-summary-item">
                <span className="ar-summary-label">Student to Employer Ratio</span>
                <span className="ar-summary-value">
                  {stats.totalEmployers === 0
                    ? `${stats.totalStudents} : 0`
                    : `${stats.totalStudents} : ${stats.totalEmployers}`}
                </span>
              </div>

              <div className="ar-summary-item">
                <span className="ar-summary-label">Application Rate per Job</span>
                <span className="ar-summary-value">{derived.applicationRate}%</span>
              </div>

              <div className="ar-summary-item">
                <span className="ar-summary-label">Employer Coverage vs Students</span>
                <span className="ar-summary-value">{derived.employerCoverage}%</span>
              </div>

              <div className="ar-summary-item">
                <span className="ar-summary-label">Resume Participation</span>
                <span className="ar-summary-value">
                  {stats.startedResume} / {stats.totalStudents}
                </span>
              </div>
            </div>
          </div>

          <div className="ar-panel">
            <div className="ar-panel-head">
              <h2>Administrative Insights</h2>
            </div>

            <div className="ar-insight-list">
              <div className="ar-insight-box">
                <div className="ar-insight-title">Student Engagement</div>
                <div className="ar-insight-text">
                  {stats.startedResume > 0
                    ? "Students are actively engaging with the resume assessment workflow."
                    : "No resume activity has been recorded yet."}
                </div>
              </div>

              <div className="ar-insight-box">
                <div className="ar-insight-title">Recruitment Activity</div>
                <div className="ar-insight-text">
                  {stats.totalApplications > 0
                    ? "Job postings are receiving applications from students."
                    : "No applications have been submitted yet."}
                </div>
              </div>

              <div className="ar-insight-box">
                <div className="ar-insight-title">System Readiness</div>
                <div className="ar-insight-text">
                  {stats.assessmentAvgProgress >= 50
                    ? "Overall assessment progress is at a healthy level."
                    : "Assessment completion is still low and may need reminders."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ar-bottom-panel">
          <div className="ar-panel-head">
            <h2>Quick Overview</h2>
          </div>

          <div className="ar-overview-grid">
            <div className="ar-overview-box">
              <div className="ar-overview-top">Students</div>
              <div className="ar-overview-bottom">
                {stats.totalStudents > 0 ? "System has active student data." : "No student data yet."}
              </div>
            </div>

            <div className="ar-overview-box">
              <div className="ar-overview-top">Employers</div>
              <div className="ar-overview-bottom">
                {stats.totalEmployers > 0 ? "Employers are registered." : "No employers yet."}
              </div>
            </div>

            <div className="ar-overview-box">
              <div className="ar-overview-top">Jobs</div>
              <div className="ar-overview-bottom">
                {stats.totalJobs > 0 ? "Jobs are available in the system." : "No job postings yet."}
              </div>
            </div>

            <div className="ar-overview-box">
              <div className="ar-overview-top">Applications</div>
              <div className="ar-overview-bottom">
                {stats.totalApplications > 0
                  ? "Students have started applying."
                  : "Applications have not started yet."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}