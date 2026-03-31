import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";
import "./StudentViewJobs.css";

type Job = {
  id: number;
  employer_id: number;
  job_title: string;
  company_name: string;
  company_logo?: string;

  description?: string;
  requirements?: string;

  job_type?: string;
  category?: string;
  work_mode?: string;

  status?: "open" | "closed";
  availability?: number;
  created_at?: string;
};

type AiRole = { title: string; reason?: string; skills?: string[] };

const API_BASE = "http://localhost:3001";

function safeText(v: any) {
  return typeof v === "string" ? v : "";
}

function includesAny(text: string, keywords: string[]) {
  const t = safeText(text).toLowerCase();
  return keywords.some((k) => t.includes(String(k || "").toLowerCase()));
}

function isRecommended(job: Job, role: AiRole) {
  const haystack = [
    job.job_title,
    job.category,
    job.work_mode,
    job.job_type,
    job.description,
    job.requirements,
  ]
    .join(" ")
    .toLowerCase();

  const titleHit = haystack.includes((role.title || "").toLowerCase());
  const skillsHit = includesAny(haystack, role.skills || []);
  return titleHit || skillsHit;
}

export default function StudentViewJobs() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [status] = useState<"unemployed" | "employed">(user.status || "unemployed");
  const [username] = useState<string>(user.name || "Student");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [aiRoles, setAiRoles] = useState<AiRole[]>([]);
  const [appliedSet, setAppliedSet] = useState<Set<number>>(new Set());

  const [filterEnabled, setFilterEnabled] = useState(false);
  const [selectedRoleTitle, setSelectedRoleTitle] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      // 1) Jobs
      const jobsRes = await axios.get(`${API_BASE}/api/jobs`);
      setJobs(jobsRes.data.jobs || []);

      // 2) Applied jobs (for Applied button state)
      const appliedRes = await axios.get(
        `${API_BASE}/api/students/${user.id}/applied-jobs`
      );
      const ids = (appliedRes.data.applied || []).map((x: any) => x.job_id);
      setAppliedSet(new Set(ids));

      // 3) AI recommendations (optional filter)
      const recRes = await axios.get(
        `${API_BASE}/api/students/${user.id}/ai-recommendations`
      );
      setAiRoles(recRes.data.recommendations || []);
    })().catch(console.error);
  }, [user?.id]);

  const selectedRole = useMemo(
    () => aiRoles.find((r) => r.title === selectedRoleTitle),
    [aiRoles, selectedRoleTitle]
  );

  const visibleJobs = useMemo(() => {
    return jobs.filter((j) => {
      // If you only want open jobs, keep this:
      if (j.status && j.status !== "open") return false;

      if (!filterEnabled) return true;
      if (!selectedRole) return true;
      return isRecommended(j, selectedRole);
    });
  }, [jobs, filterEnabled, selectedRole]);

  const handleApply = async (jobId: number) => {
    try {
      await axios.post(`${API_BASE}/api/jobs/${jobId}/apply`, {
        studentId: user.id,
      });

      setAppliedSet((prev) => {
        const next = new Set(prev);
        next.add(jobId);
        return next;
      });

      alert("Applied successfully!");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        alert("You already applied for this job.");
        setAppliedSet((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
        return;
      }
      console.error(err);
      alert("Apply failed");
    }
  };

  return (
    <div className="viewjobs-layout">
      <StudentMenu status={status} username={username} />

      <div className="viewjobs-main">
        {/* Optional: top filter row (not in screenshot, but requested) */}
        <div className="viewjobs-topbar">
          <div className="viewjobs-title">View Jobs</div>

          <div className="viewjobs-filter">
            <div className="filter-toggle-wrapper">
  <span className="filter-label">AI Recommended Only</span>

  <label className="switch">
    <input
      type="checkbox"
      checked={filterEnabled}
      onChange={(e) => setFilterEnabled(e.target.checked)}
    />
    <span className="slider"></span>
  </label>
</div>

            <select
              value={selectedRoleTitle}
              onChange={(e) => setSelectedRoleTitle(e.target.value)}
              disabled={!filterEnabled}
            >
              <option value="">All roles</option>
              {aiRoles.map((r) => (
                <option key={r.title} value={r.title}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="jobs-grid">
          {visibleJobs.map((job) => {
            const applied = appliedSet.has(job.id);

            return (
              <div key={job.id} className="job-card">
                <div>
                  <h3 className="job-title">{job.job_title}</h3>
                  <div className="job-company">{job.company_name}</div>

                  <div className="job-section">
                    <div className="job-section-title">Job Description:</div>
                    <div className="job-section-text">
                      {job.description || "—"}
                    </div>
                  </div>

                  <div className="job-section" style={{ marginTop: 18 }}>
                    <div className="job-section-title">Requirements:</div>
                    <div className="job-section-text">
                      {job.requirements || "—"}
                    </div>
                  </div>
                </div>

                <div className="job-actions">
                  <button
                    className={applied ? "btn-applied" : "btn-apply"}
                    disabled={applied}
                    onClick={() => handleApply(job.id)}
                  >
                    {applied ? "Applied" : "Apply Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {visibleJobs.length === 0 && (
          <div className="empty-state">
            No jobs found. Try turning off the filter.
          </div>
        )}
      </div>
    </div>
  );
}