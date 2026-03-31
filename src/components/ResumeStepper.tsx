import React from "react";
import "../pages/student/GenerateResume.css";
import "./ResumeStepper.css";


interface ResumeStepperProps {
  currentStep: number;
}

const steps = [
  "Personal Info",
  "Fluency",
  "Knowledge",
  "Experience",
  "Resume",
];

const ResumeStepper: React.FC<ResumeStepperProps> = ({ currentStep }) => {
  return (
    <div className="resume-stepper">
      {steps.map((label, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div className="step-wrapper" key={step}>
            <div
              className={`step-circle ${isActive ? "active" : ""} ${
                isCompleted ? "completed" : ""
              }`}
            >
              {step}
            </div>

            <span className="step-text">{label}</span>

            {step !== steps.length && (
              <div className={`step-line ${isCompleted ? "completed" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResumeStepper;
