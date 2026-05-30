import { useMemo, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../state/AuthContext";

const staffRoles = ["super_admin", "admin_staff", "principal", "teacher", "accountant"];

export default function StaffEntryPage() {
  const { session, login, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const isStaff = useMemo(
    () => session?.user?.roles?.some((role) => staffRoles.includes(role)),
    [session]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const form = new FormData(event.currentTarget);

    try {
      const nextSession = await login({
        identifier: form.get("identifier"),
        password: form.get("password")
      });

      const allowed = nextSession.user.roles.some((role) => staffRoles.includes(role));
      if (!allowed) {
        logout();
        throw new Error("This hidden login is only for authorized school staff roles.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <section className="page-section">
        <div className="container narrow">
          {!isStaff ? (
            <>
              <span className="eyebrow">Staff Access</span>
              <h1>Hidden campus access for school staff</h1>
              <p className="lede">
                This page is intentionally not shown in the public menu. Only staff who know the direct link and have valid
                school credentials can sign in here.
              </p>
              <form className="card form-grid" onSubmit={handleSubmit}>
                <div className="full-span">
                  <label htmlFor="staffIdentifier">Staff Email / Phone / Username</label>
                  <input id="staffIdentifier" name="identifier" required />
                </div>
                <div className="full-span">
                  <label htmlFor="staffPassword">Password</label>
                  <input id="staffPassword" name="password" type="password" required />
                </div>
                <div className="full-span">
                  <button className="button primary icon-login" disabled={busy} type="submit">
                    {busy ? "Checking access..." : "Enter Staff Area"}
                  </button>
                  {message ? <p className="status-text">{message}</p> : null}
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="portal-head">
                <div>
                  <span className="eyebrow">Staff Verified</span>
                  <h1>{session.user.fullName}</h1>
                  <p className="lede">Roles: {session.user.roles.join(", ")}</p>
                </div>
                <button className="button secondary icon-logout" onClick={logout} type="button">Logout</button>
              </div>
              <div className="feature-grid">
                <article className="card">
                  <h3>Hidden Login Route</h3>
                  <p>
                    This staff entry remains outside the public menu. Share the direct URL only with principal, office staff,
                    accountants, and teachers who need access.
                  </p>
                </article>
                <article className="card">
                  <h3>Allowed Modules</h3>
                  <ul className="plain-list">
                    {session.user.modules.map((module) => (
                      <li key={module}>{module}</li>
                    ))}
                  </ul>
                </article>
                <article className="card">
                  <h3>How Admin Works</h3>
                  <p>
                    The main operational admin work is designed for the connected office ERP software. This hidden page acts as
                    the secure staff web entry, while the desktop software handles day-to-day records, fees, results, and reports.
                  </p>
                </article>
              </div>
            </>
          )}
        </div>
      </section>
    </Shell>
  );
}
