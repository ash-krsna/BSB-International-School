import { Suspense, lazy, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import { apiRequest, getStoredSession, storeSession } from "./lib/api";

const staffRoles = ["super_admin", "admin_staff", "principal", "teacher", "accountant", "driver"];
const DashboardView = lazy(() => import("./views/DashboardView"));
const StudentsView = lazy(() => import("./views/StudentsView"));
const FeesView = lazy(() => import("./views/FeesView"));
const AttendanceView = lazy(() => import("./views/AttendanceView"));
const ResultsView = lazy(() => import("./views/ResultsView"));
const ReportsView = lazy(() => import("./views/ReportsView"));
const SettingsView = lazy(() => import("./views/SettingsView"));
const CommunicationsView = lazy(() => import("./views/CommunicationsView"));
const TransportView = lazy(() => import("./views/TransportView"));

export default function App() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [theme, setTheme] = useState("dark");
  const [session, setSession] = useState(() => getStoredSession());
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const visibleModules = useMemo(() => {
    const allowed = new Set(["dashboard", "settings"]);
    session?.user?.modules?.forEach((module) => {
      if (module === "communications") {
        allowed.add("communications");
      }
      if (module === "admissions") {
        allowed.add("admissions");
      }
      if (module === "students") {
        allowed.add("students");
      }
      if (module === "fees") {
        allowed.add("fees");
      }
      if (module === "transport") {
        allowed.add("transport");
      }
      if (module === "attendance") {
        allowed.add("attendance");
      }
      if (module === "results") {
        allowed.add("results");
      }
      if (module === "reports") {
        allowed.add("reports");
      }
    });
    return [...allowed];
  }, [session]);

  async function handleLogin(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");
    const formData = new FormData(event.currentTarget);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: formData.get("identifier"),
          password: formData.get("password")
        })
      });

      if (!data.user.roles.some((role) => staffRoles.includes(role))) {
        throw new Error("This desktop ERP is for authorized school staff only.");
      }

      const nextSession = { token: data.token, user: data.user };
      setSession(nextSession);
      storeSession(nextSession);
      event.currentTarget.reset();
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  function handleLogout() {
    setSession(null);
    storeSession(null);
  }

  const CurrentView = useMemo(() => {
    switch (activeModule) {
      case "students":
      case "admissions":
        return <StudentsView token={session?.token} mode={activeModule} />;
      case "fees":
        return <FeesView token={session?.token} />;
      case "transport":
        return <TransportView token={session?.token} />;
      case "attendance":
        return <AttendanceView token={session?.token} />;
      case "results":
        return <ResultsView token={session?.token} />;
      case "communications":
        return <CommunicationsView token={session?.token} />;
      case "reports":
        return <ReportsView token={session?.token} />;
      case "settings":
        return <SettingsView theme={theme} onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} />;
      default:
        return <DashboardView token={session?.token} />;
    }
  }, [activeModule, session, theme]);

  if (!session) {
    return (
      <div className={`desktop-app desktop-auth-shell theme-${theme}`}>
        <section className="desktop-auth-card">
          <div className="desktop-brand desktop-brand-large">
            <span className="desktop-brand-mark">
              <img src="/showcase/logo.jpeg" alt="BSB logo" />
            </span>
            <div>
              <strong>BSB International School ERP</strong>
              <small>Cloud-connected office software</small>
            </div>
          </div>
          <p className="desktop-copy">
            Lightweight school desktop software for admin staff, principal, teachers, and accountant roles.
          </p>
          <form className="desktop-auth-form" onSubmit={handleLogin}>
            <input name="identifier" placeholder="Email / Phone / Username" required />
            <input name="password" placeholder="Password" required type="password" />
            <button className="desktop-primary-button" disabled={authBusy} type="submit">
              {authBusy ? "Signing in..." : "Login to ERP"}
            </button>
            <button className="desktop-secondary-button" onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} type="button">
              Switch to {theme === "dark" ? "Light" : "Dark"} Mode
            </button>
            {authMessage ? <p className="desktop-error">{authMessage}</p> : null}
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className={`desktop-app theme-${theme}`}>
      <Sidebar
        activeModule={activeModule}
        onChange={setActiveModule}
        visibleModules={visibleModules}
        session={session}
        onLogout={handleLogout}
      />
      <div className="desktop-main">
        <Suspense fallback={<div className="desktop-copy">Loading module...</div>}>
          {CurrentView}
        </Suspense>
      </div>
    </div>
  );
}
