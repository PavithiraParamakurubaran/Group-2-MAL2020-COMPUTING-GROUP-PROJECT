import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import EmployerMenu from "../../components/menus/EmployerMenu";
import "./EmployerDashboard.css";

const API_BASE = "http://localhost:3001";

type EmployerProfileData = {
  id: number;
  company_name: string;
  email: string;
  contact_number?: string;
  headquarters?: string;
  office_hours?: string;
  description?: string;
  company_logo?: string;
  website_url?: string;
};

type ApplicationRow = {
  application_id: number;
  job_id: number;
  job_title: string;
  status: string; // applied/pending/accepted/rejected/reviewed/shortlisted
};

type InterviewRow = {
  id: number;
  status: "scheduled" | "attending" | "rejected" | "completed";
  interview_datetime: string;
  mode: "online" | "face_to_face";
  notes?: string;

  job_title: string;
  student_name: string;
};

type EmployerReminder = {
  id: number;
  title: string;
  reminder_date: string; // YYYY-MM-DD
  notes?: string | null;
  is_done: 0 | 1;
};

function normalizeStatus(s: string) {
  const v = (s || "").toLowerCase();
  if (v === "applied" || v === "pending" || v === "") return "pending";
  if (v === "accepted") return "accepted";
  if (v === "rejected") return "rejected";
  return "pending";
}

function fmtMode(m: string) {
  if (m === "face_to_face") return "Face to Face";
  if (m === "online") return "Online";
  return m;
}

function formatDateTime(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

export default function EmployerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employerId = user?.id;

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  // reminders
  const [reminders, setReminders] = useState<EmployerReminder[]>([]);
  const [remFilter, setRemFilter] = useState<"open" | "done" | "all">("open");
  const [remTitle, setRemTitle] = useState("");
  const [remDate, setRemDate] = useState("");
  const [remNotes, setRemNotes] = useState("");
  const [remSaving, setRemSaving] = useState(false);

  // 1) Fetch profile + applications + interviews
  useEffect(() => {
    const run = async () => {
      if (!employerId) return;

      try {
        setLoading(true);

        const [pRes, aRes, iRes] = await Promise.all([
          axios.get(`${API_BASE}/api/employers/profile/${employerId}`),
          axios.get(`${API_BASE}/api/employers/${employerId}/applications`),
          axios.get(`${API_BASE}/api/employers/${employerId}/interviews`),
        ]);

        setProfile(pRes.data);
        setApplications(aRes.data?.applications || []);
        setInterviews(iRes.data?.interviews || []);
      } catch (e) {
        console.error(e);
        setProfile(null);
        setApplications([]);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [employerId]);

  // 2) Reminders fetch
  const fetchReminders = async () => {
    if (!employerId) return;
    try {
      const res = await axios.get(
        `${API_BASE}/api/employers/${employerId}/reminders?status=${remFilter}`
      );
      setReminders(res.data?.reminders || []);
    } catch (e) {
      console.error(e);
      setReminders([]);
    }
  };

  useEffect(() => {
    if (!employerId) return;
    fetchReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employerId, remFilter]);

  const companyName = profile?.company_name || "Employer";

  // Progress counts
  const counts = useMemo(() => {
    const totalApplications = applications.length;

    const scheduledCount = interviews.filter(
      (x) => x.status === "scheduled" || x.status === "attending"
    ).length;

    const completedCount = interviews.filter((x) => x.status === "completed").length;

    const accepted = applications.filter((a) => normalizeStatus(a.status) === "accepted").length;
    const rejected = applications.filter((a) => normalizeStatus(a.status) === "rejected").length;
    const pending = applications.filter((a) => normalizeStatus(a.status) === "pending").length;

    return {
      totalApplications,
      scheduledCount,
      completedCount,
      accepted,
      rejected,
      pending,
    };
  }, [applications, interviews]);

  // Upcoming interviews (top 3)
  const upcoming = useMemo(() => {
    const now = new Date().getTime();
    return interviews
      .filter((x) => x.status !== "completed" && new Date(x.interview_datetime).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.interview_datetime).getTime() -
          new Date(b.interview_datetime).getTime()
      )
      .slice(0, 3);
  }, [interviews]);

  const bannerLogo = profile?.company_logo ? `${API_BASE}${profile.company_logo}` : "";

  // Create reminder
  const handleReminderSubmit = async () => {
    if (!remTitle.trim() || !remDate) {
      alert("Please enter title and date.");
      return;
    }

    try {
      setRemSaving(true);

      await axios.post(`${API_BASE}/api/employers/${employerId}/reminders`, {
        title: remTitle,
        reminder_date: remDate,
        notes: remNotes || null,
      });

      setRemTitle("");
      setRemDate("");
      setRemNotes("");

      fetchReminders();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to create reminder");
    } finally {
      setRemSaving(false);
    }
  };

  // Mark done / reopen
  const toggleDone = async (r: EmployerReminder) => {
    try {
      await axios.put(`${API_BASE}/api/employers/${employerId}/reminders/${r.id}`, {
        is_done: r.is_done ? 0 : 1,
      });
      fetchReminders();
    } catch (e) {
      console.error(e);
      alert("Failed to update reminder");
    }
  };

  // Delete reminder
  const deleteReminder = async (id: number) => {
    if (!confirm("Delete this reminder?")) return;

    try {
      await axios.delete(`${API_BASE}/api/employers/${employerId}/reminders/${id}`);
      fetchReminders();
    } catch (e) {
      console.error(e);
      alert("Failed to delete reminder");
    }
  };

  return (
    <div className="ed-layout">
      <EmployerMenu companyName={companyName} />

      <div className="ed-main">
        {/* Welcome */}
        <div className="ed-welcomeRow">
          <div className="ed-welcomeText">
            <div className="ed-welcomeTitle">
              Welcome back, <b>{companyName}</b> — Ready to land your dream internship?
            </div>
            <div className="ed-welcomeSub">
              Quick view of applications, interviews, and reminders.
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="ed-banner">
          <div className="ed-bannerOverlay" />

          <div className="ed-bannerContent">
            <div className="ed-bannerLeft">
              {bannerLogo ? (
                <img className="ed-companyLogo" src={bannerLogo} alt="logo" />
              ) : (
                <div className="ed-companyLogoFallback">{companyName?.slice(0, 1) || "C"}</div>
              )}

              <div className="ed-bannerInfo">
                <div className="ed-companyName">{companyName}</div>
                <div className="ed-companyDesc">
                  {profile?.description || "Add a short description in Company Profile to show here."}
                </div>
              </div>
            </div>

            <div className="ed-bannerRight">
              <div className="ed-miniRow">
                <span className="ed-miniLabel">Address</span>
                <span className="ed-miniValue">{profile?.headquarters || "—"}</span>
              </div>
              <div className="ed-miniRow">
                <span className="ed-miniLabel">Contact</span>
                <span className="ed-miniValue">{profile?.contact_number || "—"}</span>
              </div>
              <div className="ed-miniRow">
                <span className="ed-miniLabel">Email</span>
                <span className="ed-miniValue">{profile?.email || "—"}</span>
              </div>
              <div className="ed-miniRow">
                <span className="ed-miniLabel">Office Hours</span>
                <span className="ed-miniValue">{profile?.office_hours || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="ed-sectionTitle">Progress</div>

        <div className="ed-cards">
          <div className="ed-card">
            <div className="ed-cardLabel">Jobs Application</div>
            <div className="ed-cardValue">{loading ? "—" : counts.totalApplications}</div>
          </div>

          <div className="ed-card">
            <div className="ed-cardLabel">Interview Scheduled</div>
            <div className="ed-cardValue">{loading ? "—" : counts.scheduledCount}</div>
          </div>

          <div className="ed-card">
            <div className="ed-cardLabel">Interview Completed</div>
            <div className="ed-cardValue">{loading ? "—" : counts.completedCount}</div>
          </div>
        </div>

        {/* Two Columns */}
        <div className="ed-twoCol">
          {/* Left */}
          <div className="ed-panel">
            <div className="ed-panelTitle">Upcoming Interviews</div>

            {upcoming.length === 0 ? (
              <div className="ed-muted">No upcoming interviews.</div>
            ) : (
              <div className="ed-upcomingList">
                {upcoming.map((u) => (
                  <div className="ed-upItem" key={u.id}>
                    <div className="ed-upMain">{u.job_title}</div>
                    <div className="ed-upSub">
                      {u.student_name} • {formatDateTime(u.interview_datetime)} • {fmtMode(u.mode)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="ed-miniStats">
              <div className="ed-miniStat">
                <div className="ed-miniStatLabel">Accepted</div>
                <div className="ed-miniStatValue">{loading ? "—" : counts.accepted}</div>
              </div>
              <div className="ed-miniStat">
                <div className="ed-miniStatLabel">Pending</div>
                <div className="ed-miniStatValue">{loading ? "—" : counts.pending}</div>
              </div>
              <div className="ed-miniStat">
                <div className="ed-miniStatLabel">Rejected</div>
                <div className="ed-miniStatValue">{loading ? "—" : counts.rejected}</div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="ed-panel">
            <div className="ed-panelTitleRow">
              <div className="ed-panelTitle">Reminder</div>

              <select
                className="ed-filterSelect"
                value={remFilter}
                onChange={(e) => setRemFilter(e.target.value as any)}
              >
                <option value="open">Open</option>
                <option value="done">Done</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* Reminder List */}
            {reminders.length === 0 ? (
              <div className="ed-muted">No reminders.</div>
            ) : (
              <div className="ed-remList">
                {reminders.map((r) => (
                  <div className={`ed-remItem ${r.is_done ? "done" : ""}`} key={r.id}>
                    <div className="ed-remMain">
                      <div className="ed-remTitle">{r.title}</div>
                      <div className="ed-remDate">{String(r.reminder_date)}</div>
                      {r.notes ? <div className="ed-remNotes">{r.notes}</div> : null}
                    </div>

                    <div className="ed-remActions">
                      <button className="ed-remBtn" onClick={() => toggleDone(r)} type="button">
                        {r.is_done ? "Reopen" : "Done"}
                      </button>
                      <button className="ed-remBtn danger" onClick={() => deleteReminder(r.id)} type="button">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Reminder */}
            <div className="ed-addTitle">Add Reminder</div>

            <div className="ed-form">
              <label className="ed-label">Title</label>
              <input
                className="ed-input"
                value={remTitle}
                onChange={(e) => setRemTitle(e.target.value)}
                placeholder="e.g., Call candidate / Interview prep"
              />

              <label className="ed-label">Choose Date</label>
              <input
                className="ed-input"
                type="date"
                value={remDate}
                onChange={(e) => setRemDate(e.target.value)}
              />

              <label className="ed-label">Notes (optional)</label>
              <textarea
                className="ed-textarea"
                rows={3}
                value={remNotes}
                onChange={(e) => setRemNotes(e.target.value)}
                placeholder="Extra info: time, location, candidate name..."
              />

              <button className="ed-submit" onClick={handleReminderSubmit} type="button" disabled={remSaving}>
                {remSaving ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}