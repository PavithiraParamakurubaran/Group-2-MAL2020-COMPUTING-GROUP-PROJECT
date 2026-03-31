import React, { useEffect, useMemo, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import "./CreativeTemplate.css";

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
  if (!input) return [];
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

function splitToBullets(input?: string | null): string[] {
  if (!input) return [];
  return String(input)
    .split(/\n|,|;|•|\u2022/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function shortSentence(text?: string, maxChars = 120) {
  if (!text) return "";
  const first = String(text).split(".")[0].trim();
  if (!first) return "";
  return first.length > maxChars ? first.slice(0, maxChars).trim() + "…" : first + ".";
}

const STEP_LABELS: Record<number, string> = {
  2: "Fluency Assessment",
  3: "Knowledge Assessment",
  4: "Experience Assessment",
};

const CreativeTemplate: React.FC<Props> = ({
  data,
  image,
  imageUrl,
  contributions = [],
  themeColor = "#2b5a92",
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
  const experienceArr = useMemo(() => parseJsonSafeArray(data?.experience), [data?.experience]);
  const projectsArr = useMemo(() => parseJsonSafeArray(data?.projects), [data?.projects]);

  const technicalSkills = useMemo(
    () => splitToBullets(data?.technical_skills),
    [data?.technical_skills]
  );
  const softSkills = useMemo(() => splitToBullets(data?.soft_skills), [data?.soft_skills]);
  const languages = useMemo(() => splitToBullets(data?.languages), [data?.languages]);

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
    <div className="ct-a4" style={{ ["--ct-accent" as any]: themeColor }}>
      {/* LEFT SIDEBAR */}
      <aside className="ct-left">
        <div className="ct-photoWrap">
          <div className="ct-photoRing">
            {displayImage ? (
              <img className="ct-photo" src={displayImage} alt="Profile" />
            ) : (
              <div className="ct-photoEmpty">No Image</div>
            )}
          </div>
        </div>

        {/* CONTACT */}
        <section className="ct-sideSec ct-sideSec--tight">
          <div className="ct-sideTitle">
            <span className="ct-ico">☎</span> Contact
          </div>

          <div className="ct-sideLine">
            <span className="ct-miniIco">📞</span>
            <span>{safe(data?.phone, "-")}</span>
          </div>

          <div className="ct-sideLine">
            <span className="ct-miniIco">✉️</span>
            <span>{safe(data?.email, "-")}</span>
          </div>

          {safe(data?.address) ? (
            <div className="ct-sideLine">
              <span className="ct-miniIco">📍</span>
              <span className="ct-pre">{data.address}</span>
            </div>
          ) : null}

          {safe(data?.linkedin) ? (
            <div className="ct-sideLine">
              <span className="ct-miniIco">🔗</span>
              <span className="ct-pre">{data.linkedin}</span>
            </div>
          ) : null}

          {safe(data?.github) ? (
            <div className="ct-sideLine">
              <span className="ct-miniIco">💻</span>
              <span className="ct-pre">{data.github}</span>
            </div>
          ) : null}
        </section>

        {/* SKILLS */}
        <section className="ct-sideSec ct-sideSec--tight">
          <div className="ct-sideTitle">
            <span className="ct-ico">⚙️</span> Skills
          </div>

          <div className="ct-skillBlock">
            <div className="ct-skillLabel">Technical</div>
            {technicalSkills.length ? (
              <ul className="ct-list">
                {technicalSkills.slice(0, 7).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="ct-sideMuted">Not provided</div>
            )}
          </div>

          <div className="ct-skillBlock">
            <div className="ct-skillLabel">Soft</div>
            {softSkills.length ? (
              <ul className="ct-list">
                {softSkills.slice(0, 5).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div className="ct-sideMuted">Not provided</div>
            )}
          </div>
        </section>

        {/* LANGUAGE */}
        <section className="ct-sideSec ct-sideSec--tight">
          <div className="ct-sideTitle">
            <span className="ct-ico">🌐</span> Language
          </div>
          {languages.length ? (
            <ul className="ct-list">
              {languages.slice(0, 5).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <div className="ct-sideMuted">Not provided</div>
          )}
        </section>

        {/* ✅ ASSESSMENT MOVED TO LEFT (compact 3 rows) */}
        <section className="ct-sideSec ct-sideSec--tight">
          <div className="ct-sideTitle">
            <span className="ct-ico">📊</span> Assessment
          </div>

          <div className="ct-assGrid">
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
                    backgroundColor: [themeColor, "rgba(255,255,255,0.25)"],
                    borderWidth: 0,
                  },
                ],
              };

              return (
                <div className="ct-assCard" key={stepNum}>
                  <div className="ct-assHead">{STEP_LABELS[stepNum] ?? `Step ${stepNum}`}</div>

                  <div className="ct-assRow">
                    <div className="ct-assChart">
                      <Doughnut data={chartData} options={chartOptions} />
                    </div>

                    <div>
                      <div className="ct-assMeta">Score: {Number(row.score) || 0} / 10</div>
                      <div className="ct-assMeta">Contribution: {percent}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </aside>

      {/* RIGHT MAIN */}
      <main className="ct-right">
        <header className="ct-header ct-header--compact">
          <div className="ct-name">{safe(data?.full_name, "YOUR NAME")}</div>
          <div className="ct-role">{safe(data?.job_title, "Internship Resume")}</div>

          {safe(data?.career_objective) ? (
            <div className="ct-objective">
              <span className="ct-objLabel">Career Objective:</span> {safe(data?.career_objective)}
            </div>
          ) : null}
        </header>

        {/* ✅ ABOUT ME moved to RIGHT above Education */}
<section className="ct-sec ct-sec--tight ct-aboutRight">
  <div className="ct-secTitle">About Me</div>
  <div className="ct-text">
    {safe(
      data?.about_me,
      "Click “Generate About Me (AI)” in Step 5 to create your About Me."
    )}
  </div>
</section>


        {/* EDUCATION */}
        <section className="ct-sec ct-sec--tight">
          <div className="ct-secTitle">Education</div>
          <div className="ct-timeline">
            <div className="ct-line" />
            <div className="ct-items ct-items--tight">
              {educationArr.length ? (
                educationArr.map((edu: any, idx: number) => (
                  <div className="ct-item" key={idx}>
                    <div className="ct-dot" />
                    <div className="ct-itemBody">
                      <div className="ct-itemTop">
                        <div className="ct-itemTitle">{safe(edu?.institution, "-")}</div>
                        <div className="ct-itemDate">{safe(edu?.year, "")}</div>
                      </div>
                      <div className="ct-itemSub">
                        {safe(edu?.degree, "-")}
                        {edu?.major ? ` • ${edu.major}` : ""}
                      </div>
                      {edu?.cgpa ? <div className="ct-itemMeta">CGPA: {edu.cgpa}</div> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="ct-empty">Not provided</div>
              )}
            </div>
          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="ct-sec ct-sec--tight">
          <div className="ct-secTitle">Experience</div>
          <div className="ct-timeline">
            <div className="ct-line" />
            <div className="ct-items ct-items--tight">
              {experienceArr.length ? (
                experienceArr.map((exp: any, idx: number) => (
                  <div className="ct-item" key={idx}>
                    <div className="ct-dot" />
                    <div className="ct-itemBody">
                      <div className="ct-itemTop">
                        <div className="ct-itemTitle">{safe(exp?.position, "-")}</div>
                        <div className="ct-itemDate">{safe(exp?.duration, "")}</div>
                      </div>
                      <div className="ct-itemSub">{safe(exp?.organization, "-")}</div>
                      {splitToBullets(exp?.responsibilities).length ? (
                        <ul className="ct-bullets ct-bullets--tight">
                          {splitToBullets(exp?.responsibilities).slice(0, 4).map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="ct-empty">Not provided</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="ct-empty">Not provided</div>
              )}
            </div>
          </div>

          {/* PROJECTS */}
          <div className="ct-subSec ct-subSec--tight">
            <div className="ct-subTitle">Projects</div>
            {projectsArr.length ? (
              <div className="ct-projectList">
                {projectsArr.slice(0, 3).map((p: any, idx: number) => (
                  <div className="ct-proj" key={idx}>
                    <div className="ct-projTop">
                      <div className="ct-projTitle">{safe(p?.title, "-")}</div>
                      <div className="ct-projRole">{safe(p?.role, "")}</div>
                    </div>
                    {p?.tools ? (
                      <div className="ct-projMeta">
                        <b>Tools:</b> {p.tools}
                      </div>
                    ) : null}
                    <div className="ct-projDesc">{safe(p?.description, "Not provided")}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ct-empty">Not provided</div>
            )}
          </div>
        </section>

        {/* AI CAREER RECS */}
        <section className="ct-sec ct-sec--tight">
          <div className="ct-secTitle">AI Career Recommendations</div>

          {careerRecs.length ? (
            <div className="ct-aiCol">
              {careerRecs.slice(0, 2).map((rec, idx) => (
                <div className="ct-aiCard" key={idx}>
                  <div className="ct-aiTitle">{safe(rec?.title, "Recommended Role")}</div>
                  <div className="ct-aiReason">{shortSentence(rec?.reason, 100)}</div>

                  <div className="ct-aiTags">
                    {(rec?.skills || rec?.tags || []).slice(0, 2).map((t, i) => (
                      <span className="ct-tag" key={i}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ct-empty">No recommendations generated yet.</div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CreativeTemplate;