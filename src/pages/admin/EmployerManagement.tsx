import { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import AdminMenu from "../../components/menus/AdminMenu";
import "./EmployerManagement.css";
import addIcon from "../../assets/add.png";

interface Employer {
  id?: number;
  company_name: string;
  headquarters: string;
  website_url: string;
  email: string;
  contact_number: string;
  year_founded: number;
  industry: string;
  fax: string;
  office_hours: string;
  description: string;
  company_logo?: string;
}

const emptyEmployer: Employer = {
  company_name: "",
  headquarters: "",
  website_url: "",
  email: "",
  contact_number: "",
  year_founded: 2020,
  industry: "",
  fax: "",
  office_hours: "",
  description: "",
};

export default function EmployerManagement() {
  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/admin/employers");
      setEmployers(res.data);
    } catch {
      alert("❌ Failed to load employers");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emp: Employer) => {
    setEditingEmployer({ ...emp });
    setLogoFile(null);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingEmployer({ ...emptyEmployer });
    setLogoFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Delete this employer?")) return;

    await axios.delete(`http://localhost:3001/api/admin/employers/${id}`);
    fetchEmployers();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingEmployer) return;

    const { name, value } = e.target;
    setEditingEmployer({
      ...editingEmployer,
      [name]: name === "year_founded" ? Number(value) : value,
    });
  };

  const handleSave = async () => {
    if (!editingEmployer) return;

    const formData = new FormData();
    Object.entries(editingEmployer).forEach(([k, v]) => {
      if (k !== "company_logo") formData.append(k, String(v ?? ""));
    });

    if (logoFile) formData.append("company_logo", logoFile);

    if (editingEmployer.id) {
      await axios.put(
        `http://localhost:3001/api/admin/employers/${editingEmployer.id}`,
        formData
      );
    } else {
      await axios.post(
        `http://localhost:3001/api/admin/employers`,
        formData
      );
    }

    setShowModal(false);
    fetchEmployers();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminMenu adminName={admin?.name || "Admin"} />

      <div className="admin-dashboard">
        <h2 className="page-title">Employer Management</h2>

        <div className="table-responsive">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="employer-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Industry</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {employers.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {e.company_logo && (
                        <img
                          src={`http://localhost:3001${e.company_logo}`}
                          className="company-logo"
                        />
                      )}
                    </td>
                    <td>{e.company_name}</td>
                    <td>{e.email}</td>
                    <td>{e.contact_number}</td>
                    <td>{e.industry}</td>
                    <td className="action-cell">
                      <button className="edit-btn" onClick={() => handleEdit(e)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(e.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

       <button className="floating-add" onClick={handleAdd}>
  +
</button>
      </div>

      {showModal && editingEmployer && (
        <div className="modal-overlay">
          <div className="modal-card">

            <h2>{editingEmployer.id ? "Edit Employer" : "Add Employer"}</h2>

            {Object.entries(editingEmployer).map(([key, val]) => {
              if (key === "id" || key === "company_logo") return null;

              return (
                <div className="profile-row" key={key}>
                  <div className="profile-label">{key.replace("_", " ")}</div>
                  <div className="profile-value">
                    <input
                      name={key}
                      value={val as any}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              );
            })}

            <div className="profile-row">
              <div className="profile-label">Company Logo</div>
              <input type="file" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            </div>

            <div className="profile-buttons">
              <button onClick={handleSave}>Save</button>
              <button className="secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
