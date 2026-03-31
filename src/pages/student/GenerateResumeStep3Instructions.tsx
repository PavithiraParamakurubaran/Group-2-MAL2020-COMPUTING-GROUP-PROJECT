import { useParams, useNavigate } from "react-router-dom";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import "../../components/ResumeStepper.css";
import "./GenerateResumeStep3.css";

const GenerateResumeStep3Instructions = () => {
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
            <h2 className="page-title">Knowledge Assessment</h2>
            <p className="page-subtitle">
              This assessment evaluates your understanding of your field and readiness for internship tasks.
            </p>
          </div>
        </div>

        <ResumeStepper currentStep={3} />

        <div className="instruction-card">
          <div className="instruction-head">
            <h3>📘 Assessment Overview</h3>
            <span className="badge">Step 3</span>
          </div>

          <p className="instruction-intro">
            You will answer multiple-choice and short-answer questions. The quiz is adaptive — difficulty increases when you answer correctly.
          </p>

          <div className="instruction-list">
            <div className="instruction-item">
              <div className="icon">🧠</div>
              <div>
                <strong>10 Questions</strong>
                <p>Questions appear one at a time on your screen.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">🎯</div>
              <div>
                <strong>Course-based Questions</strong>
                <p>Selected based on your course/field (e.g., CS, Business, Design, Engineering).</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">📈</div>
              <div>
                <strong>Adaptive Difficulty</strong>
                <p>Correct answers lead to more advanced questions.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">⏱</div>
              <div>
                <strong>45 Seconds Each</strong>
                <p>Read carefully and respond within the time limit.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">🤖</div>
              <div>
                <strong>Instant AI Feedback</strong>
                <p>After each answer, AI evaluates and provides short explanation.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">📊</div>
              <div>
                <strong>Scoring Based On</strong>
                <ul>
                  <li>Accuracy</li>
                  <li>Time taken</li>
                  <li>Difficulty level reached</li>
                </ul>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">⚠</div>
              <div>
                <strong>Do Not Refresh</strong>
                <p>If connection is lost, your progress may not be saved.</p>
              </div>
            </div>

            <div className="instruction-item">
              <div className="icon">🏁</div>
              <div>
                <strong>Final Result</strong>
                <p>You will receive a Knowledge Score + Level (Beginner / Intermediate / Advanced).</p>
              </div>
            </div>
          </div>

          <div className="instruction-footer">
            <p className="ready-text">When you're ready, click below to begin.</p>

            <button
              className="start-btn"
              onClick={() => navigate(`/student/resume/step3/questions/${resumeId}`)}
            >
              Start Assessment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateResumeStep3Instructions;