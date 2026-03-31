import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import "../../components/ResumeStepper.css";
import "./GenerateResumeStep4Questions.css";

interface Question {
  question: string;
  options: string[];
  correctOptions: string[];
}

interface Answer {
  questionIndex: number;
  selectedOptions: string[];
}

const GenerateResumeStep4Questions = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const status = user.status || "unemployed";
  const username = user.name || "Student";

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:3001/api/resume/${resumeId}/step4/questions`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch questions");
        }

        const qs: Question[] = data.questions || [];
        setQuestions(qs);

        setAnswers(
          qs.map((_, idx) => ({
            questionIndex: idx,
            selectedOptions: [],
          }))
        );
      } catch (err: any) {
        console.error("Fetch Step4 Questions Error:", err);
        setError(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [resumeId]);

  const handleOptionToggle = (qIndex: number, option: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionIndex === qIndex
          ? {
              ...a,
              selectedOptions: a.selectedOptions.includes(option)
                ? a.selectedOptions.filter((o) => o !== option)
                : [...a.selectedOptions, option],
            }
          : a
      )
    );
  };

  const answeredCount = answers.filter((a) => a.selectedOptions.length > 0).length;

  const handleSubmit = async () => {
    if (saving) return;

    const missing = answers.findIndex((a) => a.selectedOptions.length === 0);
    if (missing !== -1) {
      alert(`Please answer Question ${missing + 1} before submitting.`);
      return;
    }

    setSaving(true);

    // Keep your existing scoring logic
    const score = answers.reduce((acc, a) => {
      const correct = questions[a.questionIndex]?.correctOptions || [];
      return acc + a.selectedOptions.filter((opt) => correct.includes(opt)).length;
    }, 0);

    const contribution = (score / (questions.length * 2)) * 20;

    try {
      const res = await fetch(
        `http://localhost:3001/api/resume/${resumeId}/step4/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, score, contribution }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save result");
      }

      navigate(`/student/resume/step4/result/${resumeId}`);
    } catch (err: any) {
      console.error("Submit Step4 Error:", err);
      alert("Error submitting answers: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <StudentMenu status={status} username={username} />
        <div className="resume-main">
          <div className="panel">
            <div className="loading">
              <div className="spinner" />
              <div>
                <div className="loading-title">Loading Step 4 questions…</div>
                <div className="muted">Please wait.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex" }}>
        <StudentMenu status={status} username={username} />
        <div className="resume-main">
          <div className="panel error">
            <div className="error-title">⚠ Error</div>
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
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="resume-main">
        <div className="topbar">
          <div>
            <h2 className="page-title">Experience Assessment</h2>
            <p className="page-subtitle">
              Questions are combination of multiple choices and single-choice questions. Choose appropriate professional responses for each scenario. 
            </p>
          </div>

          <div className="topbar-right">
            <div className="pill">
              Answered <b>{answeredCount}</b> / {questions.length}
            </div>
            <div className={`pill ${saving ? "pill-live" : "pill-off"}`}>
              {saving ? "Submitting" : "Ready"}
            </div>
          </div>
        </div>

        <ResumeStepper currentStep={4} />

        <div className="panel">
          {questions.map((q, idx) => {
            const selected = answers[idx]?.selectedOptions || [];
            return (
              <div key={idx} className="q-block">
                <div className="q-title">
                  <span className="q-num">{idx + 1}</span>
                  <span className="q-text">{q.question}</span>
                </div>

                <div className="option-group">
                  {q.options.map((opt) => {
                    const checked = selected.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`modern-option ${checked ? "selected" : ""} ${
                          saving ? "disabled" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleOptionToggle(idx, opt)}
                          disabled={saving}
                        />
                        <span className="custom-check" aria-hidden="true" />
                        <span className="option-text">{opt}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="q-footer">
                  <span className={`mini ${selected.length ? "ok" : "warn"}`}>
                    {selected.length ? "Answered" : "Not answered yet"}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="footer-actions">
            <button className="btn-outline" onClick={() => navigate(-1)} disabled={saving}>
              ← Back
            </button>

            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Submitting..." : "Submit Step 4 →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateResumeStep4Questions;