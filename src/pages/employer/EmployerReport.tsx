import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import EmployerMenu from "../../components/menus/EmployerMenu";
import "./EmployerReport.css";

const API_BASE = "http://localhost:3001";

type ReportCards = {
  totalApplied: number;
  totalAccepted: number;
  totalRejected: number;
  totalPending: number;
  interviewScheduled: number;
};

type ReportRow = {
  job_id: number;
  job_title: string;
  applied_count: number;
  accepted_count: number;
  rejected_count: number;
  pending_count: number;
};

type EmployerProfileData = {
  id: number;
  company_name: string;
};

export default function EmployerReport() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState<EmployerProfileData | null>(null);
  const [cards, setCards] = useState<ReportCards>({
    totalApplied: 0,
    totalAccepted: 0,
    totalRejected: 0,
    totalPending: 0,
    interviewScheduled: 0,
  });
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  // for EmployerMenu title
  useEffect(() => {
    const run = async () => {
      try {
        if (!user?.id) return;
        const res = await axios.get(`${API_BASE}/api/employers/profile/${user.id}`);
        setProfile(res.data);
      } catch (e) {
        console.error("Employer profile error:", e);
      }
    };
    run();
  }, [user?.id]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        if (!user?.id) return;

        const res = await axios.get(`${API_BASE}/api/employers/${user.id}/report`);
        setCards(res.data?.cards || {});
        setRows(res.data?.table || []);
      } catch (e) {
        console.error("Report fetch error:", e);
        setCards({
          totalApplied: 0,
          totalAccepted: 0,
          totalRejected: 0,
          totalPending: 0,
          interviewScheduled: 0,
        });
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.id]);

  const companyName = profile?.company_name || "Employer";

  const grandTotalJobs = useMemo(() => rows.length, [rows]);

  return (
    <div className="er-layout">
      <EmployerMenu companyName={companyName} />

      <div className="er-main">
        <div className="er-header">
          <div>
            <h1 className="er-title">Employer Report</h1>
            <div className="er-subtitle">
              Summary for <b>{grandTotalJobs}</b> job(s)
            </div>
          </div>
        </div>

        {/* CARDS */}
        <div className="er-cards">
          <div className="er-card">
            <div className="er-card-label">Total Applied</div>
            <div className="er-card-value">{cards.totalApplied}</div>
          </div>

          <div className="er-card">
            <div className="er-card-label">Accepted</div>
            <div className="er-card-value">{cards.totalAccepted}</div>
          </div>

          <div className="er-card">
            <div className="er-card-label">Rejected</div>
            <div className="er-card-value">{cards.totalRejected}</div>
          </div>

          <div className="er-card">
            <div className="er-card-label">Pending</div>
            <div className="er-card-value">{cards.totalPending}</div>
          </div>

          <div className="er-card">
            <div className="er-card-label">Interview Scheduled</div>
            <div className="er-card-value">{cards.interviewScheduled}</div>
          </div>
        </div>

        {/* TABLE */}
        <div className="er-tableWrap">
          <div className="er-tableTop">
            <h2 className="er-tableTitle">Applications by Job</h2>
          </div>

          {loading ? (
            <div className="er-loading">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="er-empty">No job applications yet.</div>
          ) : (
            <table className="er-table">
              <thead>
                <tr>
                  <th>Job Name</th>
                  <th>Total Applied</th>
                  <th>Accepted</th>
                  <th>Rejected</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.job_id}>
                    <td className="er-job">{r.job_title}</td>
                    <td>{r.applied_count}</td>
                    <td className="er-accepted">{r.accepted_count}</td>
                    <td className="er-rejected">{r.rejected_count}</td>
                    <td className="er-pending">{r.pending_count}</td>
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