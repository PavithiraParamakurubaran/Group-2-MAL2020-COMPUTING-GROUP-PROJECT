import { useParams, useNavigate } from "react-router-dom";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import { useEffect, useState } from "react";
import "./GenerateResumeStep5Instructions.css";

const GenerateResumeStep5Instructions = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const status = user.status || "unemployed";
  const username = user.name || "Student";

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="resume-main">
        <div className="r-head">
          <div>
            <h2 className="page-title">Step 5: Resume Generation</h2>
            <p className="page-subtitle">
              You are now at the final stage of your internship readiness journey.
            </p>
          </div>
        </div>

        <ResumeStepper currentStep={5} />

        {loading && (
          <div className="panel">
            <div className="loading">
              <div className="spinner" />
              <div>
                <div className="loading-title">Loading Step 5 instructions...</div>
                <div className="muted">Preparing your final resume generation step.</div>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <div className="grid">
              <div className="panel hero-panel">
                <div className="hero-badge">Final Step</div>
                <h3 className="hero-title">Welcome to the Final Step: AI-Powered Resume Creation</h3>
                <p className="hero-text">
                  Congratulations on reaching the final stage of your Internship Readiness
                  Assessment. In this step, the system will automatically generate your
                  personalized internship resume based on the data and evaluations collected
                  in the previous steps.
                </p>

                <div className="btn-row">
                  <button
                    className="btn-outline"
                    onClick={() => navigate(`/student/generate-resume/${resumeId}?fromStep5=1`)}
                  >
                    Edit Step 1 Details
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/student/resume/step5/generate/${resumeId}`)}
                  >
                    Proceed to Resume Generation →
                  </button>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">How It Works</div>
                    <div className="muted">Your data is combined into one professional resume</div>
                  </div>
                </div>

                <div className="summary">
                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Basic Profile & Education</div>
                      <div className="summary-text">
                        From Step 1 — personal details, academic background, and key skills.
                      </div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Fluency Assessment</div>
                      <div className="summary-text">
                        From Step 2 — communication level and language fluency summary.
                      </div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Knowledge Assessment</div>
                      <div className="summary-text">
                        From Step 3 — core subject strengths and technical expertise.
                      </div>
                    </div>
                  </div>

                  <div className="summary-item">
                    <div className="dot" />
                    <div>
                      <div className="summary-title">Experience Assessment</div>
                      <div className="summary-text">
                        From Step 4 — problem-solving ability, teamwork, and job readiness indicators.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 12 }}>
              <div className="panel-head">
                <div>
                  <div className="panel-title">What the AI Will Do</div>
                  <div className="muted">Professional formatting based on your complete assessment</div>
                </div>
              </div>

              <p className="info-text">
                All of these data points are processed by AI to create a professionally
                formatted, skill-focused resume that reflects both your academic knowledge
                and workplace preparedness.
              </p>

              <p className="info-text">
                Please review all your information carefully before proceeding. Once generated,
                you will be able to view your resume using the selected template and continue
                with the final resume completion process.
              </p>

              <div className="notice-box">
                <strong>Reminder:</strong> Make sure your details from the previous steps are
                complete and accurate, as they will directly affect the final resume output.
              </div>

              <div className="btn-row end">
                <button className="btn-outline" onClick={() => navigate(-1)}>
                  ← Back
                </button>

                <button
                  className="btn-outline"
                  onClick={() => navigate(`/student/generate-resume/${resumeId}?fromStep5=1`)}
                >
                  Edit Step 1
                </button>

                <button
                  className="btn-primary"
                  onClick={() => navigate(`/student/resume/step5/generate/${resumeId}`)}
                >
                  Generate My Resume →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateResumeStep5Instructions;