import { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";
import "./StudentProfile.css";

interface StudentProfileData {
  id: number;
  student_id: string;
  name: string;
  ic_number?: string;
  course?: string;
  email: string;
  gender?: string;
  marital_status?: string;
  age?: number;
  contact_number?: string;
  academic_advisor?: string;
  emergency_contact?: string;
  profile_picture?: string;
}

const API_BASE = "http://localhost:3001";

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

export default function StudentProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axios.get<StudentProfileData>(`${API_BASE}/api/students/${user.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    if (user?.id) fetchProfile();
  }, [user?.id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!profile) return;
    const { name, value } = e.target;

    // keep age numeric-ish, but still safe
    if (name === "age") {
      const n = value === "" ? undefined : Number(value);
      setProfile({ ...profile, age: Number.isFinite(n as number) ? (n as number) : undefined });
      return;
    }

    setProfile({ ...profile, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setProfileImage(file);

    // preview only
    setProfile({
      ...profile,
      profile_picture: URL.createObjectURL(file),
    });
  };

  const fetchFreshProfile = async () => {
    const res = await axios.get<StudentProfileData>(`${API_BASE}/api/students/${user.id}`);
    setProfile(res.data);
  };

  const handleSave = async () => {
    if (!profile || !user?.id) return;

    try {
      setSaving(true);

      const formData = new FormData();

      // append all fields except profile_picture preview string
      Object.entries(profile).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "profile_picture") return;
        formData.append(key, String(value));
      });

      if (profileImage) {
        formData.append("profile_picture", profileImage);
      }

      await axios.put(`${API_BASE}/api/students/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully ✅");
      setEditing(false);
      setProfileImage(null);
      await fetchFreshProfile();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setEditing(false);
    setProfileImage(null);
    try {
      await fetchFreshProfile();
    } catch {}
  };

  if (!profile) return <div className="sp-loading">Loading...</div>;

  const imgSrc =
    profile.profile_picture?.startsWith("blob:")
      ? profile.profile_picture
      : profile.profile_picture
        ? `${API_BASE}${profile.profile_picture}`
        : "/default-avatar.png";

  return (
    <div className="sp-layout">
      <StudentMenu username={profile.name} status={user?.status || "unemployed"} />

      <div className="sp-main">
        <div className="sp-pageTop">
          <div>
            <h1 className="sp-title">Profile</h1>
            <div className="sp-subtitle">Manage your personal information</div>
          </div>

          {!editing ? (
            <button className="sp-btnPrimary" onClick={() => setEditing(true)} type="button">
              Edit Profile
            </button>
          ) : (
            <div className="sp-actionsTop">
              <button className="sp-btnGhost" onClick={handleCancel} type="button" disabled={saving}>
                Cancel
              </button>
              <button className="sp-btnPrimary" onClick={handleSave} type="button" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* SUMMARY CARD */}
        <div className="sp-summaryCard">
          <div className="sp-summaryLeft">
            <img src={imgSrc} className="sp-avatar" alt="Profile" />
            <div className="sp-summaryText">
              <div className="sp-name">{profile.name}</div>
              <div className="sp-meta">
                <span><b>Student ID:</b> {profile.student_id}</span>
                <span className="sp-dot">•</span>
                <span><b>Email:</b> {profile.email}</span>
              </div>

              {editing && (
                <div className="sp-uploadRow">
                  <label className="sp-btnOutline">
                    Choose Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                  </label>
                  <div className="sp-hint">PNG/JPG • Recommended square photo</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FORM GRID */}
        <div className="sp-grid">
          {/* Personal Info */}
          <div className="sp-card">
            <div className="sp-cardHead">
              <div className="sp-cardTitle">Personal Information</div>
              <div className="sp-cardSub">Basic student details</div>
            </div>

            <div className="sp-form">
              <Field label="Name">
                <input value={profile.name} disabled />
              </Field>

              <Field label="Student ID">
                <input value={profile.student_id} disabled />
              </Field>

              <Field label="Student Email">
                <input value={profile.email} disabled />
              </Field>

              <Field label="IC Number">
                <input
                  name="ic_number"
                  value={profile.ic_number || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Field>

              <Field label="Course">
  <select
    name="course"
    value={profile.course || ""}
    onChange={handleChange}
    disabled={!editing}
  >
    <option value="">Select Course</option>
    {courseOptions.map((course) => (
      <option key={course} value={course}>
        {course}
      </option>
    ))}
  </select>
</Field>

              <div className="sp-row2">
                <Field label="Gender">
                  <select
                    name="gender"
                    value={profile.gender || ""}
                    onChange={handleChange}
                    disabled={!editing}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </Field>

                <Field label="Marital Status">
                  <select
                    name="marital_status"
                    value={profile.marital_status || ""}
                    onChange={handleChange}
                    disabled={!editing}
                  >
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                  </select>
                </Field>
              </div>

              <div className="sp-row2">
                <Field label="Age">
                  <input
                    type="number"
                    name="age"
                    value={profile.age ?? ""}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Field>

                <Field label="Contact Number">
                  <input
                    name="contact_number"
                    value={profile.contact_number || ""}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Academic + Emergency */}
          <div className="sp-card">
            <div className="sp-cardHead">
              <div className="sp-cardTitle">Academic & Emergency</div>
              <div className="sp-cardSub">Advisor and emergency contact</div>
            </div>

            <div className="sp-form">
              <Field label="Academic Advisor">
                <input
                  name="academic_advisor"
                  value={profile.academic_advisor || ""}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Field>

              <Field label="Emergency Contact">
                <input
                  name="emergency_contact"
                  value={profile.emergency_contact || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Name + phone number"
                />
              </Field>

              {/* bottom actions (mobile-friendly) */}
              {editing && (
                <div className="sp-actionsBottom">
                  <button className="sp-btnGhost" onClick={handleCancel} type="button" disabled={saving}>
                    Cancel
                  </button>
                  <button className="sp-btnPrimary" onClick={handleSave} type="button" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* footer spacer */}
        <div style={{ height: 10 }} />
      </div>
    </div>
  );
}

/** Small form field wrapper */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sp-field">
      <div className="sp-label">{label}</div>
      <div className="sp-control">{children}</div>
    </div>
  );
}