import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";

const ResumePreview = () => {
  const { resumeId } = useParams();
  const [resume, setResume] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios.get(`/api/resume/${resumeId}/complete`)
      .then(res => setResume(res.data.data));
  }, []);

  const downloadPDF = async () => {
    const res = await axios.get(
      `/api/resume/${resumeId}/pdf`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "AI_Resume.pdf";
    link.click();
  };

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={user.status} username={user.name} />

      <div className="resume-main">
        <h2>Resume Preview</h2>

        <div className="resume-preview">
          <h3>{resume?.step1?.full_name}</h3>
          <p>{resume?.step1?.education}</p>
        </div>

        <button onClick={downloadPDF}>
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default ResumePreview;