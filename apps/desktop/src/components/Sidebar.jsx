import { modules } from "../data/modules";

export default function Sidebar({ activeModule, onChange, visibleModules, session, onLogout }) {
  return (
    <aside className="desktop-sidebar">
      <div className="desktop-brand">
        <span className="desktop-brand-mark">
          <img src="/showcase/logo.jpeg" alt="BSB logo" />
        </span>
        <div>
          <strong>BSB ERP</strong>
          <small>Office Desktop Software</small>
        </div>
      </div>

      {session ? (
        <div className="desktop-user-card">
          <p>{session.user.fullName}</p>
          <small>{session.user.roles.join(", ")}</small>
        </div>
      ) : null}

      <div className="desktop-nav">
        {modules.filter((module) => visibleModules.includes(module.id)).map((module) => (
          <button
            key={module.id}
            className={module.id === activeModule ? "desktop-nav-button active" : "desktop-nav-button"}
            onClick={() => onChange(module.id)}
            type="button"
          >
            {module.label}
          </button>
        ))}
      </div>

      {session ? (
        <button className="desktop-secondary-button" onClick={onLogout} type="button">Logout</button>
      ) : null}
    </aside>
  );
}
