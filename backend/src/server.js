/* global process */
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";
import { Fee, FileSubmission, Student, Teacher } from "./models.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const ATTENDANCE_TIMEZONE = process.env.ATTENDANCE_TIMEZONE || "Asia/Kolkata";

const defaultTeachers = [
  {
    teacherId: "SS-T-1001",
    schoolName: "Sunrise School",
    name: "Meera Sharma",
    subject: "Math",
    grade: "6-8",
    phone: "9876500011",
    email: "meera@sunrise-school.edu",
  },
  {
    teacherId: "SS-T-1002",
    schoolName: "Sunrise School",
    name: "Arjun Singh",
    subject: "Science",
    grade: "9-10",
    phone: "9876500012",
    email: "arjun@sunrise-school.edu",
  },
  {
    teacherId: "SS-T-1003",
    schoolName: "Sunrise School",
    name: "Farhan Ali",
    subject: "English",
    grade: "5-7",
    phone: "9876500013",
    email: "farhan@sunrise-school.edu",
  },
];

app.use(cors());
app.use(express.json());

const makeId = (prefix) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

const getTimePartsInTimezone = (date, timezone) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const map = Object.fromEntries(parts.map((item) => [item.type, item.value]));
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: Number.parseInt(map.hour, 10),
  };
};

const getDateKeyInTimezone = (date, timezone) => {
  const parts = getTimePartsInTimezone(date, timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const asTeacherResponse = (teacher) => ({
  id: teacher.teacherId,
  schoolName: teacher.schoolName || "Unknown School",
  name: teacher.name,
  subject: teacher.subject,
  grade: teacher.grade,
  phone: teacher.phone || "",
  email: teacher.email || "",
  createdAt: teacher.createdAt,
});

const asFeeResponse = (fee) => ({
  id: fee.feeId,
  studentName: fee.studentName,
  className: fee.className,
  rollNo: fee.rollNo,
  amount: fee.amount,
  paymentMode: fee.paymentMode,
  submittedAt: fee.submittedAt,
});

const asFileResponse = (file) => ({
  id: file.fileId,
  studentName: file.studentName,
  className: file.className,
  rollNo: file.rollNo,
  documentType: file.documentType,
  fileUrl: file.fileUrl,
  notes: file.notes,
  submittedAt: file.submittedAt,
});

const asStudentResponse = (student) => ({
  id: student.studentId,
  schoolName: student.schoolName,
  name: student.name,
  className: student.className,
  rollNo: student.rollNo,
  parentName: student.parentName || "",
  phone: student.phone || "",
  createdAt: student.createdAt,
});

async function ensureDefaultTeachers() {
  const existingCount = await Teacher.countDocuments();
  if (existingCount === 0) {
    await Teacher.insertMany(defaultTeachers);
    return;
  }

  await Teacher.updateMany(
    { $or: [{ schoolName: { $exists: false } }, { schoolName: "" }] },
    { $set: { schoolName: "Sunrise School" } },
  );
}

const slugSchoolName = (schoolName) =>
  String(schoolName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 4) || "SCH";

async function generateTeacherId(schoolName) {
  const prefix = slugSchoolName(schoolName);
  const expression = new RegExp(`^${prefix}-T-(\\d{4})$`);
  const existing = await Teacher.find({ teacherId: { $regex: expression } }, { teacherId: 1, _id: 0 }).lean();
  const numbers = existing
    .map((item) => {
      const match = item.teacherId.match(expression);
      return match ? Number.parseInt(match[1], 10) : 0;
    })
    .filter((value) => value > 0);
  const next = (numbers.length ? Math.max(...numbers) : 1000) + 1;
  return `${prefix}-T-${String(next).padStart(4, "0")}`;
}

async function generateStudentId(schoolName, className) {
  const schoolPrefix = slugSchoolName(schoolName);
  const classCode = String(className).replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4) || "GEN";
  const expression = new RegExp(`^${schoolPrefix}-${classCode}-S-(\\d{4})$`);
  const existing = await Student.find(
    { studentId: { $regex: expression } },
    { studentId: 1, _id: 0 },
  ).lean();
  const numbers = existing
    .map((item) => {
      const match = item.studentId.match(expression);
      return match ? Number.parseInt(match[1], 10) : 0;
    })
    .filter((value) => value > 0);
  const next = (numbers.length ? Math.max(...numbers) : 1000) + 1;
  return `${schoolPrefix}-${classCode}-S-${String(next).padStart(4, "0")}`;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "School dashboard backend is running" });
});

app.get("/api/teachers", async (_req, res) => {
  const teachers = await Teacher.find().sort({ name: 1 }).lean();
  res.json({ teachers: teachers.map(asTeacherResponse) });
});

app.get("/api/teachers/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  const teacher = await Teacher.findOne({ teacherId }).lean();
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found." });
  }

  return res.json({ teacher: asTeacherResponse(teacher) });
});

app.post("/api/teachers/generate-id", async (req, res) => {
  const { schoolName } = req.body;
  if (!schoolName) {
    return res.status(400).json({ message: "schoolName is required." });
  }

  const generatedTeacherId = await generateTeacherId(schoolName);
  return res.json({ teacherId: generatedTeacherId });
});

app.post("/api/teachers", async (req, res) => {
  const { schoolName, teacherId, name, subject, grade, phone, email } = req.body;

  if (!schoolName || !name || !subject || !grade) {
    return res.status(400).json({ message: "schoolName, name, subject, and grade are required." });
  }

  const finalTeacherId = teacherId ? String(teacherId).trim() : await generateTeacherId(schoolName);
  const exists = await Teacher.findOne({ teacherId: finalTeacherId }).lean();
  if (exists) {
    return res.status(409).json({ message: "Teacher ID already exists." });
  }

  const teacher = await Teacher.create({
    teacherId: finalTeacherId,
    schoolName: schoolName.trim(),
    name: name.trim(),
    subject: subject.trim(),
    grade: grade.trim(),
    phone: phone ? String(phone).trim() : "",
    email: email ? String(email).trim() : "",
  });

  return res.status(201).json({ message: "Teacher added successfully.", teacher: asTeacherResponse(teacher) });
});

app.put("/api/teachers/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  const { schoolName, name, subject, grade, phone, email } = req.body;

  if (!schoolName || !name || !subject || !grade) {
    return res.status(400).json({ message: "schoolName, name, subject, and grade are required." });
  }

  const teacher = await Teacher.findOneAndUpdate(
    { teacherId },
    {
      $set: {
        schoolName: schoolName.trim(),
        name: name.trim(),
        subject: subject.trim(),
        grade: grade.trim(),
        phone: phone ? String(phone).trim() : "",
        email: email ? String(email).trim() : "",
      },
    },
    { new: true },
  ).lean();

  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found." });
  }

  return res.json({ message: "Teacher updated successfully.", teacher: asTeacherResponse(teacher) });
});

app.get("/api/students", async (_req, res) => {
  const students = await Student.find().sort({ createdAt: -1 }).lean();
  return res.json({ students: students.map(asStudentResponse) });
});

app.post("/api/students/generate-id", async (req, res) => {
  const { schoolName, className } = req.body;
  if (!schoolName || !className) {
    return res.status(400).json({ message: "schoolName and className are required." });
  }

  const studentId = await generateStudentId(schoolName, className);
  return res.json({ studentId });
});

app.post("/api/students", async (req, res) => {
  const { schoolName, className, studentId, name, rollNo, parentName, phone } = req.body;
  if (!schoolName || !className || !name || !rollNo) {
    return res.status(400).json({ message: "schoolName, className, name, and rollNo are required." });
  }

  const finalStudentId = studentId ? String(studentId).trim() : await generateStudentId(schoolName, className);

  const existingStudentId = await Student.findOne({ studentId: finalStudentId }).lean();
  if (existingStudentId) {
    return res.status(409).json({ message: "Student ID already exists." });
  }

  const existingRoll = await Student.findOne({
    schoolName: schoolName.trim(),
    className: className.trim(),
    rollNo: String(rollNo).trim(),
  }).lean();
  if (existingRoll) {
    return res.status(409).json({ message: "Roll number already exists in this class." });
  }

  const student = await Student.create({
    studentId: finalStudentId,
    schoolName: schoolName.trim(),
    className: className.trim(),
    name: name.trim(),
    rollNo: String(rollNo).trim(),
    parentName: parentName ? String(parentName).trim() : "",
    phone: phone ? String(phone).trim() : "",
  });

  return res.status(201).json({ message: "Student added successfully.", student: asStudentResponse(student) });
});

app.put("/api/students/:studentId", async (req, res) => {
  const { studentId } = req.params;
  const { schoolName, className, studentId: nextStudentId, name, rollNo, parentName, phone } = req.body;

  if (!schoolName || !className || !name || !rollNo) {
    return res.status(400).json({ message: "schoolName, className, name, and rollNo are required." });
  }

  const finalStudentId = nextStudentId ? String(nextStudentId).trim() : String(studentId).trim();

  const existingStudent = await Student.findOne({ studentId }).lean();
  if (!existingStudent) {
    return res.status(404).json({ message: "Student not found." });
  }

  if (finalStudentId !== studentId) {
    const studentIdConflict = await Student.findOne({ studentId: finalStudentId }).lean();
    if (studentIdConflict) {
      return res.status(409).json({ message: "Student ID already exists." });
    }
  }

  const rollConflict = await Student.findOne({
    studentId: { $ne: studentId },
    schoolName: schoolName.trim(),
    className: className.trim(),
    rollNo: String(rollNo).trim(),
  }).lean();

  if (rollConflict) {
    return res.status(409).json({ message: "Roll number already exists in this class." });
  }

  const updatedStudent = await Student.findOneAndUpdate(
    { studentId },
    {
      $set: {
        studentId: finalStudentId,
        schoolName: schoolName.trim(),
        className: className.trim(),
        name: name.trim(),
        rollNo: String(rollNo).trim(),
        parentName: parentName ? String(parentName).trim() : "",
        phone: phone ? String(phone).trim() : "",
      },
    },
    { new: true },
  ).lean();

  return res.json({ message: "Student updated successfully.", student: asStudentResponse(updatedStudent) });
});

app.get("/api/fees", async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const fees = await Fee.find().sort({ submittedAt: -1 }).limit(limit).lean();
  const [total, totalAmountRes] = await Promise.all([
    Fee.countDocuments(),
    Fee.aggregate([{ $group: { _id: null, totalAmount: { $sum: "$amount" } } }]),
  ]);

  const totalAmount = totalAmountRes[0]?.totalAmount || 0;
  res.json({ fees: fees.map(asFeeResponse), total, totalAmount });
});

app.post("/api/fees", async (req, res) => {
  const { studentName, className, rollNo, amount, paymentMode } = req.body;

  if (!studentName || !className || !rollNo || !amount || !paymentMode) {
    return res.status(400).json({ message: "All fee fields are required." });
  }

  const amountAsNumber = Number(amount);
  if (Number.isNaN(amountAsNumber) || amountAsNumber <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number." });
  }

  const submittedAt = new Date();
  const fee = await Fee.create({
    feeId: makeId("F"),
    studentName: studentName.trim(),
    className: className.trim(),
    rollNo: String(rollNo).trim(),
    amount: amountAsNumber,
    paymentMode: paymentMode.trim(),
    submittedAt,
    submittedDateKey: getDateKeyInTimezone(submittedAt, ATTENDANCE_TIMEZONE),
  });

  return res.status(201).json({ message: "Fee submitted successfully.", fee: asFeeResponse(fee) });
});

app.get("/api/files", async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const files = await FileSubmission.find().sort({ submittedAt: -1 }).limit(limit).lean();
  const total = await FileSubmission.countDocuments();
  res.json({ files: files.map(asFileResponse), total });
});

app.post("/api/files", async (req, res) => {
  const { studentName, className, rollNo, documentType, fileUrl, notes } = req.body;

  if (!studentName || !className || !rollNo || !documentType || !fileUrl) {
    return res.status(400).json({ message: "All file submission fields are required." });
  }

  const submittedAt = new Date();
  const file = await FileSubmission.create({
    fileId: makeId("DOC"),
    studentName: studentName.trim(),
    className: className.trim(),
    rollNo: String(rollNo).trim(),
    documentType: documentType.trim(),
    fileUrl: fileUrl.trim(),
    notes: notes ? notes.trim() : "",
    submittedAt,
    submittedDateKey: getDateKeyInTimezone(submittedAt, ATTENDANCE_TIMEZONE),
  });

  return res.status(201).json({ message: "File submitted successfully.", file: asFileResponse(file) });
});

app.get("/api/dashboard/summary", async (_req, res) => {
  const now = new Date();
  const dateKey = getDateKeyInTimezone(now, ATTENDANCE_TIMEZONE);
  const [totalTeachers, totalFeeRecords, totalFiles, totalFeeAmountRes, todayFeeRes] =
    await Promise.all([
      Teacher.countDocuments(),
      Fee.countDocuments(),
      FileSubmission.countDocuments(),
      Fee.aggregate([{ $group: { _id: null, totalAmount: { $sum: "$amount" } } }]),
      Fee.aggregate([
        { $match: { submittedDateKey: dateKey } },
        { $group: { _id: null, todayCollection: { $sum: "$amount" } } },
      ]),
    ]);

  const totalFeeAmount = totalFeeAmountRes[0]?.totalAmount || 0;
  const todayCollection = todayFeeRes[0]?.todayCollection || 0;

  res.json({
    totalTeachers,
    totalFeeRecords,
    totalFeeAmount,
    totalFileRecords: totalFiles,
    todayCollection,
  });
});

app.use((error, _req, res, next) => {
  void next;
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

async function bootstrap() {
  await connectDb();
  await ensureDefaultTeachers();
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
