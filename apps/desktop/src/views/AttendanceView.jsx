export default function AttendanceView() {
  return (
    <section className="desktop-view">
      <div className="view-header">
        <div>
          <p className="desktop-eyebrow">Attendance</p>
          <h1>Daily class attendance and summaries</h1>
        </div>
      </div>
      <article className="desktop-card">
        <h2>Teacher Attendance Panel</h2>
        <p className="desktop-copy">Designed for quick daily marking with large buttons and minimal clicks.</p>
        <div className="desktop-action-grid">
          <button type="button">Present</button>
          <button type="button">Absent</button>
          <button type="button">Late</button>
          <button type="button">Leave</button>
        </div>
      </article>
    </section>
  );
}
