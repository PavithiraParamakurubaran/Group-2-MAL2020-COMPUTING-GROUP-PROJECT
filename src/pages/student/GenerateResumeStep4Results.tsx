// src/pages/student/GenerateResumeStep4Results.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import "./GenerateResumeStep4Results.css";

interface Step4Result {
  score: number;
  contribution: number;
  feedback: string[];
  answers: { questionIndex: number; selectedOptions: string[] }[];
}

const GenerateResumeStep4Results = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const status = user.status || "unemployed";
  const username = user.name || "Student";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Step4Result | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/resume/${resumeId}/step4/result`);
        const text = await res.text();

        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server did not return JSON. Response:\n" + text);
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch result");
        }

        setResult({
          score: Number(data.score),
          contribution: Number(data.contribution),
          feedback: Array.isArray(data.feedback) ? data.feedback : [],
          answers: Array.isArray(data.answers) ? data.answers : [],
        });
      } catch (err: any) {
        console.error("Fetch Step4 Result Error:", err);
        setError(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resumeId]);

  useEffect(() => {
    if (!loading && !error && !result) {
      navigate(`/student/resume/step4/questions/${resumeId}`, { replace: true });
    }
  }, [loading, error, result, navigate, resumeId]);

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="resume-main">
        <div className="r-head">
          <div>
            <h2 className="page-title">Experience Assessment Result</h2>
            <p className="page-subtitle">
              Review your score and feedback before proceeding to the final resume step.
            </p>
          </div>
        </div>

        <ResumeStepper currentStep={4} />

        {loading && (
          <div className="panel">
            <div className="loading">
              <div className="spinner" />
              <div>
                <div className="loading-title">Loading Step 4 results...</div>
                <div className="muted">Please wait a moment.</div>
              </div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="panel error">
            <div className="error-title">⚠ Something went wrong</div>
            <div className="error-text">{error}</div>
            <div className="btn-row">
              <button className="btn-outline" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button className="btn-primary" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && result && (
          <>
            <div className="grid">
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Your Score</div>
                    <div className="muted">Experience assessment score out of 10</div>
                  </div>
                  <span className="badge">Step 4 Completed</span>
                </div>

                <div className="score-row">
                  <div className="score-big">{result.score.toFixed(1)}</div>
                  <div className="score-out">/ 10</div>
                </div>

                <div className="progress-track" aria-label="Experience score">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, Math.max(0, (result.score / 10) * 100))}%` }}
                  />
                </div>

                <div className="meta">
                  <div className="meta-item">
                    <div className="meta-label">Contribution to resume</div>
                    <div className="meta-value">{result.contribution.toFixed(2)}%</div>
                  </div>

                  <div className="meta-item">
                    <div className="meta-label">Status</div>
                    <div className="meta-value ok">Completed</div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Next Step</div>
                    <div className="muted">Continue to finalize your resume</div>
                  </div>
                </div>

                <div className="summary">
                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Proceed to Step 5</div>
                      <div className="summary-text">
                        Finalize your resume layout and generate your completed resume.
                      </div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Tip</div>
                      <div className="summary-text">
                        Review the incorrect answers so you understand where to improve.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="btn-row end">
                  <button className="btn-outline" onClick={() => navigate(-1)}>
                    ← Back
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/student/resume/step5/instructions/${resumeId}`)}
                  >
                    Proceed to Step 5 →
                  </button>
                </div>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 12 }}>
              <div className="panel-head">
                <div>
                  <div className="panel-title">Feedback</div>
                  <div className="muted">Summary of your answers</div>
                </div>
              </div>

              {result.feedback.length === 0 ? (
                <div className="empty">No feedback available.</div>
              ) : (
                <ul className="feedback-list">
                  {result.feedback.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateResumeStep4Results;