function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildRows(type, data) {
  if (!data) return [];

  if (type === "teacher") {
    return [
      ["ID", data.id],
      ["Subject", data.subject],
      ["Grade", data.grade],
      ["Phone", data.phone || "-"],
      ["Email", data.email || "-"],
    ];
  }

  return [
    ["ID", data.id],
    ["Class", data.className],
    ["Roll No", data.rollNo],
    ["Parent", data.parentName || "-"],
    ["Phone", data.phone || "-"],
  ];
}

function getCardTitle(type) {
  return type === "teacher" ? "Teacher ID Card" : "Student ID Card";
}

function getAccentClass(type) {
  return type === "teacher" ? "id-card--teacher" : "id-card--student";
}

export function IdCardPreview({ type = "student", data, emptyText = "No ID card generated yet." }) {
  const rows = buildRows(type, data);

  const handlePrint = () => {
    if (!data) return;

    const title = getCardTitle(type);
    const schoolName = escapeHtml(data.schoolName || "School");
    const personName = escapeHtml(data.name || "-");
    const badge = escapeHtml(type === "teacher" ? "STAFF" : "STUDENT");
    const rowHtml = rows
      .map(
        ([label, value]) =>
          `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value || "-")}</td></tr>`,
      )
      .join("");

    const win = window.open("", "_blank", "width=860,height=650");
    if (!win) return;

    win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { margin: 0; background: #eef3ff; font-family: Arial, sans-serif; }
    .wrap { padding: 24px; display: grid; place-items: center; min-height: 100vh; }
    .card {
      width: 360px;
      border-radius: 18px;
      background: #fff;
      border: 1px solid #d7e2ff;
      box-shadow: 0 16px 40px rgba(20, 37, 84, 0.14);
      overflow: hidden;
    }
    .head {
      padding: 16px;
      color: #fff;
      background: ${
        type === "teacher"
          ? "linear-gradient(135deg, #0f766e, #0ea5e9)"
          : "linear-gradient(135deg, #1d4ed8, #2563eb)"
      };
    }
    .head h1 { margin: 0 0 4px; font-size: 18px; }
    .head p { margin: 0; font-size: 12px; opacity: 0.95; }
    .body { padding: 16px; }
    .name { margin: 0 0 6px; font-size: 22px; font-weight: 700; color: #111827; }
    .badge {
      display: inline-block; margin: 0 0 12px; padding: 4px 10px; border-radius: 999px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px; color: #fff;
      background: ${type === "teacher" ? "#0f766e" : "#2563eb"};
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td { padding: 7px 0; border-bottom: 1px solid #edf2ff; }
    td:first-child { color: #6b7280; width: 34%; }
    td:last-child { color: #111827; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="card">
      <header class="head">
        <h1>${schoolName}</h1>
        <p>${title}</p>
      </header>
      <div class="body">
        <p class="name">${personName}</p>
        <span class="badge">${badge}</span>
        <table>${rowHtml}</table>
      </div>
    </section>
  </div>
  <script>window.print();</script>
</body>
</html>`);
    win.document.close();
  };

  return (
    <article className="panel">
      <div className="id-card-header-row">
        <div>
          <h3>{getCardTitle(type)}</h3>
          <p className="muted">
            {data ? "Admin form submit hone ke baad yaha printable ID card preview aayega." : emptyText}
          </p>
        </div>
        <button type="button" className="button-secondary" onClick={handlePrint} disabled={!data}>
          Print Card
        </button>
      </div>

      {!data && <p className="empty-text">{emptyText}</p>}

      {data && (
        <div className={`id-card ${getAccentClass(type)}`}>
          <div className="id-card__top">
            <div>
              <p className="id-card__school">{data.schoolName || "School"}</p>
              <h4 className="id-card__name">{data.name || "-"}</h4>
              <p className="id-card__role">{type === "teacher" ? "Teacher" : "Student"}</p>
            </div>
            <div className="id-card__avatar" aria-hidden="true">
              {(data.name || "?").trim().slice(0, 1).toUpperCase()}
            </div>
          </div>

          <div className="id-card__meta">
            {rows.map(([label, value]) => (
              <div key={label} className="id-card__meta-row">
                <span>{label}</span>
                <strong>{value || "-"}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
