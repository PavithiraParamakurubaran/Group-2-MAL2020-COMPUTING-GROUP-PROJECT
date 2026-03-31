import { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import AdminMenu from "../../components/menus/AdminMenu";
import "./AdminProfile.css";

interface AdminProfileData {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  department?: string;
  office_hours?: string;
  profile_picture?: string;
  created_at?: string;
}

export default function AdminProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // Fetch current admin profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!user?.id) return;

        const res = await axios.get(
          `http://localhost:3001/api/admin/profile/${user.id}`
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Fetch admin profile error:", err);
      }
    }

    fetchProfile();
  }, [user.id]);

  // Handle text input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Handle profile picture change
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setProfile({
        ...profile!,
        profile_picture: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // Save updated profile
  const handleSave = async () => {
    if (!profile || !user?.id) return;

    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      if (profile.contact_number) formData.append("contact_number", profile.contact_number);
      if (profile.department) formData.append("department", profile.department);
      if (profile.office_hours) formData.append("office_hours", profile.office_hours);

      if (profileImage) {
        formData.append("profile_picture", profileImage);
      }

      await axios.put(
        `http://localhost:3001/api/admin/profile/${user.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Profile updated successfully!");
      setEditing(false);

      // Refresh profile after save
      const res = await axios.get(
        `http://localhost:3001/api/admin/profile/${user.id}`
      );
      setProfile(res.data);

    } catch (err) {
      console.error("Update admin profile error:", err);
      alert("Failed to update profile. Check console for details.");
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="student-profile-container">
      <AdminMenu adminName={profile.name} />

      <div className="profile-content">
        <div className="profile-inner">
          <h1 className="profile-title">Profile</h1>

          <div className="profile-header">
            <img
              src={
                profile.profile_picture
                  ? `http://localhost:3001${profile.profile_picture}`
                  : "/default-admin.png"
              }
              className="profile-picture"
            />
            {editing && (
              <input type="file" accept="image/*" onChange={handleImageChange} />
            )}
          </div>

          <div className="profile-details">
            <ProfileRow label="Name">
              <input name="name" value={profile.name} onChange={handleChange} disabled={!editing} />
            </ProfileRow>

            <ProfileRow label="Email" value={profile.email} />

            <ProfileRow label="Contact Number">
              <input name="contact_number" value={profile.contact_number || ""} onChange={handleChange} disabled={!editing} />
            </ProfileRow>

            <ProfileRow label="Department">
              <input name="department" value={profile.department || ""} onChange={handleChange} disabled={!editing} />
            </ProfileRow>

            <ProfileRow label="Office Hours">
              <input name="office_hours" value={profile.office_hours || ""} onChange={handleChange} disabled={!editing} />
            </ProfileRow>

            <ProfileRow label="Joined" value={profile.created_at?.split("T")[0]} />
          </div>

          <div className="profile-buttons">
            {!editing ? (
              <button onClick={() => setEditing(true)}>Edit Profile</button>
            ) : (
              <>
                <button onClick={handleSave}>Save</button>
                <button className="secondary" onClick={() => setEditing(false)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for profile rows
function ProfileRow({ label, value, children }: any) {
  return (
    <div className="profile-row">
      <span className="profile-label">{label} :</span>
      <span className="profile-value">{children || value}</span>
    </div>
  );
}
