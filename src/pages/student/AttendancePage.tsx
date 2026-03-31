import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StudentMenu from "../../components/menus/StudentMenu";
import "./AttendancePage.css";

const API_BASE = "http://localhost:3001";

/**
 * Malaysia typical office start time: 09:00
 * Grace period: 15 min => Late after 09:15
 * Change these if your company is different.
 */
const WORK_START = "09:00:00";
const GRACE_MINUTES = 15;
const LATE_AFTER = "09:15:00";

type AttendanceStatus = "present" | "absent" | "late" | "halfday" | "none";

type AttendanceRecord = {
  id: number;
  student_id: number;
  date: string; // normalized to YYYY-MM-DD
  check_in_time?: string | null; // HH:MM:SS
  check_out_time?: string | null; // HH:MM:SS
  status: "present" | "absent" | "late" | "halfday";
  notes?: string | null;
  mc_file?: string | null;
  created_at?: string;
  updated_at?: string;
};

function getUserFromLocalStorage(): any {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function getStudentIdFromLocalStorage(): number | null {
  const u = getUserFromLocalStorage();
  return typeof u?.id === "number" ? u.id : null;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * UI "today" uses browser local time.
 * (Malaysia PC will show Malaysia day)
 */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * IMPORTANT: backend might send:
 * - "2026-03-02"
 * - "2026-03-02T16:00:00.000Z"
 * - "2026-03-02 00:00:00"
 * We always normalize to YYYY-MM-DD using first 10 chars if possible.
 */
function normalizeDate(d: any): string {
  if (!d) return "";

  if (typeof d === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);

    const dt = new Date(d);
    if (!isNaN(dt.getTime())) {
      return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
    }
    return "";
  }

  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

function formatHMS(hms?: string | null) {
  return hms ? hms : "--:--:--";
}

function formatNowTime() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function timeGreater(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return a > b; // lexicographical works for HH:MM:SS
}

/**
 * If backend stores status="present" always,
 * display "late" based on clock-in time.
 */
function getDisplayStatus(r: AttendanceRecord): AttendanceStatus {
  if (r.status === "present" && timeGreater(r.check_in_time, LATE_AFTER)) return "late";
  return r.status;
}

function getDayNumber(ymd: string) {
  const parts = ymd.split("-");
  return parts[2] || "";
}

function getMonthName(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return "";
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleString(undefined, { month: "long" });
}

function getMonthMeta(base: Date) {
  const year = base.getFullYear();
  const month = base.getMonth(); // 0-11
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay(); // 0 Sun ... 6 Sat
  return { year, month, daysInMonth, startWeekday };
}

export default function AttendancePage() {
  const user = useMemo(() => getUserFromLocalStorage(), []);
  const studentId = useMemo(() => getStudentIdFromLocalStorage(), []);

  const status = (user.status || "unemployed") as "unemployed" | "employed";
  const username = user.name || "Student";

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live clock
  const [nowClock, setNowClock] = useState(formatNowTime());
  useEffect(() => {
    const t = setInterval(() => setNowClock(formatNowTime()), 1000);
    return () => clearInterval(t);
  }, []);

  // Calendar
  const [calendarBase, setCalendarBase] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  // View modal
  const [viewRecord, setViewRecord] = useState<AttendanceRecord | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  // Absent modal
  const [absentOpen, setAbsentOpen] = useState(false);
  const [absentDate, setAbsentDate] = useState<string>(todayISO());
  const [absentNotes, setAbsentNotes] = useState("");
  const [mcFile, setMcFile] = useState<File | null>(null);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    for (const r of records) map.set(r.date, r);
    return map;
  }, [records]);

  async function fetchAttendance() {
    if (!studentId) {
      setError("Student not logged in (localStorage 'user' missing).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/students/${studentId}/attendance`);
      const fixed: AttendanceRecord[] = (res.data?.records ?? []).map((r: any) => ({
        ...r,
        date: normalizeDate(r.date),
      }));
      setRecords(fixed);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayRecord = useMemo(() => recordsByDate.get(todayISO()) || null, [recordsByDate]);
  const todayDisplayStatus: AttendanceStatus = useMemo(
    () => (todayRecord ? getDisplayStatus(todayRecord) : "none"),
    [todayRecord]
  );

  async function handleClockIn() {
    if (!studentId) return;
    setActionLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE}/api/students/${studentId}/attendance/check-in`);
      await fetchAttendance();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Clock in failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClockOut() {
    if (!studentId) return;
    setActionLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE}/api/students/${studentId}/attendance/check-out`);
      await fetchAttendance();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Clock out failed");
    } finally {
      setActionLoading(false);
    }
  }

  function openView(r: AttendanceRecord) {
    setViewRecord(r);
    setViewOpen(true);
  }

  function closeView() {
    setViewOpen(false);
    setViewRecord(null);
  }

  function openAbsent() {
    setAbsentDate(selectedDate || todayISO());
    setAbsentNotes("");
    setMcFile(null);
    setAbsentOpen(true);
  }

  function closeAbsent() {
    setAbsentOpen(false);
  }

  async function submitAbsent(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    if (!absentDate) return setError("Please select date for absent.");

    setActionLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("date", absentDate);
      fd.append("notes", absentNotes);
      if (mcFile) fd.append("mc_file", mcFile);

      await axios.post(`${API_BASE}/api/students/${studentId}/attendance/absent`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      closeAbsent();
      await fetchAttendance();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Mark absent failed");
    } finally {
      setActionLoading(false);
    }
  }

  // Calendar grid
  const monthMeta = useMemo(() => getMonthMeta(calendarBase), [calendarBase]);

  const calendarCells = useMemo(() => {
    const { year, month, daysInMonth, startWeekday } = monthMeta;
    const cells: Array<{ date: string | null; day: number | null }> = [];

    for (let i = 0; i < startWeekday; i++) cells.push({ date: null, day: null });
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push({ date: toYMD(d), day });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, day: null });

    return cells;
  }, [monthMeta]);

  function cellClass(dateStr: string | null) {
    if (!dateStr) return "cal-cell cal-empty";

    const rec = recordsByDate.get(dateStr);
    const base: string[] = ["cal-cell"];

    if (dateStr === todayISO()) base.push("cal-today");
    if (dateStr === selectedDate) base.push("cal-selected");

    if (rec) {
      const ds = getDisplayStatus(rec);
      if (ds === "present") base.push("cal-present");
      else if (ds === "absent") base.push("cal-absent");
      else if (ds === "late") base.push("cal-late");
      else if (ds === "halfday") base.push("cal-halfday");
    } else {
      base.push("cal-none");
    }

    return base.join(" ");
  }

  const selectedRecord = useMemo(() => recordsByDate.get(selectedDate) || null, [recordsByDate, selectedDate]);
  const selectedStatus: AttendanceStatus = selectedRecord ? getDisplayStatus(selectedRecord) : "none";

  return (
    <div className="dashboard-layout">
      <StudentMenu status={status} username={username} />

      <div className="dashboard-content">
        <div className="at-page">
          <div className="at-header">
            <div>
              <h1 className="at-title">Attendance</h1>
              <p className="at-subtitle">
                Clock in / clock out daily. Late rule: start {WORK_START} + {GRACE_MINUTES} min grace (late after {LATE_AFTER}).
              </p>
            </div>

            <button className="at-btn at-btn-ghost" onClick={fetchAttendance} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && <div className="at-alert">{error}</div>}

          {/* TODAY PANEL */}
          <div className="at-card">
            <div className="at-card-head">
              <h2>Today</h2>
              <span className="at-chip">{todayISO()}</span>
            </div>

            {/* Top row: Date + Current time */}
            <div className="at-top-grid">
              <div className="at-datecard">
                <div className="at-date-big">{getDayNumber(todayISO())}</div>
                <div className="at-date-month">{getMonthName(todayISO())}</div>
                <div className="at-date-sub">Malaysia</div>
              </div>

              <div className="at-digital">
                <div className="at-digital-label">Current Time</div>
                <div className="at-digital-time">{nowClock}</div>
                <div className="at-digital-sub">Malaysia Time</div>
              </div>
            </div>

            {/* Second row: Clock in/out/status */}
            <div className="at-clock-row2">
              <div className="at-digital at-digital-small">
                <div className="at-digital-label">Clock In</div>
                <div className="at-digital-time">{formatHMS(todayRecord?.check_in_time)}</div>
                <div className="at-digital-sub">Saved time</div>
              </div>

              <div className="at-digital at-digital-small">
                <div className="at-digital-label">Clock Out</div>
                <div className="at-digital-time">{formatHMS(todayRecord?.check_out_time)}</div>
                <div className="at-digital-sub">Saved time</div>
              </div>

              <div className="at-digital at-digital-small">
                <div className="at-digital-label">Status</div>
                <div className={`at-status-big at-status-${todayDisplayStatus}`}>
                  {todayRecord ? getDisplayStatus(todayRecord) : "no record"}
                </div>
                <div className="at-digital-sub">Auto</div>
              </div>
            </div>

            <div className="at-today-actions">
              <button className="at-btn at-btn-primary" onClick={handleClockIn} disabled={actionLoading}>
                Clock In
              </button>

              <button className="at-btn" onClick={handleClockOut} disabled={actionLoading}>
                Clock Out
              </button>

              <button className="at-btn at-btn-danger" onClick={openAbsent} disabled={actionLoading}>
                Mark Absent + Upload MC
              </button>
            </div>

            <div className="at-legend">
              <span className="at-legend-item"><span className="dot dot-green" /> Present</span>
              <span className="at-legend-item"><span className="dot dot-red" /> Absent</span>
              <span className="at-legend-item"><span className="dot dot-yellow" /> Late</span>
              <span className="at-legend-item"><span className="dot dot-gray" /> No record</span>
            </div>
          </div>

          {/* CALENDAR */}
          <div className="at-card">
            <div className="at-card-head">
              <h2>Calendar</h2>

              <div className="cal-controls">
                <button
                  className="at-btn at-btn-small at-btn-ghost"
                  onClick={() => setCalendarBase(new Date(calendarBase.getFullYear(), calendarBase.getMonth() - 1, 1))}
                >
                  ◀
                </button>

                <div className="cal-month-title">
                  {calendarBase.toLocaleString(undefined, { month: "long", year: "numeric" })}
                </div>

                <button
                  className="at-btn at-btn-small at-btn-ghost"
                  onClick={() => setCalendarBase(new Date(calendarBase.getFullYear(), calendarBase.getMonth() + 1, 1))}
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="cal-weekdays">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div className="cal-grid">
              {calendarCells.map((c, idx) => (
                <button
                  key={idx}
                  className={cellClass(c.date)}
                  onClick={() => c.date && setSelectedDate(c.date)}
                  disabled={!c.date}
                  type="button"
                >
                  <div className="cal-day">{c.day ?? ""}</div>

                  {c.date && recordsByDate.get(c.date) && (
                    <div className="cal-mini">
                      {getDisplayStatus(recordsByDate.get(c.date)!) === "absent" ? "A" :
                        getDisplayStatus(recordsByDate.get(c.date)!) === "late" ? "L" :
                          getDisplayStatus(recordsByDate.get(c.date)!) === "halfday" ? "H" : "P"}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="cal-selected-panel">
              <div>
                <div className="cal-selected-title">Selected date</div>
                <div className="cal-selected-date">{selectedDate}</div>
              </div>

              <div className="cal-selected-actions">
                <span className={`at-badge at-badge-${selectedStatus}`}>
                  {selectedStatus === "none" ? "no record" : selectedStatus}
                </span>

                {selectedRecord ? (
                  <button className="at-btn at-btn-small" onClick={() => openView(selectedRecord)}>
                    View
                  </button>
                ) : (
                  <button className="at-btn at-btn-small at-btn-danger" onClick={openAbsent}>
                    Mark Absent
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="at-card">
            <div className="at-card-head">
              <h2>Attendance Records</h2>
              <span className="at-muted">{records.length} records</span>
            </div>

            <div className="at-table-wrap">
              <table className="at-table">
                <thead>
                  <tr>
                    <th style={{ width: 130 }}>Date</th>
                    <th style={{ width: 120 }}>Clock In</th>
                    <th style={{ width: 120 }}>Clock Out</th>
                    <th style={{ width: 110 }}>Status</th>
                    <th>Notes</th>
                    <th style={{ width: 120 }}>MC</th>
                    <th style={{ width: 120, textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={7} className="at-empty">No attendance records yet.</td>
                    </tr>
                  )}

                  {records.map((r) => {
                    const ds = getDisplayStatus(r);
                    return (
                      <tr key={r.id}>
                        <td>{r.date}</td>
                        <td>{r.check_in_time || "-"}</td>
                        <td>{r.check_out_time || "-"}</td>
                        <td><span className={`at-badge at-badge-${ds}`}>{ds}</span></td>
                        <td className="at-td-notes">{r.notes || "-"}</td>
                        <td>
                          {r.mc_file ? (
                            <a className="at-link" href={`${API_BASE}${r.mc_file}`} target="_blank" rel="noreferrer">
                              View MC
                            </a>
                          ) : "-"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button className="at-btn at-btn-small" onClick={() => openView(r)}>View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* VIEW MODAL */}
          {viewOpen && viewRecord && (
            <div className="at-modal-overlay" onClick={closeView}>
              <div className="at-modal" onClick={(e) => e.stopPropagation()}>
                <div className="at-modal-head">
                  <div>
                    <h3 className="at-modal-title">Attendance Details</h3>
                    <p className="at-muted">Date: {viewRecord.date}</p>
                  </div>
                  <button className="at-btn at-btn-ghost" onClick={closeView}>✕</button>
                </div>

                <div className="at-modal-card">
                  <div className="at-modal-grid">
                    <div className="at-section">
                      <div className="at-section-title">Times</div>
                      <div className="at-kv"><span>Clock in</span><strong>{viewRecord.check_in_time || "-"}</strong></div>
                      <div className="at-kv"><span>Clock out</span><strong>{viewRecord.check_out_time || "-"}</strong></div>
                    </div>

                    <div className="at-section">
                      <div className="at-section-title">Status</div>
                      <span className={`at-badge at-badge-${getDisplayStatus(viewRecord)}`}>{getDisplayStatus(viewRecord)}</span>

                      <div className="at-section-title" style={{ marginTop: 12 }}>Notes</div>
                      <div className="at-pre">{viewRecord.notes || "-"}</div>

                      {viewRecord.mc_file && (
                        <div style={{ marginTop: 10 }}>
                          <a className="at-link" href={`${API_BASE}${viewRecord.mc_file}`} target="_blank" rel="noreferrer">
                            View MC file
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ABSENT MODAL */}
          {absentOpen && (
            <div className="at-modal-overlay" onClick={closeAbsent}>
              <div className="at-modal" onClick={(e) => e.stopPropagation()}>
                <div className="at-modal-head">
                  <div>
                    <h3 className="at-modal-title">Mark Absent</h3>
                    <p className="at-muted">Upload MC (optional but recommended)</p>
                  </div>
                  <button className="at-btn at-btn-ghost" onClick={closeAbsent}>✕</button>
                </div>

                <div className="at-modal-card">
                  <form onSubmit={submitAbsent} className="at-form">
                    <label className="at-field">
                      <span>Date</span>
                      <input type="date" value={absentDate} onChange={(e) => setAbsentDate(e.target.value)} />
                    </label>

                    <label className="at-field">
                      <span>Notes</span>
                      <textarea
                        rows={4}
                        value={absentNotes}
                        onChange={(e) => setAbsentNotes(e.target.value)}
                        placeholder="Reason (MC, clinic, family emergency...)"
                      />
                    </label>

                    <label className="at-field">
                      <span>MC File (PDF/JPG/PNG)</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setMcFile(e.target.files?.[0] || null)}
                      />
                      {mcFile && <div className="at-filehint">Selected: {mcFile.name}</div>}
                    </label>

                    <div className="at-actions">
                      <button className="at-btn at-btn-primary" type="submit" disabled={actionLoading}>
                        {actionLoading ? "Submitting..." : "Submit Absent"}
                      </button>
                      <button className="at-btn at-btn-ghost" type="button" onClick={closeAbsent} disabled={actionLoading}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}