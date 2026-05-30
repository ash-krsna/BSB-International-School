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

const quickFooterLinks = navItems.filter((item) =>
  ["/admissions", "/gallery", "/learn", "/feedback", "/notices", "/results"].includes(item.to)
);

const serviceLinks = [
  { to: "/portal", label: "Parent Portal" },
  { to: "/campus-connect", label: "Staff Login" },
  { to: "/contact", label: "Contact Office" }
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
        <div className="footer-pattern" aria-hidden="true" />
        <div className="container footer-wrap">
          <div className="footer-brand-card">
            <Link to="/" className="footer-brand" onClick={() => setMenuOpen(false)}>
              <span className="footer-logo">
                <img src="/showcase/logo-transparent.png" alt="BSB International School logo" />
              </span>
              <span>
                <strong>BSB International School</strong>
                <small>Creating The Leaders</small>
              </span>
            </Link>
            <p>A growing primary school focused on quality education, discipline, modern learning, and simple parent communication.</p>
            <div className="footer-cta-row">
              <Link to="/admissions" className="footer-cta primary">Apply Now</Link>
              <Link to="/gallery" className="footer-cta">View Events</Link>
            </div>
          </div>

          <div className="footer-grid">
            <div className="footer-column">
              <h5>Quick Access</h5>
              <div className="footer-links">
                {quickFooterLinks.map((item) => (
                  <Link key={item.to} to={item.to}>{item.label}</Link>
                ))}
              </div>
            </div>
            <div className="footer-column">
              <h5>School Services</h5>
              <div className="footer-links">
                {serviceLinks.map((item) => (
                  <Link key={item.to} to={item.to}>{item.label}</Link>
                ))}
              </div>
            </div>
            <div className="footer-column footer-contact">
              <h5>Contact</h5>
              <p>{contactInfo.officeLabel}</p>
              <p>{contactInfo.officeHours}</p>
              <p>{contactInfo.replyNote}</p>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-links">
              <Link to="/about">About School</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/feedback">Feedback</Link>
            </div>
            <span>© 2026 BSB International School. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
