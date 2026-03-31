import { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import EmployerMenu from "../../components/menus/EmployerMenu";
import "./EmployerProfile.css";

const API_BASE = "http://localhost:3001";

interface EmployerProfileData {
  id: number;
  company_name: string;
  email: string;
  contact_number?: string;
  headquarters?: string;
  website_url?: string;
  year_founded?: string;
  industry?: string;
  office_hours?: string;
  description?: string;
  company_logo?: string;
}

export default function EmployerProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!user?.id) return;
        const res = await axios.get(`${API_BASE}/api/employers/profile/${user.id}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Fetch employer profile error:", err);
      }
    }
    fetchProfile();
  }, [user?.id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && profile) {
      const f = e.target.files[0];
      setLogoFile(f);
      setProfile({ ...profile, company_logo: URL.createObjectURL(f) });
    }
  };

  const handleSave = async () => {
    if (!profile || !user?.id) return;

    try {
      const formData = new FormData();
      formData.append("company_name", profile.company_name);
      formData.append("contact_number", profile.contact_number || "");
      formData.append("headquarters", profile.headquarters || "");
      formData.append("website_url", profile.website_url || "");
      formData.append("year_founded", profile.year_founded || "");
      formData.append("industry", profile.industry || "");
      formData.append("office_hours", profile.office_hours || "");
      formData.append("description", profile.description || "");
      if (logoFile) formData.append("company_logo", logoFile);

      await axios.put(`${API_BASE}/api/employers/profile/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully!");
      setEditing(false);
      setLogoFile(null);

      const res = await axios.get(`${API_BASE}/api/employers/profile/${user.id}`);
      setProfile(res.data);
    } catch (err) {
      console.error("Update employer profile error:", err);
      alert("Failed to update profile");
    }
  };

  const handleCancel = async () => {
    try {
      if (!user?.id) return;
      setEditing(false);
      setLogoFile(null);
      const res = await axios.get(`${API_BASE}/api/employers/profile/${user.id}`);
      setProfile(res.data);
    } catch (e) {
      console.error(e);
      setEditing(false);
    }
  };

  if (!profile) return <div className="ep2-loading">Loading...</div>;

  const logoSrc = profile.company_logo
    ? profile.company_logo.startsWith("blob:")
      ? profile.company_logo
      : `${API_BASE}${profile.company_logo}`
    : "/default-company.png";

  return (
    <div className="ep2-layout">
      <EmployerMenu companyName={profile.company_name || "Employer"} />

      <div className="ep2-main">
        {/* Header Card */}
        <div className="ep2-headerCard">
          <div className="ep2-headerLeft">
            <img src={logoSrc} className="ep2-logo" alt="Company Logo" />

            <div className="ep2-headerText">
              <div className="ep2-name">{profile.company_name || "—"}</div>
              <div className="ep2-email">{profile.email}</div>

              {editing && (
                <label className="ep2-upload">
                  <input type="file" accept="image/*" onChange={handleLogoChange} />
                  Change Logo
                </label>
              )}
            </div>
          </div>

          <div className="ep2-headerRight">
            {!editing ? (
              <button className="ep2-btnPrimary" onClick={() => setEditing(true)} type="button">
                Edit Profile
              </button>
            ) : (
              <div className="ep2-btnRow">
                <button className="ep2-btnPrimary" onClick={handleSave} type="button">
                  Save
                </button>
                <button className="ep2-btnSecondary" onClick={handleCancel} type="button">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="ep2-titleWrap">
          <h1 className="ep2-title">Company Profile</h1>
          <div className="ep2-subtitle">Update your company details and public info</div>
        </div>

        {/* Info Cards Grid */}
        <div className="ep2-grid">
          <InfoCard label="Company Name">
            <input
              name="company_name"
              value={profile.company_name}
              onChange={handleChange}
              disabled={!editing}
              className="ep2-input"
            />
          </InfoCard>

          <InfoCard label="Contact Number">
            <input
              name="contact_number"
              value={profile.contact_number || ""}
              onChange={handleChange}
              disabled={!editing}
              className="ep2-input"
              placeholder="—"
            />
          </InfoCard>

          <InfoCard label="Headquarters">
            <input
              name="headquarters"
              value={profile.headquarters || ""}
              onChange={handleChange}
              disabled={!editing}
              className="ep2-input"
              placeholder="—"
            />
          </InfoCard>

          <InfoCard label="Website URL">
            <input
              name="website_url"
              value={profile.website_url || ""}
              onChange={handleChange}
              disabled={!editing}
              className="ep2-input"
              placeholder="—"
            />
          </InfoCard>

          <InfoCard label="Year Founded">
            <input
              name="year_founded"
              value={profile.year_founded || ""}
              onChange={handleChange}
              disabled={!editing}
              className="ep2-input"
              placeholder="—"
            />
          </InfoCard>

          <InfoCard label="Industry">
            <input
              name="industry"
              value={profile.industry || ""}
              onChange={handleChange}
              disabled={!editing}
              className="ep2-input"
              placeholder="—"
            />
          </InfoCard>

          <InfoCard label="Office Hours">
            <input
              name="office_hours"
              value={profile.office_hours || ""}
              onChange={handleChange}
              disabled={!editing}
              className="ep2-input"
              placeholder="—"
            />
          </InfoCard>

          {/* Email card (read only always) */}
          <InfoCard label="Email">
            <div className="ep2-readonly">{profile.email}</div>
          </InfoCard>
        </div>

        {/* Description (full width card) */}
        <div className="ep2-wideCard">
          <div className="ep2-cardLabel">Description</div>
          <textarea
            name="description"
            value={profile.description || ""}
            onChange={handleChange}
            disabled={!editing}
            className="ep2-textarea"
            placeholder="Tell students about your company..."
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, children }: any) {
  return (
    <div className="ep2-card">
      <div className="ep2-cardLabel">{label}</div>
      <div className="ep2-cardValue">{children}</div>
    </div>
  );
}