import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";
import { apiRequest } from "../lib/api";

export default function DashboardView({ token }) {
  const [summary, setSummary] = useState({
    activeStudents: 0,
    todayCollection: 0,
    pendingFees: 0,
    openAdmissions: 0
  });
  const [analytics, setAnalytics] = useState({
    weeklyCollections: [],
    classStrength: []
  });

  useEffect(() => {
    let active = true;

    Promise.all([
      apiRequest("/dashboard/summary", { token }),
      apiRequest("/dashboard/analytics", { token })
    ])
      .then(([summaryData, analyticsData]) => {
        if (!active) {
          return;
        }
        setSummary(summaryData.summary);
        setAnalytics(analyticsData.data);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setSummary({
          activeStudents: 0,
          todayCollection: 0,
          pendingFees: 0,
          openAdmissions: 0
        });
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="desktop-view">
      <div className="view-header">
        <div>
          <p className="desktop-eyebrow">School Office Dashboard</p>
          <h1>Cloud-first ERP overview for the office team</h1>
        </div>
        <button className="desktop-primary-button" type="button">Quick Fee Entry</button>
      </div>

      <div className="desktop-metrics">
        <article className="desktop-card metric">
          <p>Active Students</p>
          <h3>{summary.activeStudents}</h3>
        </article>
        <article className="desktop-card metric">
          <p>Today's Collection</p>
          <h3>Rs {Number(summary.todayCollection || 0).toLocaleString()}</h3>
        </article>
        <article className="desktop-card metric">
          <p>Pending Fees</p>
          <h3>Rs {Number(summary.pendingFees || 0).toLocaleString()}</h3>
        </article>
        <article className="desktop-card metric">
          <p>Admissions in Review</p>
          <h3>{summary.openAdmissions}</h3>
        </article>
      </div>

      <div className="desktop-grid">
        <article className="desktop-card">
          <div className="card-head">
            <h2>Weekly Collections</h2>
            <span>Live analytics</span>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics.weeklyCollections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line dataKey="amount" stroke="#31d0a7" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="desktop-card">
          <div className="card-head">
            <h2>Class Strength</h2>
            <span>Current active students</span>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics.classStrength}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="className" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalStudents" fill="#146291" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}
