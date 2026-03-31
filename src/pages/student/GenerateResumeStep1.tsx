import { useEffect, useState } from "react";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import axios from "axios";
import "./GenerateResume.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";

interface Education {
  institution: string;
  degree: string;
  major: string;
  cgpa: string;
}
interface Project {
  title: string;
  description: string;
  tools: string;
  role: string;
}
interface Experience {
  organization: string;
  position: string;
  duration: string;
  responsibilities: string;
}

const API_BASE = "http://localhost:3001";

function parseJsonSafeArray(input: any): any[] {
  if (input === null || input === undefined) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "object") return [input];

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return [];
    try {
      let parsed: any = JSON.parse(s);
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {}
      }
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
      return [];
    } catch {
      return [];
    }
  }
  return [];
}

function redirectToStep(
  navigate: any,
  resumeId: number,
  currentStep: number,
  progress: number
) {
  const step = Number(currentStep) || 1;
  const prog = Number(progress) || 0;

  console.log("redirectToStep => step:", step, "progress:", prog, "resumeId:", resumeId);

  if (step >= 5 || prog >= 100) {
    navigate(`/student/resume/step5/instructions/${resumeId}`, { replace: true });
    return true;
  }
  if (step === 4) {
    navigate(`/student/resume/step4/instructions/${resumeId}`, { replace: true });
    return true;
  }
  if (step === 3) {
    navigate(`/student/generate-resume-step3-instructions/${resumeId}`, { replace: true });
    return true;
  }
  if (step === 2) {
    navigate(`/student/resume/step2instructions/${resumeId}`, { replace: true });
    return true;
  }

  return false;
}

export default function GenerateResumeStep1() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [status] = useState<"unemployed" | "employed">(user.status || "unemployed");
  const [username] = useState(user.name || "Student");
  const navigate = useNavigate();
  const { resumeId: resumeIdParam } = useParams();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const fromStep5 = query.get("fromStep5") === "1";

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    contactNumber: "",
    email: "",
    linkedin: "",
    github: "",
    address: "",
    careerObjective:
      "e.g., Motivated computer science student seeking an internship opportunity and willing to learn and contribute effectively.",
    course: "",
    education: [{ institution: "", degree: "", major: "", cgpa: "" }] as Education[],
    technicalSkills: "",
    softSkills: "",
    languages: "",
    projects: [{ title: "", description: "", tools: "", role: "" }] as Project[],
    experiences: [{ organization: "", position: "", duration: "", responsibilities: "" }] as Experience[],
  });

  const [resumeId, setResumeId] = useState<number | null>(
    resumeIdParam ? Number(resumeIdParam) : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);

        const localUserId = Number(user?.id);
        console.log("LOCAL user:", user);
        console.log("local user.id:", localUserId);

        if (!Number.isFinite(localUserId) || localUserId <= 0) {
          console.error("Invalid local user.id - cannot continue");
          return;
        }

        // 1) Fetch student profile from students table
        const studentRes = await axios.get(`${API_BASE}/api/students/${localUserId}`);
        const studentData = studentRes.data || {};
        const realStudentId = Number(studentData?.id);

        console.log("STUDENT PROFILE:", studentData);
        console.log("realStudentId:", realStudentId);

        if (!Number.isFinite(realStudentId) || realStudentId <= 0) {
          console.error("Cannot resolve realStudentId from /api/students/:id");
          return;
        }

        // Prefill basic data from students table
        setFormData((prev) => ({
          ...prev,
          fullName: studentData.name || "",
          contactNumber: studentData.contact_number || "",
          email: studentData.email || "",
          gender:
            studentData.gender === "male"
              ? "Male"
              : studentData.gender === "female"
              ? "Female"
              : "",
          course: studentData.course || "",
        }));

        let id = resumeIdParam ? Number(resumeIdParam) : null;
        let currentStep = 1;
        let progress = 0;

        if (!id || !Number.isFinite(id)) {
          const createRes = await axios.post(`${API_BASE}/api/resume/create`, {
            studentId: realStudentId,
          });

          console.log("CREATE RES:", createRes.data);

          id = Number(createRes.data.resumeId);
          currentStep = Number(createRes.data.currentStep ?? createRes.data.current_step ?? 1);
          progress = Number(createRes.data.progress ?? 0);
        } else {
          const progressRes = await axios.get(`${API_BASE}/api/resume/progress/${realStudentId}`);
          currentStep = Number(progressRes.data.currentStep ?? 1);
          progress = Number(progressRes.data.progress ?? 0);
        }

        setResumeId(id);

        // redirect only if NOT editing from step 5
        if (!fromStep5 && id) {
          const redirected = redirectToStep(navigate, id, currentStep, progress);
          if (redirected) return;
        }

        // 3) Load saved step1 data
        if (id) {
          const step1Res = await axios.get(`${API_BASE}/api/resume/step1/${id}`);
          const stepData = step1Res.data?.data || null;

          if (stepData) {
            const eduArr = parseJsonSafeArray(stepData.education);
            const projArr = parseJsonSafeArray(stepData.projects);
            const expArr = parseJsonSafeArray(stepData.experience);

            setFormData((prev) => ({
              ...prev,
              fullName: stepData.full_name || prev.fullName,
              dob: stepData.dob || "",
              gender: stepData.gender || prev.gender,
              contactNumber: stepData.phone || prev.contactNumber,
              email: stepData.email || prev.email,
              linkedin: stepData.linkedin || "",
              github: stepData.github || "",
              address: stepData.address || "",
              careerObjective: stepData.career_objective || prev.careerObjective,
              course: stepData.course || prev.course,
              education: eduArr.length
                ? eduArr
                : [{ institution: "", degree: "", major: "", cgpa: "" }],
              technicalSkills: stepData.technical_skills || "",
              softSkills: stepData.soft_skills || "",
              languages: stepData.languages || "",
              projects: projArr.length
                ? projArr
                : [{ title: "", description: "", tools: "", role: "" }],
              experiences: expArr.length
                ? expArr
                : [{ organization: "", position: "", duration: "", responsibilities: "" }],
            }));
          }
        }
      } catch (err) {
        console.error("Fetch Resume Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number,
    field?: keyof Education | keyof Project | keyof Experience,
    type?: "education" | "projects" | "experiences"
  ) => {
    const { name, value } = e.target;

    if (type && index !== undefined) {
      const arr = [...(formData[type] as any[])];
      arr[index][field as string] = value;

      if (type === "education" && field === "degree" && index === 0) {
        setFormData({ ...formData, [type]: arr, course: value });
      } else {
        setFormData({ ...formData, [type]: arr });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/api/resume/upload`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.extractedData) {
        setFormData((prev) => ({ ...prev, ...res.data.extractedData }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to extract data from resume.");
    }
  };

  const saveStep1 = async (isDraft = false) => {
    if (!resumeId) return false;

    const autoCourse =
      formData.course?.trim() || formData.education?.[0]?.degree?.trim() || "";

    try {
      await axios.post(`${API_BASE}/api/resume/step1/save`, {
        resumeId,
        fullName: formData.fullName,
        dob: formData.dob,
        gender: formData.gender,
        contactNumber: formData.contactNumber,
        email: formData.email,
        linkedin: formData.linkedin,
        github: formData.github,
        address: formData.address,
        careerObjective: formData.careerObjective,
        course: autoCourse,
        education: formData.education,
        technicalSkills: formData.technicalSkills,
        softSkills: formData.softSkills,
        languages: formData.languages,
        projects: formData.projects,
        experiences: formData.experiences,
        draft: isDraft,
      });

      alert(isDraft ? "Draft Saved!" : "Step 1 saved!");
      return true;
    } catch (err) {
      console.error(err);
      alert("Failed to save Step 1");
      return false;
    }
  };

  const handleNextStep = async () => {
    const saved = await saveStep1(false);
    if (!saved || !resumeId) {
      alert("Resume ID not found");
      return;
    }

    if (fromStep5) {
      navigate(`/student/resume/step5/instructions/${resumeId}`);
    } else {
      navigate(`/student/resume/step2instructions/${resumeId}`);
    }
  };

  const addProject = () =>
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: "", description: "", tools: "", role: "" }],
    }));

  const addExperience = () =>
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { organization: "", position: "", duration: "", responsibilities: "" },
      ],
    }));

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <StudentMenu status={status} username={username} />
        <div className="resume-main">Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="resume-main">
        <div className="page-header">
          <div>
            <h2 className="page-title">
              {fromStep5 ? "Edit Resume Details" : "Generate Resume"}
            </h2>
            <p className="page-subtitle">
              {fromStep5
                ? "Update your Step 1 details, then return to the final resume generation step."
                : "Complete your profile to generate a professional resume. You can save as draft anytime."}
            </p>
          </div>
        </div>

        <ResumeStepper currentStep={fromStep5 ? 5 : 1} />

        {/* Personal Info */}
        <div className="resume-card">
          <div className="card-head">
            <h3>Section A - Personal Information</h3>
            <span className="badge">Required</span>
          </div>

          <div className="grid-2">
            <div className="field">
              <label className="label">Full Name</label>
              <input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="label">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
          </div>

          <div className="field">
            <label className="label">Gender</label>
            <div className="segmented" role="radiogroup" aria-label="Gender">
              <label className={`seg-item ${formData.gender === "Male" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                />
                <span>Male</span>
              </label>

              <label className={`seg-item ${formData.gender === "Female" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === "Female"}
                  onChange={handleChange}
                />
                <span>Female</span>
              </label>
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label className="label">Contact Number</label>
              <input
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="label">Email</label>
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label className="label">LinkedIn</label>
              <input
                name="linkedin"
                placeholder="LinkedIn"
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label className="label">GitHub / Portfolio</label>
              <input
                name="github"
                placeholder="GitHub / Portfolio"
                value={formData.github}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Address</label>
            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Career Objective */}
        <div className="resume-card">
          <div className="card-head">
            <h3>Section B - Career Objective</h3>
          </div>

          <div className="field">
            <label className="label">Career Objective</label>
            <textarea
              name="careerObjective"
              value={formData.careerObjective}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Education */}
        <div className="resume-card">
          <div className="card-head">
            <h3>Section C - Education</h3>
          </div>

          {formData.education.map((edu, idx) => (
            <div key={idx} className="grid-2">
              <div className="field">
                <label className="label">Institution</label>
                <input
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => handleChange(e, idx, "institution", "education")}
                />
              </div>

              <div className="field">
                <label className="label">Degree</label>
                <input
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => handleChange(e, idx, "degree", "education")}
                />
              </div>

              <div className="field">
                <label className="label">Major</label>
                <input
                  placeholder="Major"
                  value={edu.major}
                  onChange={(e) => handleChange(e, idx, "major", "education")}
                />
              </div>

              <div className="field">
                <label className="label">CGPA / %</label>
                <input
                  placeholder="CGPA / %"
                  value={edu.cgpa}
                  onChange={(e) => handleChange(e, idx, "cgpa", "education")}
                />
              </div>
            </div>
          ))}

          <div className="field" style={{ marginTop: 10 }}>
            <label className="label">Course (auto from Degree)</label>
            <input
              name="course"
              placeholder="Course"
              value={formData.course}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="resume-card">
          <div className="card-head">
            <h3>Section D - Skills</h3>
          </div>

          <div className="field">
            <label className="label">Technical Skills</label>
            <textarea
              name="technicalSkills"
              value={formData.technicalSkills}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label className="label">Soft Skills</label>
            <textarea
              name="softSkills"
              value={formData.softSkills}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label className="label">Languages / Proficiency</label>
            <textarea
              name="languages"
              value={formData.languages}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Projects */}
        <div className="resume-card">
          <div className="card-head">
            <h3>Section E - Projects/Courseworks</h3>
          </div>

          {formData.projects.map((proj, idx) => (
            <div key={idx} className="project-block">
              <div className="block-title">Project {idx + 1}</div>

              <div className="grid-2">
                <div className="field">
                  <label className="label">Project Title</label>
                  <input
                    placeholder="Project Title"
                    value={proj.title}
                    onChange={(e) => handleChange(e, idx, "title", "projects")}
                  />
                </div>

                <div className="field">
                  <label className="label">Tools</label>
                  <input
                    placeholder="Tools"
                    value={proj.tools}
                    onChange={(e) => handleChange(e, idx, "tools", "projects")}
                  />
                </div>

                <div className="field">
                  <label className="label">Role</label>
                  <input
                    placeholder="Role"
                    value={proj.role}
                    onChange={(e) => handleChange(e, idx, "role", "projects")}
                  />
                </div>

                <div className="field">
                  <label className="label">Description</label>
                  <textarea
                    placeholder="Description"
                    value={proj.description}
                    onChange={(e) => handleChange(e, idx, "description", "projects")}
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="btn-outline" onClick={addProject}>
            + Add Project
          </button>
        </div>

        {/* Experience */}
        <div className="resume-card">
          <div className="card-head">
            <h3>Section F - Experience/Work</h3>
          </div>

          {formData.experiences.map((exp, idx) => (
            <div key={idx} className="project-block">
              <div className="block-title">Experience {idx + 1}</div>

              <div className="grid-2">
                <div className="field">
                  <label className="label">Organization</label>
                  <input
                    placeholder="Organization"
                    value={exp.organization}
                    onChange={(e) => handleChange(e, idx, "organization", "experiences")}
                  />
                </div>

                <div className="field">
                  <label className="label">Position</label>
                  <input
                    placeholder="Position"
                    value={exp.position}
                    onChange={(e) => handleChange(e, idx, "position", "experiences")}
                  />
                </div>

                <div className="field">
                  <label className="label">Duration</label>
                  <input
                    placeholder="Duration"
                    value={exp.duration}
                    onChange={(e) => handleChange(e, idx, "duration", "experiences")}
                  />
                </div>

                <div className="field">
                  <label className="label">Responsibilities</label>
                  <textarea
                    placeholder="Responsibilities"
                    value={exp.responsibilities}
                    onChange={(e) =>
                      handleChange(e, idx, "responsibilities", "experiences")
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="btn-outline" onClick={addExperience}>
            + Add Experience
          </button>
        </div>

        {/* Actions */}
        <div className="action-row">
          <button className="btn-outline" onClick={() => saveStep1(true)}>
            Save Draft
          </button>

          {fromStep5 && resumeId ? (
            <button
              className="btn-primary"
              onClick={handleNextStep}
            >
              Save & Return to Step 5
            </button>
          ) : (
            <button className="btn-primary" onClick={handleNextStep}>
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}