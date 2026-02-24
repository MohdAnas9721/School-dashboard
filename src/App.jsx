import { useCallback, useEffect, useState } from "react";
import { api } from "./api/client";
import { Sidebar } from "./components/Sidebar";
import { DashboardSection } from "./sections/DashboardSection";
import { StudentsSection } from "./sections/StudentsSection";
import { PaymentsSection } from "./sections/PaymentsSection";
import { TeachersSection } from "./sections/TeachersSection";
import { SettingsSection } from "./sections/SettingsSection";
import "./App.css";

const defaultFeeForm = {
  studentName: "",
  className: "",
  rollNo: "",
  amount: "",
  paymentMode: "UPI",
};

const defaultTeacherForm = {
  schoolName: "",
  teacherId: "",
  name: "",
  subject: "",
  grade: "",
  phone: "",
  email: "",
};

const defaultStudentForm = {
  schoolName: "",
  className: "",
  studentId: "",
  name: "",
  rollNo: "",
  parentName: "",
  phone: "",
};

function generateLocalTeacherId(schoolName, teachers) {
  const prefix =
    String(schoolName)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 4) || "SCH";

  const expression = new RegExp(`^${prefix}-T-(\\d{4})$`);
  const max = teachers.reduce((acc, teacher) => {
    const match = teacher.id?.match(expression);
    if (!match) {
      return acc;
    }
    return Math.max(acc, Number.parseInt(match[1], 10));
  }, 1000);

  return `${prefix}-T-${String(max + 1).padStart(4, "0")}`;
}

function generateLocalStudentId(schoolName, className, students) {
  const schoolPrefix =
    String(schoolName)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 4) || "SCH";

  const classCode =
    String(className).replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4) || "GEN";

  const expression = new RegExp(`^${schoolPrefix}-${classCode}-S-(\\d{4})$`);
  const max = students.reduce((acc, student) => {
    const match = String(student.id || "").match(expression);
    if (!match) {
      return acc;
    }
    return Math.max(acc, Number.parseInt(match[1], 10));
  }, 1000);

  return `${schoolPrefix}-${classCode}-S-${String(max + 1).padStart(4, "0")}`;
}

function App() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [summary, setSummary] = useState(null);
  const [fees, setFees] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [files, setFiles] = useState([]);

  const [feeForm, setFeeForm] = useState(defaultFeeForm);
  const [teacherForm, setTeacherForm] = useState(defaultTeacherForm);
  const [studentForm, setStudentForm] = useState(defaultStudentForm);

  const [feeStatus, setFeeStatus] = useState("");
  const [teacherStatus, setTeacherStatus] = useState("");
  const [studentStatus, setStudentStatus] = useState("");
  const [generatedTeacherCard, setGeneratedTeacherCard] = useState(null);
  const [generatedStudentCard, setGeneratedStudentCard] = useState(null);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [teacherMode, setTeacherMode] = useState("add");
  const [studentMode, setStudentMode] = useState("add");
  const [selectedStudentRecord, setSelectedStudentRecord] = useState(null);

  const isEditingTeacher = teacherMode === "edit" && Boolean(selectedTeacher);
  const isEditingStudent = studentMode === "edit" && Boolean(selectedStudentRecord);

  const loadAllData = useCallback(async () => {
    const [summaryRes, feesRes, teachersRes, studentsRes, filesRes] = await Promise.all([
      api.getSummary(),
      api.getFees("limit=20"),
      api.getTeachers(),
      api.getStudents(),
      api.getFiles(40),
    ]);

    setSummary(summaryRes);
    setFees(feesRes.fees);
    setTeachers(teachersRes.teachers);
    setStudents(studentsRes.students);
    setFiles(filesRes.files);

    if (filesRes.files.length > 0) {
      const first = filesRes.files[0];
      setSelectedStudent((current) =>
        current
          ? current
          : {
              studentName: first.studentName,
              className: first.className,
              rollNo: first.rollNo,
            },
      );
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await loadAllData();
      } catch (error) {
        setFeeStatus(error.message);
      }
    };

    init();
  }, [loadAllData]);

  const handleFeeSubmit = async (event) => {
    event.preventDefault();
    setFeeStatus("Saving fee...");

    try {
      await api.createFee(feeForm);
      setFeeStatus("Fee saved successfully.");
      setFeeForm(defaultFeeForm);
      await loadAllData();
    } catch (error) {
      setFeeStatus(error.message);
    }
  };

  const handleSelectTeacher = async (teacherId) => {
    setTeacherStatus("Loading teacher details...");
    try {
      const response = await api.getTeacherById(teacherId);
      const teacher = response.teacher;
      setSelectedTeacher(teacher);
      setTeacherForm({
        schoolName: teacher.schoolName || "",
        teacherId: teacher.id,
        name: teacher.name,
        subject: teacher.subject,
        grade: teacher.grade,
        phone: teacher.phone || "",
        email: teacher.email || "",
      });
      setTeacherMode("edit");
      setTeacherStatus("Teacher details loaded.");
    } catch (error) {
      setTeacherStatus(error.message);
    }
  };

  const handleGenerateTeacherId = async () => {
    if (!teacherForm.schoolName.trim()) {
      setTeacherStatus("School name likho, fir ID generate hoga.");
      return;
    }

    try {
      const response = await api.generateTeacherId(teacherForm.schoolName);
      setTeacherForm((current) => ({ ...current, teacherId: response.teacherId }));
      setTeacherStatus("Teacher ID generated.");
    } catch {
      const fallbackId = generateLocalTeacherId(teacherForm.schoolName, teachers);
      setTeacherForm((current) => ({ ...current, teacherId: fallbackId }));
      setTeacherStatus("Backend generate API unavailable. Local teacher ID generated.");
    }
  };

  const handleSaveTeacher = async (event) => {
    event.preventDefault();

    try {
      let savedTeacher = null;
      const wasEditingTeacher = isEditingTeacher;

      if (wasEditingTeacher) {
        const response = await api.updateTeacher(selectedTeacher.id, teacherForm);
        savedTeacher = response.teacher;
        setTeacherStatus("Teacher updated successfully. ID card generated.");
      } else {
        const response = await api.addTeacher(teacherForm);
        savedTeacher = response.teacher;
        setTeacherStatus("Teacher added successfully. ID card generated.");
      }

      if (savedTeacher) {
        setTeachers((current) => {
          const next = current.filter((item) => item.id !== savedTeacher.id);
          next.push(savedTeacher);
          next.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
          return next;
        });
      }

      setGeneratedTeacherCard(savedTeacher);
      if (savedTeacher) {
        if (wasEditingTeacher) {
          setSelectedTeacher(savedTeacher);
          setTeacherForm({
            schoolName: savedTeacher.schoolName || "",
            teacherId: savedTeacher.id,
            name: savedTeacher.name,
            subject: savedTeacher.subject,
            grade: savedTeacher.grade,
            phone: savedTeacher.phone || "",
            email: savedTeacher.email || "",
          });
          setTeacherMode("edit");
        } else {
          setSelectedTeacher(savedTeacher);
          setTeacherForm(defaultTeacherForm);
          setTeacherMode("add");
        }
      }

      await loadAllData();
    } catch (error) {
      if (String(error.message).includes("Cannot POST /api/teachers")) {
        setTeacherStatus("Teacher add API not active. Restart backend: npm --prefix backend run dev");
        return;
      }
      setTeacherStatus(error.message);
    }
  };

  const handleResetTeacherForm = () => {
    setSelectedTeacher(null);
    setTeacherForm(defaultTeacherForm);
    setTeacherMode("add");
    setTeacherStatus("New teacher form ready.");
  };

  const handleGenerateStudentId = async () => {
    if (!studentForm.schoolName.trim() || !studentForm.className.trim()) {
      setStudentStatus("School name aur class name likho, fir ID generate hoga.");
      return;
    }

    try {
      const response = await api.generateStudentId(studentForm.schoolName, studentForm.className);
      setStudentForm((current) => ({ ...current, studentId: response.studentId }));
      setStudentStatus("Student ID generated.");
    } catch (error) {
      const fallbackId = generateLocalStudentId(studentForm.schoolName, studentForm.className, students);
      setStudentForm((current) => ({ ...current, studentId: fallbackId }));
      setStudentStatus(
        `Backend generate API unavailable. Local student ID generated.${
          error?.message ? ` (${error.message})` : ""
        }`,
      );
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudentRecord(student);
    setStudentMode("edit");
    setStudentForm({
      schoolName: student.schoolName || "",
      className: student.className || "",
      studentId: student.id || "",
      name: student.name || "",
      rollNo: student.rollNo || "",
      parentName: student.parentName || "",
      phone: student.phone || "",
    });
    setGeneratedStudentCard(student);
    setStudentStatus("Student edit mode active.");
  };

  const handleResetStudentForm = () => {
    setSelectedStudentRecord(null);
    setStudentMode("add");
    setStudentForm(defaultStudentForm);
    setStudentStatus("Student form cleared.");
  };

  const handleSaveStudent = async (event) => {
    event.preventDefault();
    setStudentStatus("Saving student...");

    try {
      const wasEditingStudent = isEditingStudent;
      const response = wasEditingStudent
        ? await api.updateStudent(selectedStudentRecord.id, studentForm)
        : await api.addStudent(studentForm);

      const savedStudent = response.student;
      setStudents((current) => {
        const next = current.filter((item) => item.id !== savedStudent.id);
        next.unshift(savedStudent);
        return next;
      });
      setGeneratedStudentCard(savedStudent);
      setSelectedStudentRecord(savedStudent);
      setStudentStatus(
        wasEditingStudent
          ? "Student updated successfully. ID card saved."
          : "Student added successfully. ID card saved.",
      );
      setStudentForm(defaultStudentForm);
      setStudentMode("add");
      setSelectedStudentRecord(null);
      await loadAllData();
    } catch (error) {
      setStudentStatus(error.message);
    }
  };

  const renderSection = () => {
    if (activeSection === "dashboard") {
      return (
        <DashboardSection
          summary={summary}
          teachers={teachers}
          students={students}
          fees={fees.slice(0, 8)}
          files={files.slice(0, 8)}
        />
      );
    }

    if (activeSection === "students") {
      return (
        <StudentsSection
          students={students}
          files={files}
          selectedStudent={selectedStudent}
          onSelectStudent={setSelectedStudent}
          studentForm={studentForm}
          setStudentForm={setStudentForm}
          studentStatus={studentStatus}
          onGenerateStudentId={handleGenerateStudentId}
          onSaveStudent={handleSaveStudent}
          generatedStudentCard={generatedStudentCard}
          isEditingStudent={isEditingStudent}
          onEditStudent={handleEditStudent}
          onResetStudentForm={handleResetStudentForm}
        />
      );
    }

    if (activeSection === "payment") {
      return (
        <PaymentsSection
          feeForm={feeForm}
          setFeeForm={setFeeForm}
          onSubmitFee={handleFeeSubmit}
          feeStatus={feeStatus}
          fees={fees}
        />
      );
    }

    if (activeSection === "teacher") {
      return (
        <TeachersSection
          teachers={teachers}
          selectedTeacher={selectedTeacher}
          onSelectTeacher={handleSelectTeacher}
          teacherForm={teacherForm}
          setTeacherForm={setTeacherForm}
          teacherStatus={teacherStatus}
          onGenerateTeacherId={handleGenerateTeacherId}
          onSaveTeacher={handleSaveTeacher}
          isEditingTeacher={isEditingTeacher}
          onResetTeacherForm={handleResetTeacherForm}
          generatedTeacherCard={generatedTeacherCard}
        />
      );
    }

    return <SettingsSection />;
  };

  return (
    <div className="app-shell">
      <main className="content-shell">
        <Sidebar activeSection={activeSection} onChangeSection={setActiveSection} />
        <div className="section-host">{renderSection()}</div>
      </main>
    </div>
  );
}

export default App;
