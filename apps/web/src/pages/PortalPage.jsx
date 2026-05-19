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
              <span className="eyebrow">Parent / Student Login</span>
              <h1>Secure portal access</h1>
              <p className="lede">Parents and students can sign in to view school updates, summaries, and connected modules.</p>
              <form className="card form-grid" onSubmit={handleLogin}>
                <div className="full-span">
                  <label htmlFor="portalIdentifier">Email / Phone / Username</label>
                  <input id="portalIdentifier" name="identifier" required />
                </div>
                <div className="full-span">
                  <label htmlFor="portalPassword">Password</label>
                  <input id="portalPassword" name="password" type="password" required />
                </div>
                <div className="full-span">
                  <button className="button primary" disabled={busy} type="submit">
                    {busy ? "Signing in..." : "Login"}
                  </button>
                  {message ? <p className="status-text">{message}</p> : null}
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="portal-head">
                <div>
                  <span className="eyebrow">Welcome Back</span>
                  <h1>{session.user.fullName}</h1>
                  <p className="lede">Role: {session.user.roles.join(", ")}</p>
                </div>
                <button className="button secondary" onClick={logout} type="button">Logout</button>
              </div>

              <div className="metrics-row">
                <PortalSummary label="Attendance" value="94%" tone="success" />
                <PortalSummary label="Pending Fees" value="Rs 5,000" tone="warning" />
                <PortalSummary label="Homework" value="4 Open Tasks" tone="default" />
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
