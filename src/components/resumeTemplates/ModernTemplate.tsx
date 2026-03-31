// ModernTemplate.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import "./ModernTemplate.css";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Contribution {
  step_number: number;
  score: number;
  contribution: number;
}

type CareerRec = {
  title?: string;
  reason?: string;
  skills?: string[];
  tags?: string[];
};

interface Props {
  data: any;
  image: File | null;
  imageUrl?: string | null;
  contributions?: Contribution[];
  themeColor?: string;
}

function safe(v: any, fallback = ""): string {
  const s = String(v ?? "").trim();
  return s ? s : fallback;
}

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
        try { parsed = JSON.parse(parsed); } catch {}
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

function splitToBullets(input?: string | null): string[] {
  if (!input) return [];
  return String(input)
    .split(/\n|,|;|•|\u2022/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function shortReason(text?: string, maxChars = 105) {
  if (!text) return "";
  const first = String(text).split(".")[0].trim();
  if (!first) return "";
  const out = first.length > maxChars ? first.slice(0, maxChars).trim() + "…" : first;
  return out.endsWith(".") ? out : out + ".";
}

function clampText(text: string, maxChars: number) {
  const t = String(text ?? "");
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars).trim() + "…";
}

const STEP_LABELS: Record<number, string> = {
  2: "Fluency Assessment",
  3: "Knowledge Assessment",
  4: "Experience Assessment",
};

const ModernTemplate: React.FC<Props> = ({
  data,
  image,
  imageUrl,
  contributions = [],
  themeColor = "#8b7b6a",
}) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const displayImage = localPreview || imageUrl || null;

  const educationArr = useMemo(() => parseJsonSafeArray(data?.education), [data?.education]);
  const projectsArr = useMemo(() => parseJsonSafeArray(data?.projects), [data?.projects]);
  const experienceArr = useMemo(() => parseJsonSafeArray(data?.experience), [data?.experience]);

  // ✅ limits to avoid overflow
  const technicalSkills = useMemo(
    () => splitToBullets(data?.technical_skills).slice(0, 8),
    [data?.technical_skills]
  );
  const softSkills = useMemo(
    () => splitToBullets(data?.soft_skills).slice(0, 6),
    [data?.soft_skills]
  );
  const languages = useMemo(
    () => splitToBullets(data?.languages).slice(0, 6),
    [data?.languages]
  );

  const careerRecs: CareerRec[] = useMemo(() => {
    const raw = data?.ai_career_recommendations;
    if (!raw) return [];
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return Array.isArray(raw) ? raw : [];
  }, [data?.ai_career_recommendations]);

  const chartOptions: ChartOptions<"doughnut"> = useMemo(
    () => ({
      rotation: -90,
      circumference: 180,
      cutout: "72%",
      plugins: { legend: { display: false } },
      responsive: true,
      maintainAspectRatio: false,
    }),
    []
  );

  const steps = [2, 3, 4] as const;

  return (
    <div className="mt-a4" style={{ ["--mt-accent" as any]: themeColor }}>
      {/* TOP HEADER STRIP */}
      <header className="mt-top">
        <div className="mt-photoBox">
          {displayImage ? (
            <img className="mt-photo" src={displayImage} alt="Profile" />
          ) : (
            <div className="mt-photo mt-photo--empty">No Image</div>
          )}
        </div>

        <div className="mt-topText">
          <div className="mt-name">{safe(data?.full_name, "YOUR NAME")}</div>
          <div className="mt-role">{safe(data?.job_title, "Internship Resume")}</div>

          <div className="mt-topMini">
            <span>{safe(data?.phone, "-")}</span>
            <span className="mt-dotSep">•</span>
            <span className="mt-pre">{safe(data?.email, "-")}</span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="mt-body">
        {/* LEFT COLUMN */}
        <aside className="mt-left">
          <section className="mt-block">
            <div className="mt-title">CONTACT</div>

            {safe(data?.address) ? (
              <div className="mt-line">
                <span className="mt-ico">📍</span>
                <span className="mt-pre">{data.address}</span>
              </div>
            ) : null}

            {safe(data?.linkedin) ? (
              <div className="mt-line">
                <span className="mt-ico">🔗</span>
                <span className="mt-pre">{data.linkedin}</span>
              </div>
            ) : null}

            {safe(data?.github) ? (
              <div className="mt-line">
                <span className="mt-ico">💻</span>
                <span className="mt-pre">{data.github}</span>
              </div>
            ) : null}
          </section>

          <section className="mt-block">
            <div className="mt-title">EDUCATION</div>
            {educationArr.length ? (
              educationArr.slice(0, 2).map((edu: any, idx: number) => (
                <div className="mt-item" key={idx}>
                  <div className="mt-itemMain">{safe(edu?.institution, "-")}</div>
                  <div className="mt-itemSub">
                    {safe(edu?.degree, "-")}
                    {edu?.major ? ` • ${edu.major}` : ""}
                  </div>
                  <div className="mt-itemMeta">
                    {edu?.cgpa ? `CGPA: ${edu.cgpa}` : ""}
                    {edu?.year ? (edu?.cgpa ? ` • ${edu.year}` : edu.year) : ""}
                  </div>
                </div>
              ))
            ) : (
              <div className="mt-muted">Not provided</div>
            )}
          </section>

          <section className="mt-block">
            <div className="mt-title">SKILLS</div>

            <div className="mt-subtitle">Technical</div>
            {technicalSkills.length ? (
              <ul className="mt-bullets">
                {technicalSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-muted">Not provided</div>
            )}

            <div className="mt-subtitle mt-gapTop">Soft</div>
            {softSkills.length ? (
              <ul className="mt-bullets">
                {softSkills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-muted">Not provided</div>
            )}
          </section>

          <section className="mt-block">
            <div className="mt-title">LANGUAGES</div>
            {languages.length ? (
              <ul className="mt-bullets">
                {languages.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-muted">Not provided</div>
            )}
          </section>

          <section className="mt-block">
            <div className="mt-title">ASSESSMENT</div>

            <div className="mt-assGrid">
              {steps.map((stepNum) => {
                const row =
                  contributions.find((c) => c.step_number === stepNum) || {
                    step_number: stepNum,
                    score: 0,
                    contribution: 0,
                  };

                const percent = Math.max(0, Math.min(100, Number(row.contribution) || 0));
                const chartData = {
                  datasets: [
                    {
                      data: [percent, 20 - percent],
                      backgroundColor: [themeColor, "#e5e7eb"],
                      borderWidth: 0,
                    },
                  ],
                };

                return (
                  <div className="mt-assCard" key={stepNum}>
                    <div className="mt-assHead">{STEP_LABELS[stepNum]}</div>

                    <div className="mt-assChart">
                      <Doughnut data={chartData} options={chartOptions} />
                    </div>

                    <div>
                      <div className="mt-assMeta">Score: {Number(row.score) || 0} / 10</div>
                      <div className="mt-assMeta">Contribution: {percent}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>

        {/* RIGHT COLUMN */}
        <main className="mt-right">
          <section className="mt-sec">
            <div className="mt-secTitle">ABOUT ME</div>
            <div className="mt-text">
              {clampText(
                safe(
                  data?.about_me,
                  "Click “Generate About Me (AI)” in Step 5 to create your About Me."
                ),
                420
              )}
            </div>
          </section>

          <section className="mt-sec">
            <div className="mt-secTitle">CAREER OBJECTIVE</div>
            <div className="mt-text">{clampText(safe(data?.career_objective, "Not provided"), 220)}</div>
          </section>

          <section className="mt-sec">
            <div className="mt-secTitle">WORK EXPERIENCE</div>

            {experienceArr.length ? (
              <div className="mt-expList">
                {experienceArr.slice(0, 2).map((exp: any, idx: number) => {
                  const bullets = splitToBullets(exp?.responsibilities).slice(0, 3);
                  return (
                    <div className="mt-exp" key={idx}>
                      <div className="mt-expTop">
                        <div className="mt-expOrg">{safe(exp?.organization, "-")}</div>
                        <div className="mt-expDate">{safe(exp?.duration, "")}</div>
                      </div>
                      <div className="mt-expPos">{safe(exp?.position, "-")}</div>

                      {bullets.length ? (
                        <ul className="mt-bullets mt-tight">
                          {bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-muted">Not provided</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-muted">Not provided</div>
            )}
          </section>

          <section className="mt-sec">
            <div className="mt-secTitle">PROJECTS</div>

            {projectsArr.length ? (
              <div className="mt-projList">
                {projectsArr.slice(0, 3).map((p: any, idx: number) => (
                  <div className="mt-proj" key={idx}>
                    <div className="mt-projTop">
                      <div className="mt-projTitle">{safe(p?.title, "-")}</div>
                      <div className="mt-projRole">{safe(p?.role, "")}</div>
                    </div>
                    {p?.tools ? (
                      <div className="mt-projMeta">
                        <b>Tools:</b> {p.tools}
                      </div>
                    ) : null}
                    <div className="mt-text">{clampText(safe(p?.description, "Not provided"), 170)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-muted">Not provided</div>
            )}
          </section>

          <section className="mt-sec mt-sec--last">
            <div className="mt-secTitle">AI CAREER RECOMMENDATIONS</div>

            {careerRecs.length ? (
              <div className="mt-aiCol">
                {careerRecs.slice(0, 2).map((rec, idx) => (
                  <div className="mt-aiCard" key={idx}>
                    <div className="mt-aiTitle">{safe(rec?.title, "Recommended Role")}</div>
                    <div className="mt-aiReason">{shortReason(rec?.reason, 95)}</div>

                    <div className="mt-aiTags">
                      {(rec?.skills || rec?.tags || []).slice(0, 2).map((t, i) => (
                        <span className="mt-tag" key={i}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-muted">No recommendations generated yet.</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ModernTemplate;