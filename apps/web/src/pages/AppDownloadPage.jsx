import Shell from "../components/Shell";

const appRoles = [
  {
    title: "Parent App",
    description: "Attendance alerts, fees, receipts, results, homework, notices, and bus updates."
  },
  {
    title: "Teacher App",
    description: "Daily attendance, marks upload, homework, remarks, and student progress photos."
  },
  {
    title: "Driver App",
    description: "Pickup list, parent contact, route details, pickup status, and bus payment view."
  }
];

export default function AppDownloadPage() {
  return (
    <Shell>
      <section className="page-section app-download-hero">
        <div className="container two-column">
          <div>
            <span className="eyebrow">Android App</span>
            <h1>One school app for parents, teachers, and drivers.</h1>
            <p className="lede">
              The BSB mobile app connects with the same cloud ERP used by the school office, so attendance, fees,
              results, notices, homework, and bus updates stay synced.
            </p>
            <div className="button-row">
              <a className="button primary" href="/downloads/bsb-international-school.apk">Download APK</a>
              <a className="button secondary" href="https://play.google.com/store" rel="noreferrer" target="_blank">Play Store Coming Soon</a>
            </div>
          </div>
          <div className="phone-preview" aria-hidden="true">
            <div className="phone-bar" />
            <div className="phone-card active">Attendance Alert</div>
            <div className="phone-card">Fee Reminder</div>
            <div className="phone-card">Bus Pickup List</div>
            <div className="phone-card">Result Published</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Connected Roles</span>
            <h2>Built for real rural-school workflows.</h2>
          </div>
          <div className="feature-grid">
            {appRoles.map((role) => (
              <article className="card app-role-card" key={role.title}>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
