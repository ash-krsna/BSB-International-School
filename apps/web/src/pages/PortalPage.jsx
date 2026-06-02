import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import Shell from "../components/Shell";
import PortalSummary from "../components/PortalSummary";
import { useAuth } from "../state/AuthContext";
import { apiRequest } from "../lib/api";

const demoGrowth = [
  { year: "2023", percentage: 68 },
  { year: "2024", percentage: 74 },
  { year: "2025", percentage: 79 },
  { year: "2026", percentage: 84 }
];

const portalOptions = [
  {
    title: "Student Portal",
    text: "Students and parents will use this area for results, attendance, homework, fees, notices, and student media.",
    action: "Open Student Login",
    href: "#student-login",
    icon: "icon-login"
  },
  {
    title: "Admin Portal",
    text: "School admins can access admission enquiries, confirmations, fees, student records, documents, reports, and all connected office modules.",
    action: "Open Admin Portal",
    href: "/admin",
    icon: "icon-admission"
  },
  {
    title: "Teachers Portal",
    text: "Teachers will track attendance, student performance, tests conducted, activities completed, homework, and class remarks.",
    action: "Teacher Tools",
    href: "#teacher-portal",
    icon: "icon-growth"
  }
];

export default function PortalPage() {
  const { session, login, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const portalRole = useMemo(() => session?.user?.roles?.[0] || null, [session]);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);

    try {
      await login({
        identifier: formData.get("identifier"),
        password: formData.get("password")
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  if (session && !["parent", "student"].includes(portalRole)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Shell>
      <section className="page-section">
        <div className="container narrow">
          {!session ? (
            <>
              <span className="eyebrow">School Portals</span>
              <h1>Choose your portal</h1>
              <p className="lede">One secure opening for students, admins, and teachers. Each portal will grow module-by-module as the school workflow expands.</p>

              <div className="portal-option-grid">
                {portalOptions.map((option) => (
                  <article className="card portal-option-card" key={option.title}>
                    <h3>{option.title}</h3>
                    <p>{option.text}</p>
                    <a className={`button secondary ${option.icon}`} href={option.href}>{option.action}</a>
                  </article>
                ))}
              </div>

              <form className="card form-grid portal-login-card" id="student-login" onSubmit={handleLogin}>
                <div className="full-span">
                  <span className="eyebrow">Student Portal</span>
                  <h2>Student / Parent Login</h2>
                  <p className="status-text">For now, students and parents can sign in here. We will connect result lookup, fees, attendance, and homework next.</p>
                </div>
                <div className="full-span">
                  <label htmlFor="portalIdentifier">Email / Phone / Username</label>
                  <input id="portalIdentifier" name="identifier" required />
                </div>
                <div className="full-span">
                  <label htmlFor="portalPassword">Password</label>
                  <input id="portalPassword" name="password" type="password" required />
                </div>
                <div className="full-span">
                  <button className="button primary icon-login" disabled={busy} type="submit">
                    {busy ? "Signing in..." : "Login"}
                  </button>
                  {message ? <p className="status-text">{message}</p> : null}
                </div>
              </form>

              <article className="card teacher-preview-card" id="teacher-portal">
                <div>
                  <span className="eyebrow">Teachers Portal</span>
                  <h2>Teacher tracking dashboard</h2>
                  <p className="lede">This portal will show every teacher’s class work and student progress in one place.</p>
                </div>
                <div className="mini-stat-grid">
                  <PortalSummary label="Attendance" value="Daily" tone="success" />
                  <PortalSummary label="Tests" value="Count" tone="default" />
                  <PortalSummary label="Activities" value="Tracked" tone="warning" />
                  <PortalSummary label="Performance" value="Charts" tone="success" />
                </div>
              </article>
            </>
          ) : (
            <>
              <div className="portal-head">
                <div>
                  <span className="eyebrow">Welcome Back</span>
                  <h1>{session.user.fullName}</h1>
                  <p className="lede">Role: {session.user.roles.join(", ")}</p>
                </div>
                <button className="button secondary icon-logout" onClick={logout} type="button">Logout</button>
              </div>

              <div className="metrics-row">
                <PortalSummary label="Attendance" value="94%" tone="success" />
                <PortalSummary label="Pending Fees" value="Rs 5,000" tone="warning" />
                <PortalSummary label="Homework" value="4 Open Tasks" tone="default" />
              </div>
              <div className="button-row portal-action-row">
                <a className="button secondary icon-gallery" href="/student-media">Search Student Photos & Videos</a>
              </div>

              <div className="portal-grid">
                <article className="card">
                  <h3>Growth Chart</h3>
                  <div className="chart-shell">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={demoGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="percentage" stroke="#0b3954" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>
                <article className="card">
                  <h3>Portal Modules</h3>
                  <ul className="plain-list">
                    {session.user.modules.map((module) => (
                      <li key={module}>{module}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </>
          )}
        </div>
      </section>
    </Shell>
  );
}
