import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminMenu from "../../components/menus/AdminMenu";
import "./AdminStudentDocuments.css";

const API_BASE = "http://localhost:3001";

type AdminStudentDocument = {
  student_db_id: number;
  student_code: string;
  student_name: string;
  course: string;
  source_id: number;
  document_name: string;
  document_type:
    | "normal_document"
    | "daily_report"
    | "weekly_report"
    | "generated_resume";
  file_path: string | null;
  file_type: string | null;
  uploaded_at: string;
  extra_info: string | null;
};

const courseOptions = [
  "Diploma in Logistics Management",
  "Diploma in Business Studies",
  "Diploma in E-Business Technology",
  "Diploma of Accountancy",
  "Diploma in Computer Science",
  "Diploma in Electrical & Electronics Engineering Technology",
  "BA (Hons) Accounting & Finance (Accounting)",
  "BSc (Hons) Maritime Business (Logistics)",
  "BSc (Hons) Business Management",
  "BSc (Hons) Computer Science (Cyber security)",
  "BSc (Hons) Computer Science (Software Engineering)",
];

function formatDocType(type: AdminStudentDocument["document_type"]) {
  if (type === "normal_document") return "Normal Document";
  if (type === "daily_report") return "Daily Report";
  if (type === "weekly_report") return "Weekly Report";
  return "Generated Resume";
}

export default function AdminStudentDocuments() {
  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  const [documents, setDocuments] = useState<AdminStudentDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedDoc, setSelectedDoc] = useState<AdminStudentDocument | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/admin/student-documents`);
      setDocuments(res.data?.documents || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !q ||
        doc.student_name?.toLowerCase().includes(q) ||
        doc.student_code?.toLowerCase().includes(q) ||
        doc.document_name?.toLowerCase().includes(q);

      const matchesCourse =
        courseFilter === "all" ? true : doc.course === courseFilter;

      const matchesType =
        typeFilter === "all" ? true : doc.document_type === typeFilter;

      return matchesSearch && matchesCourse && matchesType;
    });
  }, [documents, searchTerm, courseFilter, typeFilter]);

  const counts = useMemo(() => {
    return {
      total: documents.length,
      normal: documents.filter((d) => d.document_type === "normal_document").length,
      daily: documents.filter((d) => d.document_type === "daily_report").length,
      weekly: documents.filter((d) => d.document_type === "weekly_report").length,
      resume: documents.filter((d) => d.document_type === "generated_resume").length,
    };
  }, [documents]);

  const openModal = (doc: AdminStudentDocument) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
  };

  const getFileUrl = (path: string | null) => {
    if (!path) return "";
    return `${API_BASE}${path}`;
  };

  return (
    <div className="asd-layout">
      <AdminMenu adminName={admin?.name || "Admin"} />

      <div className="asd-main">
        <div className="asd-topbar">
          <div>
            <h1 className="asd-title">Student Documents</h1>
            <p className="asd-subtitle">
              View all uploaded documents, reports, and generated resumes.
            </p>
          </div>

          <button className="asd-btn asd-btn-ghost" onClick={fetchDocuments} type="button">
            Refresh
          </button>
        </div>

        <div className="asd-cards">
          <div className="asd-card">
            <div className="asd-card-label">Total Documents</div>
            <div className="asd-card-value">{counts.total}</div>
          </div>

          <div className="asd-card">
            <div className="asd-card-label">Normal Documents</div>
            <div className="asd-card-value">{counts.normal}</div>
          </div>

          <div className="asd-card">
            <div className="asd-card-label">Daily Reports</div>
            <div className="asd-card-value">{counts.daily}</div>
          </div>

          <div className="asd-card">
            <div className="asd-card-label">Weekly Reports</div>
            <div className="asd-card-value">{counts.weekly}</div>
          </div>

          <div className="asd-card">
            <div className="asd-card-label">Generated Resumes</div>
            <div className="asd-card-value">{counts.resume}</div>
          </div>
        </div>

        <div className="asd-filters">
          <div className="asd-filter">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by student, ID, or document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="asd-filter">
            <label>Course</label>
            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="all">All Courses</option>
              {courseOptions.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div className="asd-filter">
            <label>Document Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="normal_document">Normal Document</option>
              <option value="daily_report">Daily Report</option>
              <option value="weekly_report">Weekly Report</option>
              <option value="generated_resume">Generated Resume</option>
            </select>
          </div>

          <button
            className="asd-btn asd-btn-clear"
            type="button"
            onClick={() => {
              setSearchTerm("");
              setCourseFilter("all");
              setTypeFilter("all");
            }}
          >
            Clear
          </button>
        </div>

        <div className="asd-tableWrap">
          {loading ? (
            <div className="asd-empty">Loading...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="asd-empty">No documents found.</div>
          ) : (
            <table className="asd-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Course</th>
                  <th>Document Name</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                  <th>File</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map((doc, index) => (
                  <tr key={`${doc.document_type}-${doc.source_id}-${index}`}>
                    <td>{doc.student_name}</td>
                    <td>{doc.student_code}</td>
                    <td>{doc.course}</td>
                    <td className="asd-docName">{doc.document_name}</td>
                    <td>
                      <span className={`asd-badge ${doc.document_type}`}>
                        {formatDocType(doc.document_type)}
                      </span>
                    </td>
                    <td>{doc.uploaded_at ? String(doc.uploaded_at).slice(0, 10) : "-"}</td>
                    <td>{doc.file_type || "-"}</td>
                    <td>
                      <div className="asd-actions">
                        <button
                          className="asd-btn asd-btn-small"
                          onClick={() => openModal(doc)}
                          type="button"
                        >
                          View
                        </button>

                        {doc.file_path && (
                          <a
                            className="asd-btn asd-btn-small asd-btn-dark"
                            href={getFileUrl(doc.file_path)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open File
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && selectedDoc && (
        <div className="asd-modalOverlay" onClick={closeModal}>
          <div className="asd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="asd-modalHeader">
              <div>
                <h2>Document Details</h2>
                <p>{selectedDoc.document_name}</p>
              </div>

              <button className="asd-closeBtn" onClick={closeModal} type="button">
                ✕
              </button>
            </div>

            <div className="asd-modalBody">
              <div className="asd-detailRow">
                <span className="asd-detailLabel">Student</span>
                <span>{selectedDoc.student_name}</span>
              </div>

              <div className="asd-detailRow">
                <span className="asd-detailLabel">Student ID</span>
                <span>{selectedDoc.student_code}</span>
              </div>

              <div className="asd-detailRow">
                <span className="asd-detailLabel">Course</span>
                <span>{selectedDoc.course}</span>
              </div>

              <div className="asd-detailRow">
                <span className="asd-detailLabel">Type</span>
                <span>{formatDocType(selectedDoc.document_type)}</span>
              </div>

              <div className="asd-detailRow">
                <span className="asd-detailLabel">Uploaded Date</span>
                <span>{selectedDoc.uploaded_at ? String(selectedDoc.uploaded_at).slice(0, 10) : "-"}</span>
              </div>

              <div className="asd-detailRow">
                <span className="asd-detailLabel">File Type</span>
                <span>{selectedDoc.file_type || "-"}</span>
              </div>

              {selectedDoc.extra_info && (
                <div className="asd-extraBox">
                  <div className="asd-detailLabel">Preview / Summary</div>
                  <div className="asd-extraText">{selectedDoc.extra_info}</div>
                </div>
              )}
            </div>

            <div className="asd-modalActions">
              {selectedDoc.file_path && (
                <a
                  className="asd-btn asd-btn-dark"
                  href={getFileUrl(selectedDoc.file_path)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Attached File
                </a>
              )}

              <button className="asd-btn asd-btn-ghost" onClick={closeModal} type="button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}