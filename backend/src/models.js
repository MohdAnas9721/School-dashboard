import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true, unique: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
  },
  { versionKey: false, timestamps: true },
);

const feeSchema = new mongoose.Schema(
  {
    feeId: { type: String, required: true, unique: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMode: { type: String, required: true, trim: true },
    submittedAt: { type: Date, required: true },
    submittedDateKey: { type: String, required: true, index: true },
  },
  { versionKey: false },
);

const fileSubmissionSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true, unique: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    documentType: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    notes: { type: String, default: "", trim: true },
    submittedAt: { type: Date, required: true },
    submittedDateKey: { type: String, required: true, index: true },
  },
  { versionKey: false },
);

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    parentName: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
  },
  { versionKey: false, timestamps: true },
);

studentSchema.index({ schoolName: 1, className: 1, rollNo: 1 }, { unique: true });

export const Teacher = mongoose.model("Teacher", teacherSchema);
export const Fee = mongoose.model("Fee", feeSchema);
export const FileSubmission = mongoose.model("FileSubmission", fileSubmissionSchema);
export const Student = mongoose.model("Student", studentSchema);
