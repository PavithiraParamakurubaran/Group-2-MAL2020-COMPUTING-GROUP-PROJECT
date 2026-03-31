import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";

import ClassicTemplate from "../../components/resumeTemplates/ClassicTemplate";
import ModernTemplate from "../../components/resumeTemplates/ModernTemplate";
import CreativeTemplate from "../../components/resumeTemplates/CreativeTemplate";

import "./GenerateResumeStep5.css";

const API_BASE = "http://localhost:3001";

type Status = "unemployed" | "employed";

interface ResumeProfile {
  selected_template: number | string | null;
  profile_image: string | null;
}

interface Step1Data {
  full_name: string;
  dob?: string | null;
  gender?: string | null;
  phone: string;
  email: string;
  linkedin?: string | null;
  github?: string | null;
  address?: string | null;

  about_me?: string | null;
  career_objective?: string | null;

  education?: any;
  technical_skills?: string | null;
  soft_skills?: string | null;
  languages?: string | null;
  projects?: any;
  experience?: any;
  course?: string | null;

  // ✅ for AI career recs
  ai_career_recommendations?: any;
}

interface Contribution {
  step_number: number;
  score: number;
  contribution: number;
}

const templates = [
  { id: 1, name: "Classic" },
  { id: 2, name: "Modern" },
  { id: 3, name: "Creative" },
];

const GenerateResumeStep5 = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const status: Status = user.status || "unemployed";
  const username = user.name || "Student";

  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [step1, setStep1] = useState<Step1Data | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [creativeColor, setCreativeColor] = useState<string>("#2b5a92"); // ✅ INSIDE

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingAbout, setGeneratingAbout] = useState(false);
  const [generatingCareer, setGeneratingCareer] = useState(false);

  useEffect(() => {
    const fetchComplete = async () => {
      if (!resumeId) return;
      setLoading(true);

      try {
        const res = await axios.get(`${API_BASE}/api/resume/${resumeId}/complete`);
        const data = res.data?.data;

        const p: ResumeProfile | null = data?.profile ?? null;
        const s1: Step1Data | null = data?.step1 ?? null;
        const contrib: Contribution[] = Array.isArray(data?.contributions)
          ? data.contributions
          : [];

        setProfile(p);
        setStep1(s1);
        setContributions(contrib);

        // template from DB
        if (p?.selected_template) {
          const tpl = Number(p.selected_template);
          setSelectedTemplate(Number.isFinite(tpl) && tpl > 0 ? tpl : 1);
        } else {
          setSelectedTemplate(1);
        }

        // profile image
        if (p?.profile_image) {
          setProfileImageUrl(`${API_BASE}${p.profile_image}`);
        } else {
          setProfileImageUrl(null);
        }
      } catch (err) {
        console.error("Fetch /complete error:", err);
        setProfile(null);
        setStep1(null);
        setContributions([]);
        setSelectedTemplate(1);
        setProfileImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComplete();
  }, [resumeId]);

  const handleTemplateChange = (tplId: number) => {
    setSelectedTemplate(tplId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!resumeId || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    setSelectedImageFile(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${API_BASE}/api/resume/${resumeId}/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imgPath = res.data?.imagePath;
      if (imgPath) setProfileImageUrl(`${API_BASE}${imgPath}`);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed (check backend route + multer)");
    }
  };

  const handleGenerateAboutMe = async () => {
    if (!resumeId) return;

    setGeneratingAbout(true);
    try {
      const res = await axios.post(`${API_BASE}/api/resume/${resumeId}/generate-about`);
      const about = res.data?.about_me;

      if (about) {
        setStep1((prev) => (prev ? { ...prev, about_me: about } : prev));
      } else {
        alert("AI did not return About Me text");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate About Me");
    } finally {
      setGeneratingAbout(false);
    }
  };

  const handleGenerateCareer = async () => {
    if (!resumeId) return;

    setGeneratingCareer(true);
    try {
      const res = await axios.post(`${API_BASE}/api/resume/${resumeId}/generate-career`);
      const recs = res.data?.recommendations;

      if (recs) {
        setStep1((prev) => (prev ? { ...prev, ai_career_recommendations: recs } : prev));
      } else {
        alert("AI did not return recommendations");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate Career Recommendations");
    } finally {
      setGeneratingCareer(false);
    }
  };

 const handleGenerateResume = async () => {
  if (!resumeId) return;

  setGenerating(true);
  try {
    const res = await axios.post(
      `${API_BASE}/api/resume/${resumeId}/generate`,
      {
        templateId: selectedTemplate,
      }
    );

    const generatedId = res.data?.generatedResumeId;

    navigate(`/student/resume/${resumeId}/completed/${generatedId}`);
  } catch (err) {
    console.error("Generate failed:", err);
    alert("Resume generation failed");
  } finally {
    setGenerating(false);
  }
};

  const safeContributions = useMemo(() => {
    const map = new Map<number, Contribution>();
    contributions.forEach((c) => map.set(c.step_number, c));

    return [2, 3, 4].map((n) => ({
      step_number: n,
      score: map.get(n)?.score ?? 0,
      contribution: map.get(n)?.contribution ?? 0,
    }));
  }, [contributions]);

  const renderTemplate = () => {
    if (!step1) return <div className="resume-empty">No resume data found.</div>;

    const commonProps = {
      data: step1,
      image: selectedImageFile,
      imageUrl: profileImageUrl,
      contributions: safeContributions,
    };

    switch (selectedTemplate) {
      case 1:
        return <ClassicTemplate {...commonProps} />;
      case 2:
        return <ModernTemplate {...commonProps} />;
      case 3:
        return <CreativeTemplate {...commonProps} themeColor={creativeColor} />; // ✅ PASS COLOR
      default:
        return <ClassicTemplate {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <StudentMenu status={status} username={username} />
        <div className="resume-main">Loading resume...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="resume-main">
        <ResumeStepper currentStep={5} />

        <div className="instruction-box">
          <h2>Step 5: Generate AI Internship Resume</h2>

          <div className="controls-row">
            <div>
              <label>Upload Profile Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div>
              <label>Choose Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(Number(e.target.value))}
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Creative color dropdown only when Creative */}
            {selectedTemplate === 3 && (
              <div>
                <label>Creative Theme Color</label>
                <select value={creativeColor} onChange={(e) => setCreativeColor(e.target.value)}>
                  <option value="#2b5a92">Blue</option>
                  <option value="#7c3aed">Purple</option>
                  <option value="#0f766e">Teal</option>
                  <option value="#b45309">Orange</option>
                  <option value="#374151">Charcoal</option>
                </select>
              </div>
            )}

            <div className="step5-actions">
              <button
                type="button"
                className="generate-btn"
                onClick={handleGenerateAboutMe}
                disabled={generatingAbout}
              >
                {generatingAbout ? "Generating About Me..." : "Generate About Me (AI)"}
              </button>

              <button
                type="button"
                className="generate-btn"
                onClick={handleGenerateCareer}
                disabled={generatingCareer}
              >
                {generatingCareer
                  ? "Generating Career Recs..."
                  : "Generate Career Recommendations (AI)"}
              </button>
            </div>
          </div>

          <div className="resume-preview" key={selectedTemplate}>
            {renderTemplate()}
          </div>

          <button className="generate-btn generate-btn--primary " onClick={handleGenerateResume} disabled={generating}>
            {generating ? "Generating..." : "Generate AI Resume"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateResumeStep5;