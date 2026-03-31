import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentMenu from "../../components/menus/StudentMenu";
import ResumeStepper from "../../components/ResumeStepper";
import "../../components/ResumeStepper.css";
import "./GenerateResumeStep2Questions.css";

const questionsPool = [
  "Tell us a little about yourself and your background.",
  "Why are you interested in this internship?",
  "Describe a challenging situation you faced and how you overcame it.",
  "What are your strengths and weaknesses?",
  "Tell us about a project you are proud of.",
  "Where do you see yourself in 5 years?",
  "How do you handle stress or pressure?",
  "What motivates you to succeed?",
  "Describe a team experience where you contributed significantly.",
  "How do you prioritize tasks when you have multiple deadlines?",
  "Describe a time you made a mistake and what you learned.",
  "What programming languages or tools are you most comfortable with?",
  "How do you stay updated with technology trends?",
  "Explain a technical concept to a non-technical person.",
  "How do you handle criticism?",
  "Describe a time you showed leadership skills.",
  "What do you expect to learn from this internship?",
  "How do you solve problems creatively?",
  "What is your favorite project you’ve worked on and why?",
  "Tell us about a time you went above and beyond expectations."
];

const GenerateResumeStep2Questions = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [recording, setRecording] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const status = user.status || "unemployed";
  const username = user.name || "Student";

  useEffect(() => {
    const shuffled = [...questionsPool].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 5));
    setAnswers(new Array(5).fill(""));
  }, []);

  useEffect(() => {
    let interval: any;
    if (recording) interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [recording]);

  const handleRecord = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    setRecording(true);
    setTimer(0);

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      setAnswers((prev) => {
        const copy = [...prev];
        copy[currentIndex] = transcript;
        return copy;
      });
    };

    recognition.onend = () => setRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleStop = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const handleNext = async () => {
    if (!answers[currentIndex]) {
      alert("Please record your answer first.");
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setTimer(0);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/resume/${resumeId}/step2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      navigate(`/student/generate-resume-step2-results/${resumeId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save answers.");
    }
  };

  if (!questions.length) {
    return (
      <div style={{ display: "flex" }}>
        <StudentMenu status={status} username={username} />
        <div className="resume-main">Loading...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const answered = !!answers[currentIndex];

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="resume-main">
        <div className="q-header">
          <div>
            <h2 className="page-title">Fluency Assessment</h2>
            <p className="page-subtitle">
              Answer naturally like an interview. Make sure your mic works well.
            </p>
          </div>

          <div className="q-progress">
            <div className="pill">
              Question <b>{currentIndex + 1}</b> / {questions.length}
            </div>
            <div className={`pill ${recording ? "pill-live" : "pill-off"}`}>
              {recording ? "Recording" : "Not Recording"}
            </div>
          </div>
        </div>

        <ResumeStepper currentStep={2} />

        <div className="q-card">
          <div className="q-top">
            <div className="q-number">Q{currentIndex + 1}</div>
            <div className="q-timer">
              <span className="timer-dot" />
              <span className="timer-text">{timer}s</span>
            </div>
          </div>

          <div className="q-question">“{currentQuestion}”</div>

          <div className="controls">
            <button className="btn-primary" onClick={handleRecord} disabled={recording}>
              🎙 Start Recording
            </button>

            <button className="btn-outline" onClick={handleStop} disabled={!recording}>
              ⏹ Stop
            </button>
          </div>

          <div className="answer-box">
            <div className="answer-head">
              <span>Your Answer</span>
              <span className={`status ${answered ? "ok" : "warn"}`}>
                {answered ? "Captured" : "Not recorded"}
              </span>
            </div>

            <div className="answer-text">
              {answers[currentIndex] || "Record your answer to see the transcript here."}
            </div>
          </div>

          <div className="footer-actions">
            <button className="btn-ghost" onClick={() => navigate(-1)}>
              ← Back
            </button>

            <button className="btn-primary" onClick={handleNext}>
              {isLast ? "Complete Assessment →" : "Next Question →"}
            </button>
          </div>
        </div>

        <div className="tip-card">
          <div className="tip-title">Tips</div>
          <ul className="tip-list">
            <li>Speak clearly (normal speed).</li>
            <li>Keep answers structured: <b>Situation → Action → Result</b>.</li>
            <li>Try to avoid “umm” and long pauses.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GenerateResumeStep2Questions;