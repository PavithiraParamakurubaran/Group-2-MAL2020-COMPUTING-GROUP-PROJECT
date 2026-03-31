import { useState, useEffect, type ChangeEvent, useMemo } from "react";
import axios from "axios";
import EmployerMenu from "../../components/menus/EmployerMenu";
import "./JobListing.css";

const API_BASE = "http://localhost:3001";

interface EmployerProfileData {
  id: number;
  company_name: string;
}

interface Job {
  id: number;
  job_title: string;
  job_type: string;
  category: string;
  work_mode: string;
  description: string;
  requirements: string;
  availability: number;
  status: "open" | "closed";
}

export default function JobListing() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/employers/${user.id}/jobs`);
      const mappedJobs = (res.data.jobs || []).map((job: any) => ({
        ...job,
        availability: job.status === "open" ? 1 : 0,
      }));
      setJobs(mappedJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const counts = useMemo(() => {
    const open = jobs.filter((j) => j.status === "open").length;
    const closed = jobs.length - open;
    return { total: jobs.length, open, closed };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus =
        statusFilter === "all" ? true : job.status === statusFilter;

      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        job.job_title?.toLowerCase().includes(q) ||
        job.job_type?.toLowerCase().includes(q) ||
        job.category?.toLowerCase().includes(q) ||
        job.work_mode?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [jobs, statusFilter, searchTerm]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!editJob) return;
    const { name, value } = e.target;
    setEditJob({ ...editJob, [name]: value } as Job);
  };

  const openEdit = (job: Job) => {
    setEditJob({ ...job });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditJob(null);
  };

  const handleSave = async () => {
    if (!editJob) return;

    try {
      setSaving(true);

      await axios.put(`${API_BASE}/api/jobs/${editJob.id}`, {
        job_title: editJob.job_title,
        job_type: editJob.job_type,
        category: editJob.category,
        work_mode: editJob.work_mode,
        description: editJob.description,
        requirements: editJob.requirements,
        status: editJob.status,
      });

      setShowModal(false);
      setEditJob(null);
      fetchJobs();
      alert("Job updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (job: Job) => {
    try {
      const newStatus = job.status === "open" ? "closed" : "open";
      await axios.put(`${API_BASE}/api/jobs/${job.id}/status`, { status: newStatus });
      fetchJobs();
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Failed to update availability");
    }
  };

  const companyName = profile?.company_name || user.company_name || "Employer";

  return (
    <div className="jl-layout">
      <EmployerMenu companyName={companyName} />

      <div className="jl-main">
        <div className="jl-topbar">
          <div>
            <h2 className="jl-title">Jobs Listing</h2>
            <div className="jl-subtitle">
              Showing <b>{filteredJobs.length}</b> of <b>{counts.total}</b> job(s) •{" "}
              <b>{counts.open}</b> open • <b>{counts.closed}</b> closed
            </div>
          </div>

          <button className="jl-btnGhost" onClick={fetchJobs} type="button">
            Refresh
          </button>
        </div>

        <div className="jl-filters">
          <div className="jl-filter">
            <label className="jl-filterLabel">Status</label>
            <select
              className="jl-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "open" | "closed")}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="jl-filter jl-filterSearch">
            <label className="jl-filterLabel">Search Job</label>
            <input
              className="jl-input"
              type="text"
              placeholder="Search by title, type, category, or mode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="jl-btnGhost"
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setSearchTerm("");
            }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="jl-empty">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="jl-empty">No jobs found for the selected filters.</div>
        ) : (
          <div className="jl-grid">
            {filteredJobs.map((job) => {
              const isOpen = job.status === "open";

              return (
                <div className="jl-card" key={job.id}>
                  <div className="jl-cardTop">
                    <div className="jl-cardTitleWrap">
                      <h3 className="jl-cardTitle">{job.job_title}</h3>

                      <div className="jl-metaRow">
                        <span className="jl-meta">{job.job_type || "—"}</span>
                        <span className="jl-dot">•</span>
                        <span className="jl-meta">{job.category || "—"}</span>
                        <span className="jl-dot">•</span>
                        <span className="jl-meta">{job.work_mode || "—"}</span>
                      </div>

                      <span className={`jl-badge ${isOpen ? "open" : "closed"}`}>
                        {isOpen ? "OPEN" : "CLOSED"}
                      </span>
                    </div>
                  </div>

                  <div className="jl-section">
                    <div className="jl-sectionLabel">Description</div>
                    <div className="jl-sectionText">{job.description || "—"}</div>
                  </div>

                  <div className="jl-section">
                    <div className="jl-sectionLabel">Requirements</div>
                    <div className="jl-sectionText">{job.requirements || "—"}</div>
                  </div>

                  <div className="jl-actions">
                    <button className="jl-btnPrimary" onClick={() => openEdit(job)} type="button">
                      Edit
                    </button>

                    <button
                      className={isOpen ? "jl-btnDanger" : "jl-btnSuccess"}
                      onClick={() => toggleAvailability(job)}
                      type="button"
                    >
                      {isOpen ? "Close Application" : "Reopen Application"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && editJob && (
          <div className="jl-modalOverlay" onClick={closeModal}>
            <div className="jl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="jl-modalHeader">
                <div>
                  <div className="jl-modalTitle">Edit Job</div>
                  <div className="jl-modalSub">{editJob.job_title}</div>
                </div>

                <button className="jl-modalClose" onClick={closeModal} type="button">
                  ✕
                </button>
              </div>

              <div className="jl-form">
                <div className="jl-field">
                  <label className="jl-label">Job Title</label>
                  <input
                    className="jl-input"
                    name="job_title"
                    value={editJob.job_title}
                    onChange={handleChange}
                  />
                </div>

                <div className="jl-field">
                  <label className="jl-label">Job Type</label>
                  <input
                    className="jl-input"
                    name="job_type"
                    value={editJob.job_type}
                    onChange={handleChange}
                  />
                </div>

                <div className="jl-field">
                  <label className="jl-label">Category</label>
                  <input
                    className="jl-input"
                    name="category"
                    value={editJob.category}
                    onChange={handleChange}
                  />
                </div>

                <div className="jl-field">
                  <label className="jl-label">Work Mode</label>
                  <input
                    className="jl-input"
                    name="work_mode"
                    value={editJob.work_mode}
                    onChange={handleChange}
                  />
                </div>

                <div className="jl-field jl-span2">
                  <label className="jl-label">Description</label>
                  <textarea
                    className="jl-textarea"
                    name="description"
                    value={editJob.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="jl-field jl-span2">
                  <label className="jl-label">Requirements</label>
                  <textarea
                    className="jl-textarea"
                    name="requirements"
                    value={editJob.requirements}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>

              <div className="jl-modalActions">
                <button className="jl-btnGhost" onClick={closeModal} type="button">
                  Cancel
                </button>
                <button className="jl-btnPrimary" onClick={handleSave} type="button" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}