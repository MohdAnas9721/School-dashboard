import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const defaultFeeForm = {
  studentName: "",
  className: "",
  rollNo: "",
  amount: "",
  paymentMode: "UPI",
};

const defaultAttendanceForm = {
  teacherId: "",
  deviceId: "FR-1",
  fingerprintToken: "",
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function App() {
  const [summary, setSummary] = useState(null);
  const [fees, setFees] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [feeForm, setFeeForm] = useState(defaultFeeForm);
  const [attendanceForm, setAttendanceForm] = useState(defaultAttendanceForm);

  const [feeStatus, setFeeStatus] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === attendanceForm.teacherId),
    [attendanceForm.teacherId, teachers],
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const [summaryRes, feesRes, attendanceRes, teachersRes] = await Promise.all([
        apiRequest("/api/dashboard/summary"),
        apiRequest("/api/fees?limit=8"),
        apiRequest("/api/attendance/live?limit=8"),
        apiRequest("/api/teachers"),
      ]);

      setSummary(summaryRes);
      setFees(feesRes.fees);
      setAttendanceLogs(attendanceRes.logs);
      setTeachers(teachersRes.teachers);

      if (teachersRes.teachers.length > 0) {
        setAttendanceForm((current) =>
          current.teacherId
            ? current
            : {
                ...current,
                teacherId: teachersRes.teachers[0].id,
              },
        );
      }
    } catch (error) {
      setFeeStatus(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleFeeSubmit = async (event) => {
    event.preventDefault();
    setFeeStatus("Submitting fee...");

    try {
      await apiRequest("/api/fees", {
        method: "POST",
        body: JSON.stringify(feeForm),
      });

      setFeeStatus("Fee submitted successfully.");
      setFeeForm(defaultFeeForm);
      await loadDashboard();
    } catch (error) {
      setFeeStatus(error.message);
    }
  };

  const handleAttendanceSubmit = async (event) => {
    event.preventDefault();
    setAttendanceStatus("Verifying fingerprint...");

    try {
      await apiRequest("/api/attendance/fingerprint", {
        method: "POST",
        body: JSON.stringify(attendanceForm),
      });

      setAttendanceStatus("Fingerprint verified. Attendance applied.");
      setAttendanceForm((current) => ({ ...current, fingerprintToken: "" }));
      await loadDashboard();
    } catch (error) {
      setAttendanceStatus(error.message);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <h1>School Admin Dashboard</h1>
        <p>Fees jama karein aur teacher fingerprint attendance live apply karein.</p>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <h3>Total Teachers</h3>
          <strong>{summary?.totalTeachers ?? "-"}</strong>
        </article>
        <article className="stat-card">
          <h3>Total Fee Records</h3>
          <strong>{summary?.totalFeeRecords ?? "-"}</strong>
        </article>
        <article className="stat-card">
          <h3>Today Collection</h3>
          <strong>Rs. {summary?.todayCollection ?? "-"}</strong>
        </article>
        <article className="stat-card">
          <h3>Today Attendance</h3>
          <strong>{summary?.todayAttendanceCount ?? "-"}</strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <h2>Fee Submission</h2>
          <form onSubmit={handleFeeSubmit} className="form-grid">
            <input
              placeholder="Student Name"
              value={feeForm.studentName}
              onChange={(event) => setFeeForm({ ...feeForm, studentName: event.target.value })}
              required
            />
            <input
              placeholder="Class"
              value={feeForm.className}
              onChange={(event) => setFeeForm({ ...feeForm, className: event.target.value })}
              required
            />
            <input
              placeholder="Roll Number"
              value={feeForm.rollNo}
              onChange={(event) => setFeeForm({ ...feeForm, rollNo: event.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              min="1"
              value={feeForm.amount}
              onChange={(event) => setFeeForm({ ...feeForm, amount: event.target.value })}
              required
            />
            <select
              value={feeForm.paymentMode}
              onChange={(event) => setFeeForm({ ...feeForm, paymentMode: event.target.value })}
            >
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="NetBanking">Net Banking</option>
            </select>
            <button type="submit">Submit Fee</button>
          </form>
          <p className="status">{feeStatus}</p>
        </article>

        <article className="panel">
          <h2>Teacher Fingerprint Attendance</h2>
          <form onSubmit={handleAttendanceSubmit} className="form-grid">
            <select
              value={attendanceForm.teacherId}
              onChange={(event) =>
                setAttendanceForm({
                  ...attendanceForm,
                  teacherId: event.target.value,
                  fingerprintToken: "",
                })
              }
              required
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.id})
                </option>
              ))}
            </select>
            <input
              placeholder="Device ID"
              value={attendanceForm.deviceId}
              onChange={(event) => setAttendanceForm({ ...attendanceForm, deviceId: event.target.value })}
              required
            />
            <input
              placeholder="Fingerprint Token"
              value={attendanceForm.fingerprintToken}
              onChange={(event) =>
                setAttendanceForm({ ...attendanceForm, fingerprintToken: event.target.value })
              }
              required
            />
            <button type="submit">Verify & Apply Attendance</button>
          </form>

          <p className="hint">
            Demo token for selected teacher: <code>{selectedTeacher ? `VALID_${selectedTeacher.id}` : "-"}</code>
          </p>
          <p className="status">{attendanceStatus}</p>
        </article>
      </section>

      <section className="tables-grid">
        <article className="panel">
          <h2>Recent Fee Entries</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Roll</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((item) => (
                  <tr key={item.id}>
                    <td>{item.studentName}</td>
                    <td>{item.className}</td>
                    <td>{item.rollNo}</td>
                    <td>Rs. {item.amount}</td>
                    <td>{new Date(item.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && fees.length === 0 && <p>No fee records yet.</p>}
          </div>
        </article>

        <article className="panel">
          <h2>Live Attendance Log</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Device</th>
                  <th>Status</th>
                  <th>Verified At</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLogs.map((item) => (
                  <tr key={item.id}>
                    <td>{item.teacherName}</td>
                    <td>{item.deviceId}</td>
                    <td className="capitalize">{item.status}</td>
                    <td>{new Date(item.verifiedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && attendanceLogs.length === 0 && <p>No attendance logs yet.</p>}
          </div>
        </article>
      </section>
    </div>
  );
}

export default App;
