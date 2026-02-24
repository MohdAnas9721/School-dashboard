const navItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "students", label: "Student Section" },
  { id: "payment", label: "Payment" },
  { id: "teacher", label: "Teacher" },
  { id: "setting", label: "Setting" },
];

export function Sidebar({ activeSection, onChangeSection }) {
  return (
    <aside className="sidebar">
      <nav className="nav-stack">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
            onClick={() => onChangeSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
