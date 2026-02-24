import { IdCardPreview } from "../components/IdCardPreview";
import { useMemo } from "react";

export function TeachersSection({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  teacherForm,
  setTeacherForm,
  teacherStatus,
  onGenerateTeacherId,
  onSaveTeacher,
  isEditingTeacher,
  onResetTeacherForm,
  generatedTeacherCard,
}) {
  const teacherCardPreview = useMemo(() => {
    const base = generatedTeacherCard || selectedTeacher || {};
    return {
      id: String(teacherForm.teacherId || base.id || "Pending ID").trim(),
      schoolName: String(teacherForm.schoolName || base.schoolName || "School Name").trim(),
      name: String(teacherForm.name || base.name || "Teacher Name").trim(),
      subject: String(teacherForm.subject || base.subject || "Subject").trim(),
      grade: String(teacherForm.grade || base.grade || "Grade").trim(),
      phone: String(teacherForm.phone || base.phone || "-").trim(),
      email: String(teacherForm.email || base.email || "-").trim(),
    };
  }, [generatedTeacherCard, selectedTeacher, teacherForm]);

  return (
    <section className="section-shell">
      <h2>Teacher</h2>

      <div className="split-grid">
        <article className="panel">
          <h3>Teacher List</h3>
          <p className="muted">Click teacher to open details.</p>
          <div className="list-box">
            {teachers.length === 0 && <p className="empty-text">No teacher found.</p>}
            {teachers.map((teacher) => {
              const active = selectedTeacher?.id === teacher.id;
              return (
                <button
                  key={teacher.id}
                  type="button"
                  className={`list-row ${active ? "active" : ""}`}
                  onClick={() => onSelectTeacher(teacher.id)}
                >
                  <span>{teacher.name}</span>
                  <small>
                    {teacher.id} | {teacher.subject}
                  </small>
                </button>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <h3>Teacher Details</h3>
          {!selectedTeacher && <p className="empty-text">Select a teacher.</p>}
          {selectedTeacher && (
            <div className="detail-grid">
              <p>
                <strong>ID:</strong> {selectedTeacher.id}
              </p>
              <p>
                <strong>Name:</strong> {selectedTeacher.name}
              </p>
              <p>
                <strong>School:</strong> {selectedTeacher.schoolName}
              </p>
              <p>
                <strong>Subject:</strong> {selectedTeacher.subject}
              </p>
              <p>
                <strong>Grade:</strong> {selectedTeacher.grade}
              </p>
              <p>
                <strong>Phone:</strong> {selectedTeacher.phone || "-"}
              </p>
              <p>
                <strong>Email:</strong> {selectedTeacher.email || "-"}
              </p>
            </div>
          )}
        </article>
      </div>

      <div className="split-grid">
        <article className="panel">
          <h3>{isEditingTeacher ? "Edit Teacher" : "Add Teacher"}</h3>
          <p className="muted">
            {isEditingTeacher
              ? "Edit mode active: selected teacher update hoga."
              : "Add mode active: naya teacher create hoga."}
          </p>
          <div className="inline-row inline-row-right">
            <button type="button" onClick={onResetTeacherForm}>
              New Form
            </button>
          </div>
          <form className="form-grid" onSubmit={onSaveTeacher}>
            <input
              placeholder="School Name"
              value={teacherForm.schoolName}
              onChange={(event) => setTeacherForm({ ...teacherForm, schoolName: event.target.value })}
              required
            />
            <div className="inline-row">
              <input
                placeholder="Teacher ID"
                value={teacherForm.teacherId}
                onChange={(event) => setTeacherForm({ ...teacherForm, teacherId: event.target.value })}
              />
              <button type="button" onClick={onGenerateTeacherId}>
                Generate ID
              </button>
            </div>
            <input
              placeholder="Teacher Name"
              value={teacherForm.name}
              onChange={(event) => setTeacherForm({ ...teacherForm, name: event.target.value })}
              required
            />
            <input
              placeholder="Subject"
              value={teacherForm.subject}
              onChange={(event) => setTeacherForm({ ...teacherForm, subject: event.target.value })}
              required
            />
            <input
              placeholder="Grade Range (e.g. 6-8)"
              value={teacherForm.grade}
              onChange={(event) => setTeacherForm({ ...teacherForm, grade: event.target.value })}
              required
            />
            <input
              placeholder="Phone"
              value={teacherForm.phone}
              onChange={(event) => setTeacherForm({ ...teacherForm, phone: event.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={teacherForm.email}
              onChange={(event) => setTeacherForm({ ...teacherForm, email: event.target.value })}
            />
            <button type="submit">{isEditingTeacher ? "Update Teacher" : "Add Teacher"}</button>
          </form>
          <p className="status-text">{teacherStatus}</p>
        </article>

        <IdCardPreview
          type="teacher"
          data={teacherCardPreview}
          emptyText="Teacher ID card side preview always visible rahega."
        />
      </div>
    </section>
  );
}
