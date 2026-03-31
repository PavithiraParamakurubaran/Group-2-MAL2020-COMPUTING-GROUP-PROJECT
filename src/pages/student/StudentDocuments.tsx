import { useEffect, useState } from "react";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";
import "./StudentDocuments.css";

const API_BASE = "http://localhost:3001";

type DocumentRow = {
  id: string | number;
  document_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
};

export default function StudentDocuments() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user?.id;
  const status = user?.status || "unemployed";
  const username = user?.name || "Student";

  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [docName, setDocName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/students/${studentId}/documents`
      );
      setDocuments(res.data?.documents || []);
    } catch (e) {
      console.error(e);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;
    fetchDocuments();
  }, [studentId]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_name", docName || file.name);

      await axios.post(
        `${API_BASE}/api/students/${studentId}/documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setDocName("");
      setFile(null);
      fetchDocuments();
      alert("Document uploaded successfully!");
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <StudentMenu status={status} username={username} />

      <div className="sd-main">
        <h2 className="sd-title">My Documents</h2>

        {/* Documents Table */}
        <div className="sd-tableWrap">
          {loading ? (
            <div className="sd-loading">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="sd-empty">No documents found.</div>
          ) : (
            <table className="sd-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.document_name}</td>
                    <td>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <a
                        href={`${API_BASE}${doc.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sd-btn view"
                      >
                        View
                      </a>

                      <a
                        href={`${API_BASE}${doc.file_path}`}
                        download
                        className="sd-btn download"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upload Section */}
        <div className="sd-uploadCard">
          <h3>Add New Document</h3>

          <input
            type="text"
            placeholder="Document Name (optional)"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="sd-input"
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="sd-file"
          />

          <button onClick={handleUpload} className="sd-uploadBtn">
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
}