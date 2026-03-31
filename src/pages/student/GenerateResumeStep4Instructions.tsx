import { useParams, useNavigate } from "react-router-dom";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import "../../components/ResumeStepper.css";
import "./GenerateResumeStep4.css";

const GenerateResumeStep4Instructions = () => {
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
            <h2 className="page-title">Experience Assessment</h2>
            <p className="page-subtitle">
              Scenario-based questions to evaluate real workplace readiness.
            </p>
          </div>
        </div>

        <ResumeStepper currentStep={4} />

        <div className="instruction-card">
          <div className="instruction-head">
            <h3>🧩 Assessment Overview</h3>
            <span className="badge">Step 4</span>
          </div>

          <p className="instruction-intro">
            This section evaluates your real-world problem-solving, decision-making,
            and professional behavior in workplace-like situations. Your responses
            help measure how you handle challenges, communicate solutions, and work with others —
            key qualities for internship success.
          </p>

          <div className="instruction-list">
            <div className="instruction-item">
              <div className="icon">📝</div>
              <div>
                <strong>5 Scenario Questions</strong>
                <p>You will face common workplace situations.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">✅</div>
              <div>
                <strong>Choose the Most Professional Response</strong>
                <p>
                  Questions may be multiple-choice or short response.
                  Answer based on how you would act during a real internship.
                </p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">🔁</div>
              <div>
                <strong>No Going Back</strong>
                <p>Once you submit an answer, you cannot return to previous questions.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">🤖</div>
              <div>
                <strong>AI Evaluation Criteria</strong>
                <ul>
                  <li>Decision-making quality</li>
                  <li>Problem-solving logic</li>
                  <li>Professional communication</li>
                  <li>Ethical awareness</li>
                  <li>Adaptability & teamwork skills</li>
                </ul>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">🔇</div>
              <div>
                <strong>Minimize Distractions</strong>
                <p>Stay focused and avoid interruptions while answering.</p>
              </div>
            </div>
          </div>

          <div className="instruction-footer">
            <p className="ready-text">When you're ready, click below to begin.</p>

            <button
              className="start-btn"
              onClick={() => navigate(`/student/resume/step4/questions/${resumeId}`)}
            >
              Start Assessment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateResumeStep4Instructions;