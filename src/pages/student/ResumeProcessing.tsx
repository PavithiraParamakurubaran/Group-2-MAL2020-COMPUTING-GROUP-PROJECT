import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentMenu from "../../components/menus/StudentMenu";

const ResumeProcessing = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/student/resume/${resumeId}/preview`);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={user.status} username={user.name} />

      <div className="resume-main">
        <h2>Generating Your AI Resume...</h2>
        <div className="loader"></div>
      </div>
    </div>
  );
};

export default ResumeProcessing;