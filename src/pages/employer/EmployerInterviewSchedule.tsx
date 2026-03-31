import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import EmployerMenu from "../../components/menus/EmployerMenu";
import "./EmployerInterviewSchedule.css";

const API_BASE = "http://localhost:3001";

type InterviewRow = {
  id: number;
  status: "scheduled" | "attending" | "rejected" | "completed";
  interview_datetime: string;
  mode: "online" | "face_to_face";
  notes?: string;

  job_title: string;
  student_name: string;
  student_student_id: string;

  // outcome fields (nullable)
  outcome?: "offered" | "not_offered" | null;
  join_date?: string | null;
  offered_position?: string | null;
  offered_salary?: string | null;
  offer_notes?: string | null;
  rejection_reason?: string | null;
};

interface EmployerProfileData {
  id: number;
  company_name: string;
}

type OutcomeForm = {
  outcome: "offered" | "not_offered";
  join_date: string; // YYYY-MM-DD
  offered_position: string;
  offered_salary: string;
  offer_notes: string;
  rejection_reason: string;
};

function formatDateTime(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

function modeLabel(m: InterviewRow["mode"]) {
  return m === "face_to_face" ? "Face to Face" : "Online";
}

export default function EmployerInterviewSchedule() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | InterviewRow["status"]>("all");

  // ✅ VIEW modal (read-only)
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewInterview, setViewInterview] = useState<InterviewRow | null>(null);

  // ✅ RESULT modal (edit/save)
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<OutcomeForm>({
    outcome: "offered",
    join_date: "",
    offered_position: "",
    offered_salary: "",
    offer_notes: "",
    rejection_reason: "",
  });

  // profile for menu
  useEffect(() => {
    const run = async () => {
      try {
        if (!user?.id) return;
        const res = await axios.get(`${API_BASE}/api/employers/profile/${user.id}`);
        setProfile(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [user?.id]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/employers/${user.id}/interviews`);
      setInterviews(res.data?.interviews || []);
    } catch (e) {
      console.error(e);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const companyName = profile?.company_name || "Employer";

  const filtered = useMemo(() => {
    return interviews.filter((i) => (statusFilter === "all" ? true : i.status === statusFilter));
  }, [interviews, statusFilter]);

  // ✅ Open VIEW (read-only)
  const openView = (i: InterviewRow) => {
    setViewInterview(i);
    setShowViewModal(true);
  };

  // ✅ Open RESULT editor
  const openOutcomeModal = (i: InterviewRow) => {
    setSelectedInterview(i);

    setForm({
      outcome: (i.outcome as any) || "offered",
      join_date: i.join_date ? String(i.join_date) : "",
      offered_position: i.offered_position || "",
      offered_salary: i.offered_salary || "",
      offer_notes: i.offer_notes || "",
      rejection_reason: i.rejection_reason || "",
    });

    setShowOutcomeModal(true);
  };

  const saveOutcome = async () => {
    if (!selectedInterview) return;

    // validations
    if (form.outcome === "not_offered") {
      if (!form.rejection_reason || form.rejection_reason.trim().length < 3) {
        alert("Please enter a rejection reason");
        return;
      }
    }

    try {
      setSaving(true);

      await axios.put(`${API_BASE}/api/employers/${user.id}/interviews/${selectedInterview.id}/outcome`, {
        outcome: form.outcome,
        join_date: form.outcome === "offered" ? (form.join_date || null) : null,
        offered_position: form.outcome === "offered" ? (form.offered_position || null) : null,
        offered_salary: form.outcome === "offered" ? (form.offered_salary || null) : null,
        offer_notes: form.outcome === "offered" ? (form.offer_notes || null) : null,
        rejection_reason: form.outcome === "not_offered" ? form.rejection_reason : null,
      });

      setShowOutcomeModal(false);
      setSelectedInterview(null);
      fetchInterviews();
      alert("Interview marked as completed ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to save outcome");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="eis-layout">
      <EmployerMenu companyName={companyName} />

      <div className="eis-main">
        <div className="eis-topbar">
          <div>
            <h1 className="eis-title">Interview Schedule</h1>
            <div className="eis-subtitle">
              Showing <b>{filtered.length}</b> of <b>{interviews.length}</b> interviews
            </div>
          </div>

          <div className="eis-filters">
            <div className="eis-filter">
              <label className="eis-filter-label">Status</label>
              <select
                className="eis-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="attending">Attending</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <button className="eis-refresh" onClick={fetchInterviews} type="button">
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="eis-loading">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="eis-empty">No interviews found.</div>
        ) : (
          <div className="eis-tableWrap">
            <table className="eis-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Student</th>
                  <th>Date & Time</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th className="eis-actionsCol">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id}>
                    <td className="eis-job">{i.job_title}</td>
                    <td>
                      <div className="eis-student">
                        <div className="eis-studentName">{i.student_name}</div>
                        <div className="eis-studentId">{i.student_student_id}</div>
                      </div>
                    </td>
                    <td>{formatDateTime(i.interview_datetime)}</td>
                    <td>{modeLabel(i.mode)}</td>
                    <td>
                      <span className={`eis-status ${i.status}`}>{i.status.toUpperCase()}</span>
                    </td>

                    <td>
                      {i.status !== "completed" ? (
                        <span className="eis-muted">—</span>
                      ) : i.outcome === "offered" ? (
                        <div className="eis-result">
                          <div className="eis-resultMain">Job Offered</div>
                          <div className="eis-resultSub">
                            {i.join_date ? `Join: ${String(i.join_date)}` : "Join date: —"}
                          </div>
                        </div>
                      ) : (
                        <div className="eis-result">
                          <div className="eis-resultMain">Not Offered</div>
                          <div className="eis-resultSub">{i.rejection_reason || "—"}</div>
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="eis-actions">
                        <button className="eis-btnSecondary" onClick={() => openView(i)} type="button">
                          View Details
                        </button>

                        {i.status === "attending" ? (
                          <button className="eis-btnComplete" onClick={() => openOutcomeModal(i)} type="button">
                            Mark Completed
                          </button>
                        ) : i.status === "completed" ? (
                          <button className="eis-btnPrimary" onClick={() => openOutcomeModal(i)} type="button">
                            Edit Result
                          </button>
                        ) : (
                          <span className="eis-muted"> </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ VIEW DETAILS Modal (Read-only) */}
      {showViewModal && viewInterview && (
        <div className="eis-modalOverlay" onClick={() => setShowViewModal(false)}>
          <div className="eis-modal" onClick={(e) => e.stopPropagation()}>
            <div className="eis-modalHeader">
              <h2 className="eis-modalTitle">Interview Details</h2>
              <button className="eis-modalClose" onClick={() => setShowViewModal(false)} type="button">
                ✕
              </button>
            </div>

            <div className="eis-modalBody">
              <div className="eis-viewBox">
                <div className="eis-viewGrid">
                  <div><b>Job:</b> {viewInterview.job_title}</div>
                  <div><b>Student:</b> {viewInterview.student_name} ({viewInterview.student_student_id})</div>
                  <div><b>Date & Time:</b> {formatDateTime(viewInterview.interview_datetime)}</div>
                  <div><b>Mode:</b> {modeLabel(viewInterview.mode)}</div>
                  <div><b>Status:</b> {viewInterview.status.toUpperCase()}</div>
                  <div><b>Notes:</b> {viewInterview.notes || "—"}</div>
                </div>

                <div className="eis-viewDivider" />

                <div className="eis-viewTitle">Result</div>

                {viewInterview.status !== "completed" ? (
                  <div className="eis-viewMuted">No result yet (interview not completed).</div>
                ) : viewInterview.outcome === "offered" ? (
                  <div className="eis-viewGrid">
                    <div><b>Outcome:</b> Job Offered</div>
                    <div><b>Join Date:</b> {viewInterview.join_date ? String(viewInterview.join_date) : "—"}</div>
                    <div><b>Position Offered:</b> {viewInterview.offered_position || "—"}</div>
                    <div><b>Salary / Allowance:</b> {viewInterview.offered_salary || "—"}</div>
                    <div className="eis-viewSpan2">
                      <b>Offer Notes:</b> {viewInterview.offer_notes || "—"}
                    </div>
                  </div>
                ) : viewInterview.outcome === "not_offered" ? (
                  <div className="eis-viewGrid">
                    <div><b>Outcome:</b> Not Offered</div>
                    <div className="eis-viewSpan2">
                      <b>Reason:</b> {viewInterview.rejection_reason || "—"}
                    </div>
                  </div>
                ) : (
                  <div className="eis-viewMuted">No saved result found.</div>
                )}
              </div>
            </div>

            <div className="eis-modalActions">
              <button className="eis-btnSecondary" onClick={() => setShowViewModal(false)} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ EDIT RESULT Modal (Save) */}
      {showOutcomeModal && selectedInterview && (
        <div className="eis-modalOverlay" onClick={() => setShowOutcomeModal(false)}>
          <div className="eis-modal" onClick={(e) => e.stopPropagation()}>
            <div className="eis-modalHeader">
              <h2 className="eis-modalTitle">Update Interview Result</h2>
              <button className="eis-modalClose" onClick={() => setShowOutcomeModal(false)} type="button">
                ✕
              </button>
            </div>

            <div className="eis-modalBody">
              <div className="eis-modalInfo">
                <div><b>Job:</b> {selectedInterview.job_title}</div>
                <div><b>Student:</b> {selectedInterview.student_name} ({selectedInterview.student_student_id})</div>
                <div><b>Interview:</b> {formatDateTime(selectedInterview.interview_datetime)} • {modeLabel(selectedInterview.mode)}</div>
              </div>

              <div className="eis-formGrid">
                <div className="eis-field">
                  <label className="eis-label">Outcome</label>
                  <select
                    className="eis-select2"
                    value={form.outcome}
                    onChange={(e) => setForm((p) => ({ ...p, outcome: e.target.value as any }))}
                  >
                    <option value="offered">Job Offered</option>
                    <option value="not_offered">Not Offered</option>
                  </select>
                </div>

                {form.outcome === "offered" ? (
                  <>
                    <div className="eis-field">
                      <label className="eis-label">Join Date (optional)</label>
                      <input
                        className="eis-input"
                        type="date"
                        value={form.join_date}
                        onChange={(e) => setForm((p) => ({ ...p, join_date: e.target.value }))}
                      />
                      <div className="eis-hint">Leave empty if join date not confirmed yet.</div>
                    </div>

                    <div className="eis-field">
                      <label className="eis-label">Position Offered</label>
                      <input
                        className="eis-input"
                        value={form.offered_position}
                        onChange={(e) => setForm((p) => ({ ...p, offered_position: e.target.value }))}
                        placeholder="e.g., Junior Developer Intern"
                      />
                    </div>

                    <div className="eis-field">
                      <label className="eis-label">Salary / Allowance</label>
                      <input
                        className="eis-input"
                        value={form.offered_salary}
                        onChange={(e) => setForm((p) => ({ ...p, offered_salary: e.target.value }))}
                        placeholder="e.g., RM800/month"
                      />
                    </div>

                    <div className="eis-field eis-span2">
                      <label className="eis-label">Offer Notes</label>
                      <textarea
                        className="eis-textarea"
                        rows={4}
                        value={form.offer_notes}
                        onChange={(e) => setForm((p) => ({ ...p, offer_notes: e.target.value }))}
                        placeholder="Reporting time, documents needed, contact person, etc."
                      />
                    </div>
                  </>
                ) : (
                  <div className="eis-field eis-span2">
                    <label className="eis-label">Reason for Not Offering</label>
                    <textarea
                      className="eis-textarea"
                      rows={4}
                      value={form.rejection_reason}
                      onChange={(e) => setForm((p) => ({ ...p, rejection_reason: e.target.value }))}
                      placeholder="Example: Skills mismatch, insufficient assessment score, unavailable schedule..."
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="eis-modalActions">
              <button className="eis-btnSecondary" onClick={() => setShowOutcomeModal(false)} type="button">
                Cancel
              </button>
              <button className="eis-btnPrimary" onClick={saveOutcome} type="button" disabled={saving}>
                {saving ? "Saving..." : "Save Result"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}