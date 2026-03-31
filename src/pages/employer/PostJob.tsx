import { useState, useEffect, type ChangeEvent } from "react";
import axios from "axios";
import EmployerMenu from "../../components/menus/EmployerMenu";
import "./PostJob.css";

const API_BASE = "http://localhost:3001";

interface EmployerProfileData {
  id: number;
  company_name: string;
}

export default function PostJob() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);

  const [job, setJob] = useState({
    job_title: "",
    job_type: "",
    category: "",
    work_mode: "",
    description: "",
    requirements: "",
    availability: 1,
  });

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setJob({ ...job, [name]: value });
  };

  const handlePost = async () => {
    if (!job.job_title.trim()) {
      alert("Job title is required");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/employers/jobs`, {
        employer_id: user.id,
        ...job,
      });

      if (response.data.success) {
        alert("Job posted successfully!");

        setJob({
          job_title: "",
          job_type: "",
          category: "",
          work_mode: "",
          description: "",
          requirements: "",
          availability: 1,
        });
      } else {
        alert("Failed to post job");
      }
    } catch (err) {
      console.error("Post Job Error:", err);
      alert("Failed to post job");
    }
  };

  const companyName = profile?.company_name || user.company_name || "Employer";

  return (
    <div className="employer-layout">
      <EmployerMenu companyName={companyName} />

      <div className="content-area">
        <div className="info-box">
          <h2>📝 Before You Post a Job</h2>
          <p>
            Please make sure your company profile is complete and accurate.
            Provide clear details about the internship or job to attract the
            right candidates.
          </p>
          <p>Tips for a successful posting:</p>
          <ul>
            <li>Use a clear and descriptive job title (e.g., “Graphic Design Intern”).</li>
            <li>Include key details such as role responsibilities, duration, and allowance.</li>
            <li>Mention skills or qualifications you’re looking for.</li>
            <li>Ensure all information is truthful and up to date before publishing.</li>
          </ul>
        </div>

        <div className="form-card">
          <h2 style={{ marginTop: 0, marginBottom: 20, color: "#102a43" }}>
            Create Job Posting
          </h2>

          <div className="form-group">
            <label>Job Title :</label>
            <input
              type="text"
              name="job_title"
              value={job.job_title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Job Type / Position Type :</label>
            <input
              type="text"
              name="job_type"
              value={job.job_type}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Job Category / Department :</label>
            <input
              type="text"
              name="category"
              value={job.category}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Work Mode :</label>
            <input
              type="text"
              name="work_mode"
              value={job.work_mode}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Job Description :</label>
            <textarea
              name="description"
              value={job.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Requirements :</label>
            <textarea
              name="requirements"
              value={job.requirements}
              onChange={handleChange}
            />
          </div>

          <button
            className="post-btn"
            onClick={handlePost}
            disabled={!job.job_title.trim()}
          >
            Post Job
          </button>
        </div>
      </div>
    </div>
  );
}