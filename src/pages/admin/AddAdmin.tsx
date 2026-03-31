import { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import AdminMenu from "../../components/menus/AdminMenu";
import addIcon from "../../assets/add.png";
import "./StudentManagement.css"; // reuse same CSS

interface Admin {
  id?: number;
  name: string;
  email: string;
  password?: string;
  contact_number: string;
  department: string;
  office_hours: string;
}

const emptyAdmin: Admin = {
  name: "",
  email: "",
  password: "",
  contact_number: "",
  department: "",
  office_hours: "",
};

export default function AdminManagement() {
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get<Admin[]>(
        "http://localhost:3001/api/admin/admins"
      );
      setAdmins(res.data);
    } catch {
      alert("❌ Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAdmin({ ...emptyAdmin });
    setShowModal(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin({ ...admin });
    setShowModal(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!confirm("Delete this admin?")) return;

    try {
      await axios.delete(
        `http://localhost:3001/api/admin/admins/${id}`
      );
      alert("✅ Admin deleted");
      fetchAdmins();
    } catch {
      alert("❌ Failed to delete admin");
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (!editingAdmin) return;
    const { name, value } = e.target;
    setEditingAdmin({ ...editingAdmin, [name]: value });
  };

  const handleSave = async () => {
    if (!editingAdmin) return;

    try {
      if (editingAdmin.id) {
        await axios.put(
          `http://localhost:3001/api/admin/admins/${editingAdmin.id}`,
          editingAdmin
        );
        alert("✅ Admin updated");
      } else {
        await axios.post(
          "http://localhost:3001/api/admin/admins",
          editingAdmin
        );
        alert("✅ Admin added");
      }

      setShowModal(false);
      fetchAdmins();
    } catch {
      alert("❌ Failed to save admin");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminMenu adminName={adminUser?.name || "Admin"} />

      <div className="admin-dashboard">
        <h2 className="page-title">Admin Management</h2>

        <div className="table-responsive">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="student-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Office Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.email}</td>
                    <td>{a.department}</td>
                    <td>{a.contact_number}</td>
                    <td>{a.office_hours}</td>
                    <td className="action-cell">
                      <button className="edit-btn" onClick={() => handleEdit(a)}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(a.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* FLOATING ADD */}
        <button className="floating-add" onClick={handleAdd}>
  +
</button>
      </div>

      {/* MODAL */}
      {showModal && editingAdmin && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="profile-title">
              {editingAdmin.id ? "Edit Admin" : "Add Admin"}
            </h2>

            <div className="profile-details">
              {Object.entries(editingAdmin).map(([key, val]) => {
                if (key === "id") return null;

                return (
                  <div className="profile-row" key={key}>
                    <div className="profile-label">
                      {key.replace("_", " ")}
                    </div>
                    <div className="profile-value">
                      <input
                        type={key === "password" ? "password" : "text"}
                        name={key}
                        value={val as string}
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
                onClick={() => setShowModal(false)}
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
