import { useEffect, useState } from "react";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import { useNavigate, useParams } from "react-router-dom";
import "../../components/ResumeStepper.css";
import "./GenerateResumeStep2Result.css";

interface AIResult {
  fluencyScore: number;
  level: string;
  feedback: string[];
  contribution: number; // step weight (max 20%)
}

const GenerateResumeStep2Result = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const status = user.status || "unemployed";
  const username = user.name || "Student";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);

  useEffect(() => {
    const fetchAIResult = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/resume/${resumeId}/step2/result`
        );

        const text = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server returned invalid response");
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch result");
        }

        setResult({
          fluencyScore: Number(data.fluencyScore || 0),
          level: data.level || "N/A",
          feedback: Array.isArray(data.feedback) ? data.feedback : [],
          contribution: Number(data.contribution || 0),
        });
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchAIResult();
  }, [resumeId]);

  const score10 = result?.fluencyScore ?? 0;
  const scorePercent = Math.min(100, Math.max(0, (score10 / 10) * 100));

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="resume-main">
        <div className="r-head">
          <div>
            <h2 className="page-title">Fluency Assessment Result</h2>
            <p className="page-subtitle">
              Review your score and feedback before moving to the next step.
            </p>
          </div>
        </div>

        <ResumeStepper currentStep={2} />

        {loading && (
          <div className="panel">
            <div className="loading">
              <div className="spinner" />
              <div>
                <div className="loading-title">Analyzing your responses...</div>
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
              <button
                className="btn-primary"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && result && (
          <>
            <div className="grid">
              {/* Score card */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Your Score</div>
                    <div className="muted">Fluency rating out of 10</div>
                  </div>
                  <span className="badge">{result.level}</span>
                </div>

                <div className="score-row">
                  <div className="score-big">{result.fluencyScore.toFixed(1)}</div>
                  <div className="score-out">/ 10</div>
                </div>

                <div className="progress-track" aria-label="Fluency score">
                  <div
                    className="progress-fill"
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>

                <div className="meta">
                  <div className="meta-item">
                    <div className="meta-label">Contribution to resume</div>
                    <div className="meta-value">
                      {result.contribution.toFixed(2)}%
                    </div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-label">Status</div>
                    <div className="meta-value ok">Completed</div>
                  </div>
                </div>
              </div>

              {/* Summary card */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Summary</div>
                    <div className="muted">What your result means</div>
                  </div>
                </div>

                <div className="summary">
                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Level</div>
                      <div className="summary-text">{result.level}</div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Next step</div>
                      <div className="summary-text">
                        Proceed to Step 3 (Knowledge Assessment).
                      </div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Tip</div>
                      <div className="summary-text">
                        Improve by speaking with clear structure: Situation → Action → Result.
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
                    onClick={() =>
                      navigate(`/student/generate-resume-step3-instructions/${resumeId}`)
                    }
                  >
                    Proceed →
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="panel" style={{ marginTop: 12 }}>
              <div className="panel-head">
                <div>
                  <div className="panel-title">Feedback</div>
                  <div className="muted">AI feedback summary</div>
                </div>
              </div>

              {result.feedback.length === 0 ? (
                <div className="empty">
                  No feedback available. Try speaking longer answers for deeper analysis.
                </div>
              ) : (
                <ul className="feedback-list">
                  {result.feedback.map((item, idx) => (
                    <li key={idx}>{item}</li>
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

export default GenerateResumeStep2Result;