export default function ReportsView() {
  async function handleExport() {
    if (window.desktopBridge?.openSaveDialog) {
      await window.desktopBridge.openSaveDialog();
    }
  }

  return (
    <section className="desktop-view">
      <div className="view-header">
        <div>
          <p className="desktop-eyebrow">Reports</p>
          <h1>Export Excel and PDF reports for management</h1>
        </div>
        <button className="desktop-primary-button" onClick={handleExport} type="button">Export Report</button>
      </div>
      <div className="desktop-action-grid reports">
        <button type="button">Fee Pending Report</button>
        <button type="button">Daily Collection</button>
        <button type="button">Class Strength</button>
        <button type="button">Attendance Report</button>
        <button type="button">Exam Performance</button>
        <button type="button">Admission Report</button>
      </div>
    </section>
  );
}
