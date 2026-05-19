export default function SettingsView({ theme, onToggleTheme }) {
  return (
    <section className="desktop-view">
      <div className="view-header">
        <div>
          <p className="desktop-eyebrow">System Settings</p>
          <h1>Backup, theme, and office preferences</h1>
        </div>
      </div>
      <div className="desktop-grid">
        <article className="desktop-card">
          <h2>Appearance</h2>
          <button className="desktop-primary-button" onClick={onToggleTheme} type="button">
            Switch to {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </article>
        <article className="desktop-card">
          <h2>Backup</h2>
          <p className="desktop-copy">Daily backup is supported by the backend service and can also be triggered manually.</p>
          <button className="desktop-secondary-button" type="button">Run Backup Now</button>
        </article>
      </div>
    </section>
  );
}
