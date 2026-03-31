import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";
import "./StudentInterviewSchedule.css";

const API_BASE = "http://localhost:3001";

type InterviewRow = {
  id: number;
  status: "scheduled" | "attending" | "rejected" | "completed";
  interview_datetime: string;
  mode: "online" | "face_to_face";
  notes?: string;

  job_title: string;
  company_name: string;

  outcome?: "offered" | "not_offered" | null;
  join_date?: string | null;
  offered_position?: string | null;
  offered_salary?: string | null;
  offer_notes?: string | null;
  rejection_reason?: string | null;
};

function modeLabel(m: InterviewRow["mode"]) {
  return m === "face_to_face" ? "Face to Face" : "Online";
}

function safeDate(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return { date: dt, time: "" };
  const date = d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

function statusLabel(s: InterviewRow["status"]) {
  if (s === "scheduled") return "Scheduled";
  if (s === "attending") return "Attending";
  if (s === "rejected") return "Rejected";
  if (s === "completed") return "Completed";
  return s;
}

export default function StudentInterviewSchedule() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user?.id;
  const status = user?.status || "unemployed";
  const username = user?.name || "Student";

  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | InterviewRow["status"]>("all");

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/students/${studentId}/interviews`);
      setInterviews(res.data?.interviews || []);
    } catch (e) {
      console.error(e);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const filtered = useMemo(() => {
    return interviews.filter((i) => (statusFilter === "all" ? true : i.status === statusFilter));
  }, [interviews, statusFilter]);

  // 🔔 upcoming reminders = attending + future
  const upcomingAttending = useMemo(() => {
    const now = new Date();
    return interviews
      .filter((i) => i.status === "attending" && new Date(i.interview_datetime) > now)
      .sort((a, b) => new Date(a.interview_datetime).getTime() - new Date(b.interview_datetime).getTime());
  }, [interviews]);

  const updateStatus = async (interviewId: number, newStatus: "attending" | "rejected") => {
    try {
      await axios.put(`${API_BASE}/api/students/${studentId}/interviews/${interviewId}/status`, {
        status: newStatus,
      });
      fetchInterviews();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  return (
    <div className="sis-layout">
      <StudentMenu status={status} username={username} />

      <div className="sis-main">
        <div className="sis-topbar">
          <div>
            <h1 className="sis-title">Interview Schedule</h1>
            <div className="sis-subtitle">
              Showing <b>{filtered.length}</b> of <b>{interviews.length}</b>
            </div>
          </div>

          <div className="sis-filter">
            <label className="sis-filterLabel">Status</label>
            <select
              className="sis-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="attending">Attending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            <button className="sis-refresh" onClick={fetchInterviews} type="button">
              Refresh
            </button>
          </div>
        </div>

        {/* 🔔 Reminder Section (table stays) */}
        {upcomingAttending.length > 0 && (
          <div className="sis-reminder">
            <div className="sis-reminderHead">
              <div className="sis-reminderTitle">Upcoming Interviews Reminder</div>
              <div className="sis-reminderHint">Only interviews you marked as attending.</div>
            </div>

            <table className="sis-reminderTable">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAttending.map((i) => {
                  const { date, time } = safeDate(i.interview_datetime);
                  return (
                    <tr key={i.id}>
                      <td>{i.company_name}</td>
                      <td>{i.job_title}</td>
                      <td>
                        {date} • {time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Cards list */}
        {loading ? (
          <div className="sis-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="sis-state">No interviews found.</div>
        ) : (
          <div className="sis-cards">
            {filtered.map((i) => {
              const { date, time } = safeDate(i.interview_datetime);

              return (
                <div key={i.id} className="sis-card">
                  <div className="sis-cardTop">
                    <div>
                      <div className="sis-jobTitle">{i.job_title}</div>
                      <div className="sis-company">{i.company_name}</div>
                    </div>

                    <span className={`sis-status ${i.status}`}>{statusLabel(i.status)}</span>
                  </div>

                  <div className="sis-section">
                    <div className="sis-sectionTitle">Interview Scheduled on :</div>
                    <div className="sis-kv">
                      <div className="sis-k"><b>Date</b> :</div>
                      <div className="sis-v">{date}</div>

                      <div className="sis-k"><b>Time</b> :</div>
                      <div className="sis-v">{time}</div>

                      <div className="sis-k"><b>Mode</b> :</div>
                      <div className="sis-v">{modeLabel(i.mode)}</div>
                    </div>
                  </div>

                  <div className="sis-section">
                    <div className="sis-sectionTitle">Notes :</div>
                    <div className="sis-notes">{i.notes?.trim() ? i.notes : "—"}</div>
                  </div>

                  {/* ACTIONS */}
                  <div className="sis-actions">
                    {i.status === "scheduled" ? (
                      <>
                        <button
                          className="sis-btn accept"
                          onClick={() => updateStatus(i.id, "attending")}
                          type="button"
                        >
                          Accept
                        </button>
                        <button
                          className="sis-btn reject"
                          onClick={() => updateStatus(i.id, "rejected")}
                          type="button"
                        >
                          Reject
                        </button>
                      </>
                    ) : i.status === "attending" ? (
                      <>
                        <button className="sis-btn ghost" type="button" disabled>
                          You marked: Attending
                        </button>
                      </>
                    ) : i.status === "rejected" ? (
                      <>
                        <button className="sis-btn ghost danger" type="button" disabled>
                          You rejected this interview
                        </button>
                      </>
                    ) : (
                      // completed
                      <div className="sis-resultBox">
                        {i.outcome === "offered" ? (
                          <>
                            <div className="sis-resultMain">Result: Job Offered</div>
                            <div className="sis-resultSub">
                              {i.offered_position ? `Position: ${i.offered_position}` : ""}
                              {i.offered_salary ? ` • Salary: ${i.offered_salary}` : ""}
                              {i.join_date ? ` • Join: ${i.join_date}` : ""}
                            </div>
                            {i.offer_notes ? <div className="sis-resultNote">{i.offer_notes}</div> : null}
                          </>
                        ) : (
                          <>
                            <div className="sis-resultMain">Result: Not Offered</div>
                            <div className="sis-resultNote">{i.rejection_reason || "—"}</div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}