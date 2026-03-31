import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import "../../components/ResumeStepper.css";
import "./GenerateResumeStep3Result.css";

interface Step3Result {
  score: number;
  contribution: number;
  feedback: string[];
}

const GenerateResumeStep3Result = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const status = user.status || "unemployed";
  const username = user.name || "Student";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Step3Result | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/resume/${resumeId}/step3/result`
        );

        const text = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid response");
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch result");
        }

        setResult({
          score: Number(data.score || 0),
          contribution: Number(data.contribution || 0),
          feedback: Array.isArray(data.feedback) ? data.feedback : ["No feedback available"],
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resumeId]);

  const handleProceed = () => {
    navigate(`/student/resume/step4/instructions/${resumeId}`);
  };

  const score10 = result?.score ?? 0;
  const scorePercent = Math.min(100, Math.max(0, (score10 / 10) * 100));

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="resume-main">
        <div className="r-head">
          <div>
            <h2 className="page-title">Knowledge Assessment Result</h2>
            <p className="page-subtitle">
              Review your score and feedback before proceeding to Step 4.
            </p>
          </div>
        </div>

        <ResumeStepper currentStep={3} />

        {loading && (
          <div className="panel">
            <div className="loading">
              <div className="spinner" />
              <div>
                <div className="loading-title">Loading Step 3 results…</div>
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
              {/* Score Card */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Your Score</div>
                    <div className="muted">Knowledge score out of 10</div>
                  </div>
                  <span className="badge">Step 3 Completed</span>
                </div>

                <div className="score-row">
                  <div className="score-big">{result.score.toFixed(1)}</div>
                  <div className="score-out">/ 10</div>
                </div>

                <div className="progress-track" aria-label="Knowledge score">
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

              {/* Next Step Card */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Next Step</div>
                    <div className="muted">Continue your resume journey</div>
                  </div>
                </div>

                <div className="summary">
                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Proceed to Step 4</div>
                      <div className="summary-text">
                        Step 4 focuses on your internship/work experience.
                      </div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Tip</div>
                      <div className="summary-text">
                        Review incorrect answers to improve your knowledge score next time.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="btn-row end">
                  <button className="btn-outline" onClick={() => navigate(-1)}>
                    ← Back
                  </button>

                  <button className="btn-primary" onClick={handleProceed}>
                    Proceed to Step 4 →
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="panel" style={{ marginTop: 12 }}>
              <div className="panel-head">
                <div>
                  <div className="panel-title">Feedback</div>
                  <div className="muted">Summary of your answers</div>
                </div>
              </div>

              <ul className="feedback-list">
                {result.feedback.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateResumeStep3Result;