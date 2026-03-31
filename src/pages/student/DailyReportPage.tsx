import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";
import "./DailyReportPage.css";

const API_BASE = "http://localhost:3001";

type DailyReport = {
  id: number;
  student_id: number;
  report_date: string; // YYYY-MM-DD
  tasks_done: string;
  challenges?: string | null;
  learnings?: string | null;
  hours_spent?: number | null;
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

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DailyReportPage() {
  const user = useMemo(() => getUserFromLocalStorage(), []);
  const studentId = useMemo(() => getStudentIdFromLocalStorage(), []);

  const status = (user.status || "unemployed") as "unemployed" | "employed";
  const username = user.name || "Student";

  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [reportDate, setReportDate] = useState(todayISO());
  const [tasksDone, setTasksDone] = useState("");
  const [challenges, setChallenges] = useState("");
  const [learnings, setLearnings] = useState("");
  const [hoursSpent, setHoursSpent] = useState<number>(0);

  // modal
  const [selected, setSelected] = useState<DailyReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // edit mode
  const [editingId, setEditingId] = useState<number | null>(null);

  const titlePreview = useMemo(() => {
    const t = tasksDone.trim().split("\n")[0].slice(0, 55);
    return t || "Daily Report";
  }, [tasksDone]);

  async function fetchReports() {
    if (!studentId) {
      setError("Student not logged in (localStorage 'user' missing).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/students/${studentId}/daily-reports`);
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
    setReportDate(todayISO());
    setTasksDone("");
    setChallenges("");
    setLearnings("");
    setHoursSpent(0);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;

    if (!reportDate) return setError("Please select a date.");
    if (!tasksDone.trim()) return setError("Please fill Tasks Done.");

    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/api/daily-reports/${editingId}`, {
          report_date: reportDate,
          tasks_done: tasksDone,
          challenges,
          learnings,
          hours_spent: hoursSpent,
        });
      } else {
        await axios.post(`${API_BASE}/api/students/${studentId}/daily-reports`, {
          report_date: reportDate,
          tasks_done: tasksDone,
          challenges,
          learnings,
          hours_spent: hoursSpent,
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

  function openViewModal(r: DailyReport) {
    setSelected(r);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelected(null);
  }

  function startEdit(r: DailyReport) {
    setEditingId(r.id);
    setReportDate(r.report_date);
    setTasksDone(r.tasks_done || "");
    setChallenges(r.challenges || "");
    setLearnings(r.learnings || "");
    setHoursSpent(Number(r.hours_spent || 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this daily report?")) return;
    setError(null);
    try {
      await axios.delete(`${API_BASE}/api/daily-reports/${id}`);
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
        <div className="rp-page">
          <div className="rp-header">
            <div>
              <h1 className="rp-title">Daily Report</h1>
              <p className="rp-subtitle">Fill your daily internship progress and save it to database.</p>
            </div>
            <button className="rp-btn rp-btn-ghost" onClick={fetchReports} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && <div className="rp-alert">{error}</div>}

          <div className="rp-grid">
            {/* FORM */}
            <div className="rp-card">
              <div className="rp-card-head">
                <h2>{editingId ? `Edit Daily Report #${editingId}` : "Create Daily Report"}</h2>
                <span className="rp-chip">{titlePreview}</span>
              </div>

              <form onSubmit={handleSave} className="rp-form">
                <div className="rp-row">
                  <label className="rp-field">
                    <span>Date</span>
                    <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
                  </label>

                  <label className="rp-field">
                    <span>Hours</span>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={hoursSpent}
                      onChange={(e) => setHoursSpent(Number(e.target.value))}
                    />
                  </label>
                </div>

                <label className="rp-field">
                  <span>Tasks Done *</span>
                  <textarea
                    rows={5}
                    value={tasksDone}
                    onChange={(e) => setTasksDone(e.target.value)}
                    placeholder="Example: Implemented daily report UI, connected backend API..."
                  />
                </label>

                <label className="rp-field">
                  <span>Challenges</span>
                  <textarea
                    rows={3}
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="Example: API error handling, validation..."
                  />
                </label>

                <label className="rp-field">
                  <span>Learnings</span>
                  <textarea
                    rows={3}
                    value={learnings}
                    onChange={(e) => setLearnings(e.target.value)}
                    placeholder="Example: How to structure CRUD endpoints in Express..."
                  />
                </label>

                <div className="rp-actions">
                  <button className="rp-btn rp-btn-primary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingId ? "Update" : "Save"}
                  </button>

                  {editingId && (
                    <button className="rp-btn rp-btn-ghost" type="button" onClick={resetForm} disabled={saving}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* TABLE */}
            <div className="rp-card">
              <div className="rp-card-head">
                <h2>Saved Daily Reports</h2>
                <span className="rp-muted">{reports.length} records</span>
              </div>

              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th style={{ width: 120 }}>Date</th>
                      <th>Title (first line)</th>
                      <th style={{ width: 180, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={3} className="rp-empty">
                          No daily reports yet.
                        </td>
                      </tr>
                    )}

                    {reports.map((r) => {
                      const title = (r.tasks_done || "").trim().split("\n")[0].slice(0, 60) || "Daily Report";
                      return (
                        <tr key={r.id}>
                          <td>{r.report_date}</td>
                          <td className="rp-td-title">{title}</td>
                          <td style={{ textAlign: "right" }}>
                            <div className="rp-table-actions">
                              <button className="rp-btn rp-btn-small" onClick={() => openViewModal(r)}>
                                View
                              </button>
                              <button className="rp-btn rp-btn-small rp-btn-ghost" onClick={() => startEdit(r)}>
                                Edit
                              </button>
                              <button className="rp-btn rp-btn-small rp-btn-danger" onClick={() => handleDelete(r.id)}>
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
            <div className="rp-modal-overlay" onClick={closeModal}>
              <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
                <div className="rp-modal-head">
                  <div>
                    <h3 className="rp-modal-title">Daily Report</h3>
                    <p className="rp-muted">Date: {selected.report_date}</p>
                  </div>
                  <button className="rp-btn rp-btn-ghost" onClick={closeModal}>
                    ✕
                  </button>
                </div>

                <div className="rp-modal-card">
                  <div className="rp-section">
                    <div className="rp-section-title">Tasks Done</div>
                    <div className="rp-pre">{selected.tasks_done}</div>
                  </div>

                  <div className="rp-split">
                    <div className="rp-section">
                      <div className="rp-section-title">Challenges</div>
                      <div className="rp-pre">{selected.challenges || "-"}</div>
                    </div>

                    <div className="rp-section">
                      <div className="rp-section-title">Learnings</div>
                      <div className="rp-pre">{selected.learnings || "-"}</div>
                    </div>
                  </div>

                  <div className="rp-meta">
                    <span className="rp-pill">Hours: {Number(selected.hours_spent || 0)}</span>
                    {selected.attachment && (
                      <a className="rp-link" href={`${API_BASE}${selected.attachment}`} target="_blank" rel="noreferrer">
                        View Attachment
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}