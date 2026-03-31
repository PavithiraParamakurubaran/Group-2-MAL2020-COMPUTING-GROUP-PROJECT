import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";

import ClassicTemplate from "../../components/resumeTemplates/ClassicTemplate";
import ModernTemplate from "../../components/resumeTemplates/ModernTemplate";
import CreativeTemplate from "../../components/resumeTemplates/CreativeTemplate";

import "./GenerateResumeCompleted.css";

const API_BASE = "http://localhost:3001";

type Status = "unemployed" | "employed";

interface Contribution {
  step_number: number;
  score: number;
  contribution: number;
}

const GenerateResumeCompleted = () => {
  const { resumeId } = useParams();
  const previewRef = useRef<HTMLDivElement | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const status: Status = user.status || "unemployed";
  const username = user.name || "Student";

  const [loading, setLoading] = useState(true);
  const [step1, setStep1] = useState<any>(null);
  const [templateId, setTemplateId] = useState<number>(1);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      if (!resumeId) return;

      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/resume/${resumeId}/complete`);
        const data = res.data?.data;

        setStep1(data?.step1 || null);

        const tpl = Number(data?.profile?.selected_template || 1);
        setTemplateId(Number.isFinite(tpl) ? tpl : 1);

        // ✅ contributions normalize (ensure steps 2/3/4 exist)
        const raw: Contribution[] = Array.isArray(data?.contributions) ? data.contributions : [];
        setContributions(raw);

        // ✅ profile image
        if (data?.profile?.profile_image) {
          setProfileImageUrl(`${API_BASE}${data.profile.profile_image}`);
        } else {
          setProfileImageUrl(null);
        }
      } catch (err) {
        console.error("Fetch complete error:", err);
        setStep1(null);
        setTemplateId(1);
        setContributions([]);
        setProfileImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [resumeId]);

  // ✅ Always provide step 2,3,4 even if missing
  const safeContributions = useMemo(() => {
    const map = new Map<number, Contribution>();
    contributions.forEach((c) => {
      const step = Number(c.step_number);
      map.set(step, {
        step_number: step,
        score: Number(c.score) || 0,
        contribution: Number(c.contribution) || 0,
      });
    });

    return [2, 3, 4].map((n) => ({
      step_number: n,
      score: map.get(n)?.score ?? 0,
      contribution: map.get(n)?.contribution ?? 0,
    }));
  }, [contributions]);

  const renderTemplate = () => {
    if (!step1) return null;

    const commonProps = {
      data: step1,
      image: null,
      imageUrl: profileImageUrl, // ✅ pass URL (templates will use it)
      contributions: safeContributions, // ✅ normalized
    };

    switch (templateId) {
      case 1:
        return <ClassicTemplate {...commonProps} />;
      case 2:
        return <ModernTemplate {...commonProps} />;
      case 3:
        return <CreativeTemplate {...commonProps} />;
      default:
        return <ClassicTemplate {...commonProps} />;
    }
  };

  // ✅ 1-page A4 PDF export (auto scale to fit)
 const handleDownloadPdf = async () => {
  if (!previewRef.current || !resumeId) return;

  const element = previewRef.current;
  element.classList.add("pdf-exporting");

  try {
    const imgs = Array.from(element.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const pxW = canvas.width;
    const pxH = canvas.height;
    const ratio = Math.min(pageW / pxW, pageH / pxH);

    const renderW = pxW * ratio;
    const renderH = pxH * ratio;

    const x = (pageW - renderW) / 2;
    const y = (pageH - renderH) / 2;

    pdf.addImage(imgData, "JPEG", x, y, renderW, renderH, undefined, "FAST");

    // ✅ 1) Save locally (same as before)
    pdf.save("AI_Internship_Resume.pdf");

    // ✅ 2) Upload to backend too
    const pdfBlob = pdf.output("blob");
    const formData = new FormData();
    formData.append("file", pdfBlob, `resume_${resumeId}.pdf`);

    await axios.post(`${API_BASE}/api/resume/${resumeId}/upload-pdf`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("PDF saved + uploaded successfully!");
  } catch (e) {
    console.error(e);
    alert("Failed to export PDF. Check console.");
  } finally {
    element.classList.remove("pdf-exporting");
  }
};

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <StudentMenu status={status} username={username} />
        <div className="completed-main">Loading resume...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="completed-main">
        <ResumeStepper currentStep={5} />

        <div className="completed-card">
          <div className="completed-head">
            <h2>Resume Generation Completed ✅</h2>
            <p className="completed-subtitle">
              Your AI generated internship resume is ready!
            </p>
          </div>

          <div className="completed-actions">
            <button className="completed-btn" onClick={handleDownloadPdf} disabled={!step1}>
              Download as PDF
            </button>
          </div>

          {/* ✅ IMPORTANT: this wrapper is what we capture for PDF */}
          <div className="completed-previewWrap">
            <div ref={previewRef} className="completed-preview">
              {step1 ? renderTemplate() : <div className="completed-empty">No resume data found.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateResumeCompleted;