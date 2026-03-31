import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import EmployerMenu from "../../components/menus/EmployerMenu";
import "./EmployerViewApplication.css";

const API_BASE = "http://localhost:3001";

interface EmployerProfileData {
  id: number;
  company_name: string;
}

type ApplicationRow = {
  application_id: number;
  job_id: number;
  job_title: string;

  student_id: number;
  student_name: string;
  student_student_id: string;
  course: string;
  student_email: string;
  contact_number: string;

  assessment_result?: string;
  resume_url?: string;
  status: "applied" | "pending" | "accepted" | "rejected" | "reviewed" | "shortlisted";
};

function normalizeStatus(s: string) {
  const v = (s || "").toLowerCase();
  if (v === "applied" || v === "pending" || v === "") return "pending";
  if (v === "accepted") return "accepted";
  if (v === "rejected") return "rejected";
  if (v === "reviewed") return "reviewed";
  if (v === "shortlisted") return "shortlisted";
  return "pending";
}

type InterviewMode = "online" | "face_to_face";

export default function EmployerViewApplication() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [jobFilter, setJobFilter] = useState<"all" | string>("all"); // job_id as string

  // ✅ Interview modal state
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationRow | null>(null);

  const [interviewDatetime, setInterviewDatetime] = useState("");
  const [interviewMode, setInterviewMode] = useState<InterviewMode>("online");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [savingInterview, setSavingInterview] = useState(false);

  // ✅ Fetch employer profile for menu companyName
  useEffect(() => {
    const fetchEmployerProfile = async () => {
      try {
        if (!user?.id) return;
        const res = await axios.get(`${API_BASE}/api/employers/profile/${user.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Fetch employer profile error:", err);
      }
    };
    fetchEmployerProfile();
  }, [user?.id]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/employers/${user.id}/applications`);
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const updateStatus = async (applicationId: number, status: "accepted" | "rejected") => {
    try {
      await axios.put(`${API_BASE}/api/applications/${applicationId}/status`, { status });
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  // ✅ Open schedule modal
  const openScheduleModal = (a: ApplicationRow) => {
    setSelectedApp(a);
    setInterviewDatetime("");
    setInterviewMode("online");
    setInterviewNotes("");
    setShowSchedule(true);
  };

  // ✅ Save interview then accept
  const saveInterviewAndAccept = async () => {
    if (!selectedApp) return;

    if (!interviewDatetime) {
      alert("Please select interview date & time");
      return;
    }

    try {
      setSavingInterview(true);

      // 1) accept application
      await axios.put(`${API_BASE}/api/applications/${selectedApp.application_id}/status`, {
        status: "accepted",
      });

      // 2) create interview schedule
      await axios.post(`${API_BASE}/api/employers/${user.id}/interviews`, {
        job_id: selectedApp.job_id,
        student_id: selectedApp.student_id,
        application_id: selectedApp.application_id,
        interview_datetime: interviewDatetime, // datetime-local format
        mode: interviewMode,
        notes: interviewNotes,
      });

      setShowSchedule(false);
      setSelectedApp(null);
      fetchApplications();
      alert("Interview scheduled + Application accepted ✅");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to schedule interview");
    } finally {
      setSavingInterview(false);
    }
  };

  const companyName = profile?.company_name || "Employer";

  // ✅ Dropdown options: unique jobs from applications
  const jobOptions = useMemo(() => {
    const map = new Map<number, string>();
    applications.forEach((a) => {
      if (!map.has(a.job_id)) map.set(a.job_id, a.job_title);
    });
    return Array.from(map.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [applications]);

  // ✅ Filtered list
  const filteredApplications = useMemo(() => {
    return applications.filter((a) => {
      const s = normalizeStatus(a.status);

      const statusOk = statusFilter === "all" ? true : s === statusFilter;
      const jobOk = jobFilter === "all" ? true : String(a.job_id) === String(jobFilter);

      return statusOk && jobOk;
    });
  }, [applications, statusFilter, jobFilter]);

  const totalCount = applications.length;
  const filteredCount = filteredApplications.length;

  return (
    <div className="eva-layout">
      <EmployerMenu companyName={companyName} />

      <div className="eva-main">
        <div className="eva-topbar">
          <div>
            <h1 className="eva-title">Job Application</h1>
            <div className="eva-subtitle">
              Showing <b>{filteredCount}</b> of <b>{totalCount}</b> applications
            </div>
          </div>

          {/* ✅ Filters */}
          <div className="eva-filters">
            <div className="eva-filter">
              <label className="eva-filter-label">Status</label>
              <select
                className="eva-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="eva-filter">
              <label className="eva-filter-label">Job</label>
              <select
                className="eva-select"
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              >
                <option value="all">All Jobs</option>
                {jobOptions.map((j) => (
                  <option key={j.id} value={String(j.id)}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="eva-clear"
              onClick={() => {
                setStatusFilter("all");
                setJobFilter("all");
              }}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="eva-loading">Loading...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="eva-empty">No applications found for the selected filters.</div>
        ) : (
          <div className="eva-list">
            {filteredApplications.map((a) => {
              const uiStatus = normalizeStatus(a.status);
              const resumeHref = a.resume_url ? `${API_BASE}${a.resume_url}` : "";

              return (
                <div key={a.application_id} className="eva-card">
                  {/* LEFT */}
                  <div className="eva-left">
                    <div className="eva-jobtitle-row">
                      <h2 className="eva-jobtitle">{a.job_title}</h2>
                      <span className={`eva-status ${uiStatus}`}>{uiStatus.toUpperCase()}</span>
                    </div>

                    <div className="eva-fields">
                      <div className="eva-field">
                        <span className="eva-label">Student Name :</span>
                        <span className="eva-value">{a.student_name}</span>
                      </div>

                      <div className="eva-field">
                        <span className="eva-label">Student ID :</span>
                        <span className="eva-value">{a.student_student_id}</span>
                      </div>

                      <div className="eva-field">
                        <span className="eva-label">Course :</span>
                        <span className="eva-value">{a.course}</span>
                      </div>

                      <div className="eva-field">
                        <span className="eva-label">Student Email :</span>
                        <span className="eva-value">{a.student_email}</span>
                      </div>

                      <div className="eva-field">
                        <span className="eva-label">Contact Number :</span>
                        <span className="eva-value">{a.contact_number}</span>
                      </div>

                      <div className="eva-field">
                        <span className="eva-label">Assessment Result :</span>
                        <span className="eva-value">{a.assessment_result || "—"}</span>
                      </div>
                    </div>

                    <div className="eva-actions">
                      <button
                        className="btn-accept"
                        onClick={() => openScheduleModal(a)}
                        disabled={uiStatus === "accepted"}
                        title={uiStatus === "accepted" ? "Already accepted" : "Accept + Schedule"}
                        type="button"
                      >
                        Accept + Schedule
                      </button>

                      <button
                        className="btn-reject"
                        onClick={() => updateStatus(a.application_id, "rejected")}
                        disabled={uiStatus === "rejected"}
                        title={uiStatus === "rejected" ? "Already rejected" : "Reject"}
                        type="button"
                      >
                        Reject Application
                      </button>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="eva-right">
                    <div className="resume-preview-employer">
                      {resumeHref ? (
                        <iframe
                          src={`${resumeHref}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          className="resume-mini-preview"
                          title="Resume Preview"
                        />
                      ) : (
                        <div className="resume-preview-text">No Resume</div>
                      )}
                    </div>

                    <a
                      className={`btn-view ${resumeHref ? "" : "disabled"}`}
                      href={resumeHref || "#"}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (!resumeHref) e.preventDefault();
                      }}
                    >
                      View Resume
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Schedule Interview Modal */}
      {showSchedule && selectedApp && (
        <div className="eva-modal-overlay" onClick={() => setShowSchedule(false)}>
          <div className="eva-modal" onClick={(e) => e.stopPropagation()}>
            <div className="eva-modal-header">
              <h2 className="eva-modal-title">Schedule Interview</h2>
              <button className="eva-modal-close" onClick={() => setShowSchedule(false)} type="button">
                ✕
              </button>
            </div>

            <div className="eva-modal-body">
              <div className="eva-modal-row">
                <div className="eva-modal-label">Job</div>
                <div className="eva-modal-value">{selectedApp.job_title}</div>
              </div>

              <div className="eva-modal-row">
                <div className="eva-modal-label">Student</div>
                <div className="eva-modal-value">
                  {selectedApp.student_name} ({selectedApp.student_student_id})
                </div>
              </div>

              <div className="eva-modal-grid">
                <div className="eva-modal-field">
                  <label className="eva-modal-label2">Interview Date & Time</label>
                  <input
                    className="eva-input"
                    type="datetime-local"
                    value={interviewDatetime}
                    onChange={(e) => setInterviewDatetime(e.target.value)}
                  />
                </div>

                <div className="eva-modal-field">
                  <label className="eva-modal-label2">Mode</label>
                  <select
                    className="eva-select"
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value as InterviewMode)}
                  >
                    <option value="online">Online</option>
                    <option value="face_to_face">Face to Face</option>
                  </select>
                </div>
              </div>

              <div className="eva-modal-field">
                <label className="eva-modal-label2">Notes (optional)</label>
                <textarea
                  className="eva-textarea"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Example: Google Meet link / office address / documents to bring..."
                  rows={4}
                />
              </div>
            </div>

            <div className="eva-modal-actions">
              <button className="eva-btn-secondary" onClick={() => setShowSchedule(false)} type="button">
                Cancel
              </button>
              <button
                className="eva-btn-primary"
                onClick={saveInterviewAndAccept}
                type="button"
                disabled={savingInterview}
              >
                {savingInterview ? "Saving..." : "Save Interview & Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}