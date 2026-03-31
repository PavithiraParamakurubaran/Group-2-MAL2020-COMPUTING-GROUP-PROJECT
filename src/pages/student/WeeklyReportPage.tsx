import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";
import "./WeeklyReportPage.css";

const API_BASE = "http://localhost:3001";

type WeeklyReport = {
  id: number;
  student_id: number;
  week_start: string; // YYYY-MM-DD
  week_end: string;   // YYYY-MM-DD
  summary: string;
  achievements?: string | null;
  challenges?: string | null;
  next_week_plan?: string | null;
  attachment?: string | null;
  created_at?: string;
  updated_at?: string;
};

function getUserFromLocalStorage(): any {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function getStudentIdFromLocalStorage(): number | null {
  const u = getUserFromLocalStorage();
  return typeof u?.id === "number" ? u.id : null;
}

export default function WeeklyReportPage() {
  const user = useMemo(() => getUserFromLocalStorage(), []);
  const studentId = useMemo(() => getStudentIdFromLocalStorage(), []);

  const status = (user.status || "unemployed") as "unemployed" | "employed";
  const username = user.name || "Student";

  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [summary, setSummary] = useState("");
  const [achievements, setAchievements] = useState("");
  const [challenges, setChallenges] = useState("");
  const [nextWeekPlan, setNextWeekPlan] = useState("");

  // modal
  const [selected, setSelected] = useState<WeeklyReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // edit mode
  const [editingId, setEditingId] = useState<number | null>(null);

  const titlePreview = useMemo(() => {
    const t = summary.trim().split("\n")[0].slice(0, 55);
    return t || "Weekly Report";
  }, [summary]);

  async function fetchReports() {
    if (!studentId) {
      setError("Student not logged in (localStorage 'user' missing).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/students/${studentId}/weekly-reports`);
      setReports(res.data?.reports ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setEditingId(null);
    setWeekStart("");
    setWeekEnd("");
    setSummary("");
    setAchievements("");
    setChallenges("");
    setNextWeekPlan("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;

    if (!weekStart || !weekEnd) return setError("Please fill Week Start and Week End.");
    if (!summary.trim()) return setError("Please fill Summary.");

    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/api/weekly-reports/${editingId}`, {
          week_start: weekStart,
          week_end: weekEnd,
          summary,
          achievements,
          challenges,
          next_week_plan: nextWeekPlan,
        });
      } else {
        await axios.post(`${API_BASE}/api/students/${studentId}/weekly-reports`, {
          week_start: weekStart,
          week_end: weekEnd,
          summary,
          achievements,
          challenges,
          next_week_plan: nextWeekPlan,
        });
      }

      resetForm();
      await fetchReports();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function openViewModal(r: WeeklyReport) {
    setSelected(r);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelected(null);
  }

  function startEdit(r: WeeklyReport) {
    setEditingId(r.id);
    setWeekStart(r.week_start);
    setWeekEnd(r.week_end);
    setSummary(r.summary || "");
    setAchievements(r.achievements || "");
    setChallenges(r.challenges || "");
    setNextWeekPlan(r.next_week_plan || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this weekly report?")) return;
    setError(null);
    try {
      await axios.delete(`${API_BASE}/api/weekly-reports/${id}`);
      if (editingId === id) resetForm();
      await fetchReports();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Delete failed");
    }
  }

  return (
    <div className="dashboard-layout">
      <StudentMenu status={status} username={username} />

      <div className="dashboard-content">
        <div className="wp-page">
          <div className="wp-header">
            <div>
              <h1 className="wp-title">Weekly Report</h1>
              <p className="wp-subtitle">Submit your weekly internship progress and save it to database.</p>
            </div>
            <button className="wp-btn wp-btn-ghost" onClick={fetchReports} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && <div className="wp-alert">{error}</div>}

          {/* TOP and BOTTOM (1 column) */}
          <div className="wp-grid">
            {/* FORM (TOP) */}
            <div className="wp-card">
              <div className="wp-card-head">
                <h2>{editingId ? `Edit Weekly Report #${editingId}` : "Create Weekly Report"}</h2>
                <span className="wp-chip">{titlePreview}</span>
              </div>

              <form onSubmit={handleSave} className="wp-form">
                <div className="wp-row">
                  <label className="wp-field">
                    <span>Week Start</span>
                    <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
                  </label>

                  <label className="wp-field">
                    <span>Week End</span>
                    <input type="date" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} />
                  </label>
                </div>

                <label className="wp-field">
                  <span>Summary *</span>
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Summary of the week..."
                  />
                </label>

                <label className="wp-field">
                  <span>Achievements</span>
                  <textarea
                    rows={3}
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    placeholder="What did you achieve?"
                  />
                </label>

                <label className="wp-field">
                  <span>Challenges</span>
                  <textarea
                    rows={3}
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="Any challenges?"
                  />
                </label>

                <label className="wp-field">
                  <span>Next Week Plan</span>
                  <textarea
                    rows={3}
                    value={nextWeekPlan}
                    onChange={(e) => setNextWeekPlan(e.target.value)}
                    placeholder="Plan for next week..."
                  />
                </label>

                <div className="wp-actions">
                  <button className="wp-btn wp-btn-primary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update" : "Save"}
                  </button>

                  {editingId && (
                    <button className="wp-btn wp-btn-ghost" type="button" onClick={resetForm} disabled={saving}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* TABLE (BOTTOM) */}
            <div className="wp-card">
              <div className="wp-card-head">
                <h2>Saved Weekly Reports</h2>
                <span className="wp-muted">{reports.length} records</span>
              </div>

              <div className="wp-table-wrap">
                <table className="wp-table">
                  <thead>
                    <tr>
                      <th style={{ width: 220 }}>Week</th>
                      <th>Title (summary first line)</th>
                      <th style={{ width: 200, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={3} className="wp-empty">
                          No weekly reports yet.
                        </td>
                      </tr>
                    )}

                    {reports.map((r) => {
                      const title = (r.summary || "").trim().split("\n")[0].slice(0, 60) || "Weekly Report";
                      return (
                        <tr key={r.id}>
                          <td>
                            {r.week_start} → {r.week_end}
                          </td>
                          <td className="wp-td-title">{title}</td>
                          <td style={{ textAlign: "right" }}>
                            <div className="wp-table-actions">
                              <button className="wp-btn wp-btn-small" onClick={() => openViewModal(r)}>
                                View
                              </button>
                              <button className="wp-btn wp-btn-small wp-btn-ghost" onClick={() => startEdit(r)}>
                                Edit
                              </button>
                              <button className="wp-btn wp-btn-small wp-btn-danger" onClick={() => handleDelete(r.id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* MODAL */}
          {isModalOpen && selected && (
            <div className="wp-modal-overlay" onClick={closeModal}>
              <div className="wp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wp-modal-head">
                  <div>
                    <h3 className="wp-modal-title">Weekly Report</h3>
                    <p className="wp-muted">
                      Week: {selected.week_start} → {selected.week_end}
                    </p>
                  </div>
                  <button className="wp-btn wp-btn-ghost" onClick={closeModal}>
                    ✕
                  </button>
                </div>

                <div className="wp-modal-card">
                  <div className="wp-section">
                    <div className="wp-section-title">Summary</div>
                    <div className="wp-pre">{selected.summary}</div>
                  </div>

                  <div className="wp-split">
                    <div className="wp-section">
                      <div className="wp-section-title">Achievements</div>
                      <div className="wp-pre">{selected.achievements || "-"}</div>
                    </div>

                    <div className="wp-section">
                      <div className="wp-section-title">Challenges</div>
                      <div className="wp-pre">{selected.challenges || "-"}</div>
                    </div>
                  </div>

                  <div className="wp-section" style={{ marginTop: 12 }}>
                    <div className="wp-section-title">Next Week Plan</div>
                    <div className="wp-pre">{selected.next_week_plan || "-"}</div>
                  </div>

                  {selected.attachment && (
                    <div className="wp-meta">
                      <a className="wp-link" href={`${API_BASE}${selected.attachment}`} target="_blank" rel="noreferrer">
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}