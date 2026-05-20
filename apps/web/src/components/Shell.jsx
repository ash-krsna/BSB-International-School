import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { contactInfo } from "../content/schoolData";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/admissions", label: "Admissions" },
  { to: "/gallery", label: "Gallery" },
  { to: "/learn", label: "Play" },
  { to: "/feedback", label: "Feedback" },
  { to: "/notices", label: "Notices" },
  { to: "/contact", label: "Contact" },
  { to: "/results", label: "Results" },
  { to: "/portal", label: "Portal" }
];

export default function Shell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="web-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">
              <img src="/showcase/logo-transparent.png" alt="BSB International School logo" />
            </span>
            <span>
              <strong>BSB International School</strong>
              <small>Creating The Leaders</small>
            </span>
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={`main-nav${menuOpen ? " open" : ""}`} id="main-navigation" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav-pill" onClick={() => setMenuOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h4>BSB International School</h4>
            <p>A growing primary school focused on quality education, discipline, and modern learning methods.</p>
          </div>
          <div>
            <h5>Quick Access</h5>
            <div className="footer-links">
              {navItems.slice(2, 7).map((item) => (
                <Link key={item.to} to={item.to}>{item.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h5>Contact</h5>
            <p>{contactInfo.officeLabel}</p>
            <p>{contactInfo.replyNote}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
