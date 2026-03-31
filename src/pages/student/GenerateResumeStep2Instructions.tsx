import { useParams, useNavigate } from "react-router-dom";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import "../../components/ResumeStepper.css";
import "./GenerateResumeStep2.css";

const GenerateResumeStep2Instructions = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const status = user.status || "unemployed";
  const username = user.name || "Student";

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="resume-main">
        <div className="page-header">
          <div>
            <h2 className="page-title">Fluency Assessment</h2>
            <p className="page-subtitle">
              This assessment evaluates your communication skills for internship readiness.
            </p>
          </div>
        </div>

        <ResumeStepper currentStep={2} />

        <div className="instruction-card">
          <div className="instruction-head">
            <h3>📢 Assessment Overview</h3>
            <span className="badge">Step 2</span>
          </div>

          <p className="instruction-intro">
            You will complete 5 short speaking tasks designed to measure your fluency,
            pronunciation, grammar, and overall communication confidence.
          </p>

          <div className="instruction-list">
            <div className="instruction-item">
              <div className="icon">🎙</div>
              <div>
                <strong>5 Speaking Questions</strong>
                <p>Each question appears one at a time.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">⏱</div>
              <div>
                <strong>60 Seconds Per Question</strong>
                <p>Speak clearly and confidently.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">🤖</div>
              <div>
                <strong>AI Speech Analysis</strong>
                <p>Your speech will be converted to text and evaluated automatically.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">📊</div>
              <div>
                <strong>Evaluation Criteria</strong>
                <ul>
                  <li>Pronunciation</li>
                  <li>Grammar</li>
                  <li>Vocabulary</li>
                  <li>Fluency</li>
                  <li>Confidence</li>
                </ul>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">🔇</div>
              <div>
                <strong>Quiet Environment</strong>
                <p>Ensure minimal background noise and working microphone.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">⚠</div>
              <div>
                <strong>No Re-recording</strong>
                <p>Once submitted, answers cannot be changed.</p>
              </div>
            </div>
          </div>

          <div className="instruction-footer">
            <p className="ready-text">
              When you're ready, click below to begin your assessment.
            </p>

            <button
              className="start-btn"
              onClick={() =>
                navigate(`/student/resume/step2/questions/${resumeId}`)
              }
            >
              Start Assessment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateResumeStep2Instructions;