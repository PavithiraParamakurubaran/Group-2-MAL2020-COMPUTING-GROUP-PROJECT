import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import axios from "axios";
import AdminMenu from "../../components/menus/AdminMenu";
import "./StudentManagement.css";
import addIcon from "../../assets/add.png";

const API_BASE = "http://localhost:3001";

interface Student {
  id?: number;
  student_id: string;
  name: string;
  email: string;
  password?: string;
  status: "unemployed" | "employed";
  ic_number: string;
  course: string;
  gender: "male" | "female";
  marital_status: "single" | "married";
  age: number;
  contact_number: string;
  academic_advisor: string;
}

interface StudentDocument {
  id: number | string;
  document_name: string;
  file_path: string;
  file_type?: string;
  created_at?: string;
}

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

const emptyStudent: Student = {
  student_id: "",
  name: "",
  email: "",
  password: "",
  status: "unemployed",
  ic_number: "",
  course: "",
  gender: "male",
  marital_status: "single",
  age: 18,
  contact_number: "",
  academic_advisor: "",
};

export default function StudentManagement() {
  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get<Student[]>(`${API_BASE}/api/admin/students`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = s.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      const matchesCourse =
        courseFilter === "all" ? true : s.course === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [students, searchTerm, courseFilter]);

  const handleViewResume = async (student: Student) => {
    if (!student.id) {
      alert("Student not found.");
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/api/students/${student.id}/documents`);
      const documents: StudentDocument[] = res.data?.documents || [];

      const generatedResume = documents.find(
        (doc) => doc.document_name === "Generated Resume" && doc.file_path
      );

      if (!generatedResume) {
        alert("No generated resume found.");
        return;
      }

      window.open(`${API_BASE}${generatedResume.file_path}`, "_blank");
    } catch (err) {
      console.error("View resume error:", err);
      alert("❌ Failed to fetch generated resume");
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent({
      id: student.id,
      student_id: student.student_id || "",
      name: student.name || "",
      email: student.email || "",
      password: "",
      status: student.status || "unemployed",
      ic_number: student.ic_number || "",
      course: student.course || "",
      gender: student.gender || "male",
      marital_status: student.marital_status || "single",
      age: Number(student.age) || 18,
      contact_number: student.contact_number || "",
      academic_advisor: student.academic_advisor || "",
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingStudent({ ...emptyStudent });
    setShowModal(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await axios.delete(`${API_BASE}/api/admin/students/${id}`);
      alert("✅ Student deleted successfully!");
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete student");
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editingStudent) return;
    const { name, value } = e.target;
    const newValue = name === "age" ? parseInt(value) || 0 : value;

    setEditingStudent({ ...editingStudent, [name]: newValue } as Student);
  };

  const handleSave = async () => {
    if (!editingStudent) return;

    try {
      if (!editingStudent.name.trim()) {
        alert("Student name is required");
        return;
      }

      if (!editingStudent.student_id.trim()) {
        alert("Student ID is required");
        return;
      }

      if (!editingStudent.email.trim()) {
        alert("Email is required");
        return;
      }

      if (!editingStudent.course.trim()) {
        alert("Course is required");
        return;
      }

      if (!editingStudent.id && !editingStudent.password?.trim()) {
        alert("Password is required for new student");
        return;
      }

      if (editingStudent.id) {
        await axios.put(
          `${API_BASE}/api/admin/students/${editingStudent.id}`,
          editingStudent
        );
        alert("✅ Student updated successfully!");
      } else {
        await axios.post(`${API_BASE}/api/admin/students`, editingStudent);
        alert("✅ Student added successfully!");
      }

      setShowModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save student");
    }
  };

  const handleCsvChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file first.");
      return;
    }

    try {
      setUploadingCsv(true);

      const formData = new FormData();
      formData.append("file", csvFile);

      const res = await axios.post(
        `${API_BASE}/api/admin/students/import-csv`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const data = res.data;

      alert(
        `✅ CSV upload completed!\nInserted: ${data.inserted}\nFailed: ${data.failed}` +
          (data.errors?.length ? `\n\nErrors:\n${data.errors.join("\n")}` : "")
      );

      setCsvFile(null);
      fetchStudents();
    } catch (err) {
      console.error("CSV upload error:", err);
      alert("❌ Failed to upload CSV");
    } finally {
      setUploadingCsv(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent =
      "student_id,name,email,password\nS1001,Alice Tan,alice@gmail.com,alice123\nS1002,Ben Lee,ben@gmail.com,ben123";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminMenu adminName={admin?.name || "Admin"} />

      <div className="admin-dashboard">
        <div className="sm-topbar">
          <div>
            <h2 className="page-title">Student Management</h2>
            <p className="sm-subtitle">
              Manage student records, search by name, filter by course, or bulk upload using CSV.
            </p>
          </div>
        </div>

        <div className="sm-filters">
          <div className="sm-filter">
            <label className="sm-filter-label">Search by Name</label>
            <input
              type="text"
              className="sm-input"
              placeholder="Enter student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sm-filter">
            <label className="sm-filter-label">Filter by Course</label>
            <select
              className="sm-select"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courseOptions.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <button
            className="sm-clear-btn"
            onClick={() => {
              setSearchTerm("");
              setCourseFilter("all");
            }}
            type="button"
          >
            Clear
          </button>
        </div>

        <div className="sm-csv-box">
          <div className="sm-csv-left">
            <h3 className="sm-csv-title">Bulk Upload Students</h3>
            <p className="sm-csv-text">
              Upload a CSV file with student ID, name, email, and password only.
            </p>
          </div>

          <div className="sm-csv-actions">
            <button className="sm-template-btn" type="button" onClick={downloadCsvTemplate}>
              Download CSV Template
            </button>

            <input
              type="file"
              accept=".csv"
              onChange={handleCsvChange}
              className="sm-csv-input"
            />

            <button
              className="sm-upload-btn"
              type="button"
              onClick={handleCsvUpload}
              disabled={uploadingCsv}
            >
              {uploadingCsv ? "Uploading..." : "Upload CSV"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="sm-empty">Loading...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="sm-empty">No students found.</div>
        ) : (
          <div className="student-card-grid">
            {filteredStudents.map((s) => (
              <div className="student-card" key={s.id}>
                <div className="student-card-head">
                  <div>
                    <h3 className="student-name">{s.name}</h3>
                    <div className="student-id">{s.student_id}</div>
                  </div>

                  <span className={`status-badge ${s.status}`}>
                    {s.status}
                  </span>
                </div>

                <div className="student-card-body">
                  <div className="student-info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{s.email}</span>
                  </div>

                  <div className="student-info-row">
                    <span className="info-label">Course</span>
                    <span className="info-value">{s.course || "-"}</span>
                  </div>

                  <div className="student-info-row">
                    <span className="info-label">Contact</span>
                    <span className="info-value">{s.contact_number || "-"}</span>
                  </div>

                  <div className="student-info-row">
                    <span className="info-label">Advisor</span>
                    <span className="info-value">{s.academic_advisor || "-"}</span>
                  </div>
                </div>

                <div className="student-card-actions">
                  <button
                    className="view-btn"
                    onClick={() => handleViewResume(s)}
                  >
                    View Resume
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="floating-add" onClick={handleAdd}>
  +
</button>
      </div>

      {showModal && editingStudent && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="profile-title">
              {editingStudent.id ? "Edit Student" : "Add Student"}
            </h2>

            <div className="profile-details">
              {Object.entries(editingStudent).map(([key, val]) => {
                if (key === "id") return null;

                if (key === "status") {
                  return (
                    <div className="profile-row" key={key}>
                      <div className="profile-label">Status</div>
                      <div className="profile-value">
                        <select name={key} value={val as string} onChange={handleChange}>
                          <option value="unemployed">Unemployed</option>
                          <option value="employed">Employed</option>
                        </select>
                      </div>
                    </div>
                  );
                }

                if (key === "gender") {
                  return (
                    <div className="profile-row" key={key}>
                      <div className="profile-label">Gender</div>
                      <div className="profile-value">
                        <select name={key} value={val as string} onChange={handleChange}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  );
                }

                if (key === "marital_status") {
                  return (
                    <div className="profile-row" key={key}>
                      <div className="profile-label">Marital Status</div>
                      <div className="profile-value">
                        <select name={key} value={val as string} onChange={handleChange}>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                        </select>
                      </div>
                    </div>
                  );
                }

                if (key === "course") {
                  return (
                    <div className="profile-row" key={key}>
                      <div className="profile-label">Course</div>
                      <div className="profile-value">
                        <select
                          name={key}
                          value={val as string}
                          onChange={handleChange}
                        >
                          <option value="">Select course</option>
                          {courseOptions.map((course) => (
                            <option key={course} value={course}>
                              {course}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                }

                if (key === "password") {
                  return (
                    <div className="profile-row" key={key}>
                      <div className="profile-label">
                        {editingStudent.id ? "New Password" : "Password"}
                      </div>
                      <div className="profile-value">
                        <input
                          name={key}
                          type="password"
                          value={val as string}
                          onChange={handleChange}
                          placeholder={
                            editingStudent.id
                              ? "Leave blank to keep current password"
                              : "Enter password"
                          }
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="profile-row" key={key}>
                    <div className="profile-label">
                      {key.replace("_", " ")}
                    </div>
                    <div className="profile-value">
                      <input
                        name={key}
                        type={key === "age" ? "number" : "text"}
                        value={(val as any) ?? ""}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="profile-buttons">
              <button onClick={handleSave}>Save</button>
              <button
                className="secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingStudent(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}