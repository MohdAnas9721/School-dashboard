export function SettingsSection() {
  return (
    <section className="section-shell">
      <h2>Setting</h2>
      <article className="panel">
        <h3>System Rules</h3>
        <ul className="settings-list">
          <li>Teacher ID format: SCHOOLCODE-T-XXXX</li>
          <li>Student ID format: SCHOOLCODE-CLASS-S-XXXX</li>
          <li>All fee and file submissions are saved in MongoDB</li>
          <li>Roll number must be unique within same class</li>
        </ul>
      </article>
    </section>
  );
}
