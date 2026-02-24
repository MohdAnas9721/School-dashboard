export function DashboardSection({
  summary,
  teachers = [],
  students = [],
  fees,
  files,
}) {
  return (
    <section className="section-shell">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <article className="stat-card">
          <h3>Total Teachers</h3>
          <strong>{summary?.totalTeachers ?? 0}</strong>
        </article>
        <article className="stat-card">
          <h3>Total Fee Count</h3>
          <strong>{summary?.totalFeeRecords ?? 0}</strong>
        </article>
        <article className="stat-card">
          <h3>Total Fees</h3>
          <strong>Rs. {summary?.totalFeeAmount ?? 0}</strong>
        </article>
        <article className="stat-card">
          <h3>Today Collection</h3>
          <strong>Rs. {summary?.todayCollection ?? 0}</strong>
        </article>
      </div>

      <div className="split-grid">
        <article className="panel">
          <h3>Teachers (Saved List)</h3>
          <p className="muted">Mongo + screen saved all teacher IDs ({teachers.length})</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      No teachers saved yet.
                    </td>
                  </tr>
                )}
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>{teacher.id}</td>
                    <td>{teacher.name}</td>
                    <td>{teacher.subject}</td>
                    <td>{teacher.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h3>Students (Saved List)</h3>
          <p className="muted">Mongo + screen saved all student IDs ({students.length})</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Roll</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      No students saved yet.
                    </td>
                  </tr>
                )}
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.className}</td>
                    <td>{student.rollNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <article className="panel">
        <h3>Fees (Latest Entries)</h3>
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
          {fees.length === 0 && <p className="empty-text">No fee entries yet.</p>}
        </div>
      </article>

      <article className="panel">
        <h3>Student Files (Dashboard)</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Type</th>
                <th>File</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {files.map((item) => (
                <tr key={item.id}>
                  <td>{item.studentName}</td>
                  <td>{item.className}</td>
                  <td>{item.documentType}</td>
                  <td>
                    <a href={item.fileUrl} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </td>
                  <td>{new Date(item.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {files.length === 0 && <p className="empty-text">No student files yet.</p>}
        </div>
      </article>
    </section>
  );
}
