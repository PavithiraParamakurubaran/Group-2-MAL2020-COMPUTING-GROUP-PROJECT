import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";
import "./AppliedJobs.css";

const API_BASE = "http://localhost:3001";

type AppliedJobRow = {
  application_id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  applied_at: string;
  status: "applied" | "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
};

function formatDate(input: string) {
  // Safe simple date
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function normalizeStatus(s: string): "pending" | "accepted" | "rejected" | "reviewed" | "shortlisted" {
  const v = (s || "").toLowerCase();

  // if student just applied, you might store 'applied' in DB, show as Pending
  if (v === "applied" || v === "pending" || v === "") return "pending";
  if (v === "accepted") return "accepted";
  if (v === "rejected") return "rejected";
  if (v === "reviewed") return "reviewed";
  if (v === "shortlisted") return "shortlisted";

  return "pending";
}

export default function AppliedJobs() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [status] = useState<"unemployed" | "employed">(user.status || "unemployed");
  const [username] = useState<string>(user.name || "Student");

  const [rows, setRows] = useState<AppliedJobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/students/${user.id}/applied-jobs/details`);
        setRows(res.data.applied || []);
      } catch (err) {
        console.error(err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const tableRows = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      uiStatus: normalizeStatus(r.status),
    }));
  }, [rows]);

  return (
    <div className="applied-layout">
      <StudentMenu status={status} username={username} />

      <div className="applied-main">
        <h2 className="applied-title">Applied Jobs</h2>

        <div className="applied-card">
          {loading ? (
            <div className="applied-loading">Loading...</div>
          ) : tableRows.length === 0 ? (
            <div className="applied-empty">No applied jobs yet.</div>
          ) : (
            <table className="applied-table">
              <thead>
                <tr>
                  <th>Job Name</th>
                  <th>Company</th>
                  <th>Date Applied</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.application_id}>
                    <td className="td-strong">{r.job_title}</td>
                    <td>{r.company_name}</td>
                    <td>{formatDate(r.applied_at)}</td>
                    <td>
                      <span className={`status-pill ${r.uiStatus}`}>
                        {r.uiStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}