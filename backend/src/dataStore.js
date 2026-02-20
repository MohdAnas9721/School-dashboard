const teachers = [
  { id: "T-101", name: "Meera Sharma", subject: "Math", grade: "6-8" },
  { id: "T-102", name: "Arjun Singh", subject: "Science", grade: "9-10" },
  { id: "T-103", name: "Farhan Ali", subject: "English", grade: "5-7" },
];

const fees = [
  {
    id: "F-9001",
    studentName: "Riya Patel",
    className: "8A",
    rollNo: "18",
    amount: 3500,
    paymentMode: "UPI",
    submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

const attendanceLogs = [
  {
    id: "A-7001",
    teacherId: "T-101",
    teacherName: "Meera Sharma",
    deviceId: "FR-1",
    status: "present",
    verifiedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

const makeId = (prefix, base = 1000) => `${prefix}-${base + Math.floor(Math.random() * 9000)}`;

const nowIso = () => new Date().toISOString();

export const store = {
  teachers,
  fees,
  attendanceLogs,
  makeId,
  nowIso,
};