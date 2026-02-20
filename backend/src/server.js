/* global process */
import express from "express";
import cors from "cors";
import { store } from "./dataStore.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "School dashboard backend is running" });
});

app.get("/api/teachers", (_req, res) => {
  res.json({ teachers: store.teachers });
});

app.get("/api/fees", (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const recent = [...store.fees]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, limit);

  res.json({ fees: recent, total: store.fees.length });
});

app.post("/api/fees", (req, res) => {
  const { studentName, className, rollNo, amount, paymentMode } = req.body;

  if (!studentName || !className || !rollNo || !amount || !paymentMode) {
    return res.status(400).json({ message: "All fee fields are required." });
  }

  const feeRecord = {
    id: store.makeId("F"),
    studentName,
    className,
    rollNo,
    amount: Number(amount),
    paymentMode,
    submittedAt: store.nowIso(),
  };

  store.fees.push(feeRecord);
  return res.status(201).json({ message: "Fee submitted successfully.", fee: feeRecord });
});

app.get("/api/attendance/live", (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const recent = [...store.attendanceLogs]
    .sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt))
    .slice(0, limit);

  res.json({ logs: recent, total: store.attendanceLogs.length });
});

app.post("/api/attendance/fingerprint", (req, res) => {
  const { teacherId, deviceId, fingerprintToken } = req.body;

  if (!teacherId || !deviceId || !fingerprintToken) {
    return res.status(400).json({ message: "teacherId, deviceId, and fingerprintToken are required." });
  }

  const teacher = store.teachers.find((item) => item.id === teacherId);
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found." });
  }

  const expectedToken = `VALID_${teacherId}`;
  const verified = fingerprintToken === expectedToken;

  if (!verified) {
    return res
      .status(401)
      .json({ message: "Fingerprint verification failed. Use valid token format: VALID_<TEACHER_ID>" });
  }

  const attendance = {
    id: store.makeId("A"),
    teacherId: teacher.id,
    teacherName: teacher.name,
    deviceId,
    status: "present",
    verifiedAt: store.nowIso(),
  };

  store.attendanceLogs.push(attendance);
  return res.status(201).json({ message: "Fingerprint verified and attendance applied.", attendance });
});

app.get("/api/dashboard/summary", (_req, res) => {
  const today = new Date().toDateString();

  const todayFees = store.fees.filter((item) => new Date(item.submittedAt).toDateString() === today);
  const todayCollection = todayFees.reduce((sum, item) => sum + item.amount, 0);

  const todayAttendance = store.attendanceLogs.filter(
    (item) => new Date(item.verifiedAt).toDateString() === today,
  );

  res.json({
    totalTeachers: store.teachers.length,
    totalFeeRecords: store.fees.length,
    todayCollection,
    todayAttendanceCount: todayAttendance.length,
  });
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
