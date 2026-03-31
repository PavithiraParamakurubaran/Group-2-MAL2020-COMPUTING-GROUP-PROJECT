import { useEffect, useState } from "react";
import axios from "axios";
import AdminMenu from "../../components/menus/AdminMenu";
import "./ReminderPage.css";

interface Reminder {
  id: number;
  title: string;
  message: string;
  deadline: string;
  attachment?: string | null;
  created_at: string;
}

export default function ReminderPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const adminName = user.name || "Admin";

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deadline, setDeadline] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      const res = await axios.get<Reminder[]>(
        "http://localhost:3001/api/admin/reminders"
      );
      if (Array.isArray(res.data)) setReminders(res.data);
      else setReminders([]);
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
      setReminders([]);
    }
  };

  // Create reminder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", message);
      formData.append("deadline", deadline);
      if (attachment) formData.append("attachment", attachment);

      const res = await axios.post(
        "http://localhost:3001/api/admin/reminders",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert(res.data.message);
        setTitle("");
        setMessage("");
        setDeadline("");
        setAttachment(null);
        fetchReminders();
      }
    } catch (err) {
      console.error("Failed to create reminder:", err);
      alert("Error creating reminder");
    }
  };

  // Resend reminder
  const handleResend = async (id: number) => {
    try {
      await axios.post(`http://localhost:3001/api/admin/reminders/resend/${id}`);
      alert("Reminder resent!");
    } catch (err) {
      console.error("Failed to resend reminder:", err);
      alert("Error resending reminder");
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <div className="admin-page">
      <AdminMenu adminName={adminName} />

      <div className="admin-content">
        <h2 className="page-title">Manage Reminders</h2>

        {/* Create Reminder Form */}
        <div className="table-responsive" style={{ marginBottom: "30px" }}>
          <h3 className="profile-title">Create Reminder</h3>
          <form className="profile-details" onSubmit={handleSubmit}>
            <div className="profile-row">
              <label className="profile-label">Title</label>
              <div className="profile-value">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="profile-row">
              <label className="profile-label">Message</label>
              <div className="profile-value">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="profile-textarea"
                />
              </div>
            </div>

            <div className="profile-row">
  <label className="profile-label">Deadline</label>
  <div className="profile-value deadline-wrapper">
    <input
      type="datetime-local"
      value={deadline}
      onChange={(e) => setDeadline(e.target.value)}
      required
    />
    <span className="calendar-icon" onClick={() => {
      const input = document.getElementById("deadline-input") as HTMLInputElement;
      input && input.showPicker && input.showPicker(); // showPicker works in modern browsers
    }}>
      🕒
    </span>
  </div>
</div>


            <div className="profile-row">
              <label className="profile-label">Attachment (optional)</label>
              <div className="profile-value">
                <input
                  type="file"
                  onChange={(e) =>
                    e.target.files && setAttachment(e.target.files[0])
                  }
                />
                {attachment && (
                  <span style={{ marginLeft: "10px" }}>{attachment.name}</span>
                )}
              </div>
            </div>

            <div className="profile-buttons">
              <button type="submit">Create Reminder</button>
            </div>
          </form>
        </div>

        {/* Reminders Table */}
        <div className="table-responsive">
          <h3 className="page-title">Recent Reminders</h3>
          <table className="student-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Deadline</th>
                <th>Attachment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.length > 0 ? (
                reminders.map((r) => (
                  <tr key={r.id}>
                    <td>{r.title}</td>
                    <td>{new Date(r.deadline).toLocaleString()}</td>
                    <td>
                      {r.attachment ? (
                        <a
                          href={`http://localhost:3001${r.attachment}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="action-cell">
                      <button
                        className="view-btn"
                        onClick={() => {
                          setSelectedReminder(r);
                          setModalOpen(true);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleResend(r.id)}
                      >
                        Resend
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                    No reminders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup */}
      {modalOpen && selectedReminder && (
        <div
          className="modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selectedReminder.title}</h2>
            <p>{selectedReminder.message}</p>
            <p>
              <strong>Deadline:</strong>{" "}
              {new Date(selectedReminder.deadline).toLocaleString()}
            </p>
            {selectedReminder.attachment && (
              <p>
                <strong>Attachment:</strong>{" "}
                <a
                  href={`http://localhost:3001${selectedReminder.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </p>
            )}
            <button onClick={() => setModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
