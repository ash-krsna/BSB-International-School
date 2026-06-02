import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../state/AuthContext";
import { API_BASE_URL, apiRequest } from "../lib/api";

const staffRoles = ["super_admin", "admin_staff", "principal", "teacher", "accountant"];

export default function StaffEntryPage() {
  const { session, login, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [admissions, setAdmissions] = useState([]);
  const [registerMessage, setRegisterMessage] = useState("");

  const isStaff = useMemo(
    () => session?.user?.roles?.some((role) => staffRoles.includes(role)),
    [session]
  );

  useEffect(() => {
    if (!isStaff || !session?.token) {
      return;
    }

    let ignore = false;
    async function loadAdmissions() {
      try {
        const data = await apiRequest("/admissions", {
          headers: {
            Authorization: `Bearer ${session.token}`
          }
        });
        if (!ignore) {
          setAdmissions(data.data || []);
        }
      } catch (error) {
        if (!ignore) {
          setRegisterMessage(error.message);
        }
      }
    }

    loadAdmissions();
    return () => {
      ignore = true;
    };
  }, [isStaff, session?.token]);

  async function downloadAdmissionRegister() {
    setRegisterMessage("");
    try {
      const response = await fetch(`${API_BASE_URL}/admissions/export`, {
        headers: {
          Authorization: `Bearer ${session.token}`
        }
      });

      if (!response.ok) {
        throw new Error("Could not download admission register.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bsb-admission-register.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setRegisterMessage(error.message);
    }
  }

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
                  <h3>Admission Entry</h3>
                  <p>Open the admission form, capture photo/documents, save the student in the online register, then print the office form.</p>
                  <a className="button primary icon-admission" href="/admissions">Open Admission Form</a>
                </article>
                <article className="card">
                  <h3>Admission Register</h3>
                  <p>Download the latest Excel sheet with student ID, class, documents, contact details, and fees.</p>
                  <button className="button secondary icon-result" onClick={downloadAdmissionRegister} type="button">Download Excel</button>
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
                  <h3>Student Media Sorting</h3>
                  <p>Upload photos or videos and tag them by Student ID so parents and teachers can search media quickly.</p>
                  <a className="button secondary icon-gallery" href="/student-media">Open Student Media</a>
                </article>
              </div>
              <article className="card admission-register-card">
                <div className="portal-head compact-head">
                  <div>
                    <h3>Live Admission Register</h3>
                    <p className="status-text">Newest admission entries saved in the online database.</p>
                  </div>
                  <button className="button secondary icon-result" onClick={downloadAdmissionRegister} type="button">Excel</button>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Mother</th>
                        <th>Contact</th>
                        <th>Documents</th>
                        <th>Total Fee</th>
                        <th>Paid</th>
                        <th>Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admissions.map((item) => (
                        <tr key={item.id}>
                          <td>{item.assignedStudentId || item.admissionCode}</td>
                          <td>{item.studentFullName}</td>
                          <td>{item.className}</td>
                          <td>{item.motherName || "-"}</td>
                          <td>{item.parentPhone}</td>
                          <td>{item.documents || "Pending"}</td>
                          <td>{item.totalFee || 0}</td>
                          <td>{item.paidFee || 0}</td>
                          <td>{item.remainingFee || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!admissions.length ? <p className="status-text">No admissions saved yet.</p> : null}
                {registerMessage ? <p className="status-text error-text">{registerMessage}</p> : null}
              </article>
            </>
          )}
        </div>
      </section>
    </Shell>
  );
}
