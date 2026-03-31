import React, { useEffect, useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import "./ClassicTemplate.css";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Contribution {
  step_number: number;
  score: number;
  contribution: number;
}

interface Props {
  data: any;
  image: File | null;
  imageUrl?: string | null;
  contributions?: Contribution[];
}

function parseJsonSafeArray(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch {
      return [];
    }
  }
  return [];
}

function splitToBullets(input?: string | null): string[] {
  if (!input) return [];
  return input
    .split(/\n|,|;|•|\u2022/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function safe(v: any, fallback = ""): string {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

const ClassicTemplate: React.FC<Props> = ({
  data,
  image,
  imageUrl,
  contributions = [],
}) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const displayImage = localPreview || imageUrl || null;

  const educationArr = useMemo(
    () => parseJsonSafeArray(data?.education),
    [data?.education]
  );

  const projectsArr = useMemo(
    () => parseJsonSafeArray(data?.projects),
    [data?.projects]
  );

  const experienceArr = useMemo(
    () => parseJsonSafeArray(data?.experience),
    [data?.experience]
  );

  const technicalSkills = useMemo(
    () => splitToBullets(data?.technical_skills),
    [data?.technical_skills]
  );

  const softSkills = useMemo(
    () => splitToBullets(data?.soft_skills),
    [data?.soft_skills]
  );

  const languages = useMemo(
    () => splitToBullets(data?.languages),
    [data?.languages]
  );

  // ✅ AI Career Recommendations from DB
  const careerRecs = useMemo(() => {
    if (!data?.ai_career_recommendations) return [];

    if (typeof data.ai_career_recommendations === "string") {
      try {
        return JSON.parse(data.ai_career_recommendations);
      } catch {
        return [];
      }
    }

    return data.ai_career_recommendations;
  }, [data]);

  const chartOptions: ChartOptions<"doughnut"> = {
    rotation: -90,
    circumference: 180,
    cutout: "70%",
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: true,
  };

  const STEP_LABELS: Record<number, string> = {
  2: "Fluency Assessment",
  3: "Knowledge Assessment",
  4: "Experience Assessment",
};

  const steps = [2, 3, 4];

  return (
    <div className="r-classic">
      {/* HEADER */}
      <div className="r-head">
        <div>
          <div className="r-name">{safe(data?.full_name, "YOUR NAME")}</div>
          <div className="r-title">
            {safe(data?.job_title, "Internship Resume")}
          </div>

          <div className="r-contact">{safe(data?.phone)}</div>
          <div className="r-contact">{safe(data?.email)}</div>
          <div className="r-contact">{safe(data?.address)}</div>
        </div>

        <div>
          {displayImage ? (
            <img src={displayImage} className="r-photo" />
          ) : (
            <div className="r-photo-empty">No Image</div>
          )}
        </div>
      </div>

      <div className="r-body">
        {/* LEFT COLUMN */}
        <div className="r-col">
          <section>
            <h3>ABOUT ME</h3>
            <p>{safe(data?.about_me, "Click Generate About Me (AI)")}</p>
          </section>

          <section>
            <h3>CAREER OBJECTIVE</h3>
            <p>{safe(data?.career_objective, "Not provided")}</p>
          </section>

          <section>
            <h3>EDUCATION</h3>
            {educationArr.map((edu: any, i: number) => (
              <div key={i}>
                <b>{edu?.institution}</b>
                <div>
                  {edu?.degree} {edu?.major && `• ${edu.major}`}
                </div>
                <div>{edu?.cgpa && `CGPA: ${edu.cgpa}`}</div>
              </div>
            ))}
          </section>

          <section>
            <h3>SKILLS</h3>
            <b>Technical:</b>
            <ul>
              {technicalSkills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>

            <b>Soft:</b>
            <ul>
              {softSkills.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>LANGUAGES</h3>
            <ul>
              {languages.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>

          {/* ✅ Assessment moved below Languages */}
          <section>
            <h3>ASSESSMENT PERFORMANCE</h3>
            <div className="r-perf-grid">
              {steps.map((stepNum) => {
                const row =
                  contributions.find((c) => c.step_number === stepNum) || {
                    score: 0,
                    contribution: 0,
                  };

                const percent = row.contribution || 0;

                const chartData = {
                  datasets: [
                    {
                      data: [percent, 20 - percent],
                      backgroundColor: ["#2b5a92", "#e5e7eb"],
                      borderWidth: 0,
                    },
                  ],
                };

                return (
                  <div key={stepNum} className="r-perf-card">
  <div className="r-perf-title">
    {STEP_LABELS[stepNum] ?? `Step ${stepNum}`}
  </div>

  <Doughnut data={chartData} options={chartOptions} />

  <div className="r-perf-meta">
    Score: {row.score}/10
  </div>
  <div className="r-perf-meta">
    Contribution: {percent}%
  </div>
</div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="r-col">
          <section>
            <h3>WORK EXPERIENCE</h3>
            {experienceArr.map((exp: any, i: number) => (
              <div key={i}>
                <b>{exp?.organization}</b>
                <div>{exp?.position}</div>
                <ul>
                  {splitToBullets(exp?.responsibilities).map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section>
            <h3>PROJECTS</h3>
            {projectsArr.map((p: any, i: number) => (
              <div key={i}>
                <b>{p?.title}</b>
                <div>{p?.description}</div>
              </div>
            ))}
          </section>

        
          {/* ✅ AI CAREER RECOMMENDATIONS (SHORT VERSION) */}
<section>
  <h3>AI CAREER RECOMMENDATIONS</h3>

  {careerRecs.length ? (
    <div className="r-ai-grid">
      {careerRecs.slice(0, 4).map((rec: any, idx: number) => (
        <div key={idx} className="r-ai-card">
          <div className="r-ai-title">{rec.title}</div>

          {/* Short reason (first sentence only) */}
          <div className="r-ai-reason">
            {rec.reason?.split(".")[0]}.
          </div>

          {/* Only 2 skills to keep compact */}
          <div className="r-ai-tags">
            {rec.skills?.slice(0, 2).map((s: string, i: number) => (
              <span key={i} className="r-ai-tag">{s}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p>No recommendations generated yet.</p>
  )}
</section>
        </div>
      </div>
    </div>
  );
};

export default ClassicTemplate;