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
  const [officialMessage, setOfficialMessage] = useState("");
  const [officialBusy, setOfficialBusy] = useState(false);
  const [officialFeeDraft, setOfficialFeeDraft] = useState({ totalFee: "", paidFee: "" });

  const isStaff = useMemo(
    () => session?.user?.roles?.some((role) => staffRoles.includes(role)),
    [session]
  );

  async function loadAdmissions() {
    if (!session?.token) {
      return;
    }

    try {
      const data = await apiRequest("/admissions", {
        headers: {
          Authorization: `Bearer ${session.token}`
        }
      });
      setAdmissions(data.data || []);
    } catch (error) {
      setRegisterMessage(error.message);
    }
  }

  useEffect(() => {
    if (!isStaff || !session?.token) {
      return;
    }
    loadAdmissions();
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
      link.download = "bsb-combined-student-admission-register.xlsx";
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

  async function handleOfficialAdmissionSubmit(event) {
    event.preventDefault();
    setOfficialBusy(true);
    setOfficialMessage("Saving official admission...");

    try {
      const formData = new FormData(event.currentTarget);
      const usingVercelFallback = API_BASE_URL === "/api";
      const result = await apiRequest("/admissions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          ...(usingVercelFallback ? { "Content-Type": "application/json" } : {})
        },
        body: usingVercelFallback ? JSON.stringify(Object.fromEntries(formData.entries())) : formData
      });

      event.currentTarget.reset();
      setOfficialFeeDraft({ totalFee: "", paidFee: "" });
      setOfficialMessage(`Official admission saved. Student ID: ${result.studentId}`);
      await loadAdmissions();
    } catch (error) {
      setOfficialMessage(error.message);
    } finally {
      setOfficialBusy(false);
    }
  }

  return (
    <Shell>
      <section className="page-section staff-access-page">
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
                  <h3>Admin Portal</h3>
                  <p>Access the full school office command area for admissions, fees, student records, documents, reports, and future connected modules.</p>
                  <a className="button primary icon-admission" href="/admin">Open Admin Portal</a>
                </article>
                <article className="card" id="teacher-staff-portal">
                  <h3>Teachers Portal</h3>
                  <p>Prepare attendance, performance tracking, tests conducted, classroom activities, homework, and teacher remarks from one staff area.</p>
                  <a className="button secondary icon-growth" href="/portal#teacher-portal">Open Teachers Portal</a>
                </article>
                <article className="card">
                  <h3>Student Portal</h3>
                  <p>Open the student and parent portal for future result lookup, attendance, fees, homework, notices, and media access.</p>
                  <a className="button secondary icon-login" href="/portal#student-login">Open Student Portal</a>
                </article>
                <article className="card">
                  <h3>Admission Enquiry Desk</h3>
                  <p>Open the enquiry form, capture parent/student details, and keep the lead ready for follow-up confirmation.</p>
                  <a className="button primary icon-admission" href="/admissions">Open Enquiry Form</a>
                </article>
                <article className="card">
                  <h3>Combined Student Register</h3>
                  <p>Download one office Excel sheet with student details, contact, fees, photo status, and document given/missing status.</p>
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
              <article className="card admission-register-card official-admission-card">
                <div className="portal-head compact-head">
                  <div>
                    <span className="eyebrow">Official Admission</span>
                    <h3>Staff Admission Form</h3>
                    <p className="status-text">Use this after the parent confirms admission. This creates the assigned Student ID.</p>
                  </div>
                </div>
                <div className="official-admission-strip">
                  <span>Verified parent call</span>
                  <span>Student ID generated</span>
                  <span>Fee register updated</span>
                </div>
                <form className="form-grid staff-admission-form" encType="multipart/form-data" onSubmit={handleOfficialAdmissionSubmit}>
                  <div className="full-span staff-form-section">
                    <span>Student Identity</span>
                    <small>Basic student details used for ID card, result login, and class records.</small>
                  </div>
                  <div>
                    <label htmlFor="staffApplyingClass">Applying Class</label>
                    <select id="staffApplyingClass" name="applyingClassName" defaultValue="Class 1">
                      <option value="Nursery">Nursery</option>
                      <option value="Junior KG">Junior KG</option>
                      <option value="Senior KG">Senior KG</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="staffStudentFirstName">First Name</label>
                    <input id="staffStudentFirstName" name="studentFirstName" required />
                  </div>
                  <div>
                    <label htmlFor="staffStudentMiddleName">Middle Name</label>
                    <input id="staffStudentMiddleName" name="studentMiddleName" />
                  </div>
                  <div>
                    <label htmlFor="staffStudentLastName">Last Name</label>
                    <input id="staffStudentLastName" name="studentLastName" required />
                  </div>
                  <div>
                    <label htmlFor="staffStudentGender">Gender</label>
                    <select id="staffStudentGender" name="studentGender" defaultValue="male">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="staffStudentDob">Date of Birth</label>
                    <input id="staffStudentDob" name="studentDob" type="date" required />
                  </div>
                  <div>
                    <label htmlFor="staffAadhaarNo">Aadhaar Number</label>
                    <input id="staffAadhaarNo" inputMode="numeric" name="aadhaarNo" />
                  </div>
                  <div className="full-span staff-form-section">
                    <span>Parent & Contact</span>
                    <small>Mother's name will be used later for student result verification.</small>
                  </div>
                  <div>
                    <label htmlFor="staffMotherName">Mother's Name</label>
                    <input id="staffMotherName" name="motherName" required />
                  </div>
                  <div>
                    <label htmlFor="staffParentName">Parent / Guardian Name</label>
                    <input id="staffParentName" name="parentName" required />
                  </div>
                  <div>
                    <label htmlFor="staffParentPhone">Contact Number</label>
                    <input id="staffParentPhone" name="parentPhone" required />
                  </div>
                  <div>
                    <label htmlFor="staffParentEmail">Email</label>
                    <input id="staffParentEmail" name="parentEmail" type="email" />
                  </div>
                  <div className="full-span">
                    <label htmlFor="staffAddress">Address</label>
                    <textarea id="staffAddress" name="address" rows="3" />
                  </div>
                  <div className="full-span staff-form-section">
                    <span>School & Transport</span>
                    <small>Previous school, scholarship, and bus service details for office follow-up.</small>
                  </div>
                  <div>
                    <label htmlFor="staffPreviousSchool">Previous School</label>
                    <input id="staffPreviousSchool" name="previousSchool" />
                  </div>
                  <div>
                    <label htmlFor="staffScholarshipDetails">Scholarship Details</label>
                    <input id="staffScholarshipDetails" name="scholarshipDetails" />
                  </div>
                  <div>
                    <label htmlFor="staffBusService">School Bus Service</label>
                    <select id="staffBusService" name="wantsBusService" defaultValue="false">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="staffPickupAddress">Pickup Address</label>
                    <input id="staffPickupAddress" name="pickupAddress" />
                  </div>
                  <div className="full-span staff-form-section">
                    <span>Fees</span>
                    <small>Record the amount decided at admission and the amount received today.</small>
                  </div>
                  <div>
                    <label htmlFor="staffTotalFee">Total Fee</label>
                    <input
                      id="staffTotalFee"
                      inputMode="decimal"
                      name="totalFee"
                      onChange={(event) => setOfficialFeeDraft((current) => ({ ...current, totalFee: event.target.value }))}
                      value={officialFeeDraft.totalFee}
                    />
                  </div>
                  <div>
                    <label htmlFor="staffPaidFee">Paid Fee</label>
                    <input
                      id="staffPaidFee"
                      inputMode="decimal"
                      name="paidFee"
                      onChange={(event) => setOfficialFeeDraft((current) => ({ ...current, paidFee: event.target.value }))}
                      value={officialFeeDraft.paidFee}
                    />
                  </div>
                  <div>
                    <label htmlFor="staffRemainingFee">Remaining Fee</label>
                    <input id="staffRemainingFee" readOnly value={Math.max((Number(officialFeeDraft.totalFee) || 0) - (Number(officialFeeDraft.paidFee) || 0), 0)} />
                  </div>
                  <div>
                    <label htmlFor="staffFeeNotes">Fee Notes</label>
                    <input id="staffFeeNotes" name="feeNotes" placeholder="Receipt, discount, installment note" />
                  </div>
                  <div className="full-span fee-summary-strip">
                    <span>Total: Rs {Number(officialFeeDraft.totalFee) || 0}</span>
                    <span>Paid: Rs {Number(officialFeeDraft.paidFee) || 0}</span>
                    <strong>Remaining: Rs {Math.max((Number(officialFeeDraft.totalFee) || 0) - (Number(officialFeeDraft.paidFee) || 0), 0)}</strong>
                  </div>
                  <div className="full-span staff-form-section">
                    <span>Photo & Documents</span>
                    <small>Attach student photo and available documents before saving the official admission.</small>
                  </div>
                  <div>
                    <label htmlFor="staffPhoto">Student Photo</label>
                    <input className="staff-file-input" id="staffPhoto" name="photo" type="file" accept="image/*" />
                  </div>
                  <div>
                    <label htmlFor="staffDocuments">Documents</label>
                    <input className="staff-file-input" id="staffDocuments" name="documents" type="file" multiple />
                  </div>
                  <div className="full-span official-submit-row">
                    <button className="button primary icon-admission" disabled={officialBusy} type="submit">
                      {officialBusy ? "Saving..." : "Save Official Admission"}
                    </button>
                    {officialMessage ? <p className={`status-text ${officialMessage.includes("saved") ? "" : "error-text"}`}>{officialMessage}</p> : null}
                  </div>
                </form>
              </article>
              <article className="card admission-register-card">
                <div className="portal-head compact-head">
                  <div>
                    <h3>Live Admission Enquiry Register</h3>
                    <p className="status-text">Newest enquiry entries saved in the online database for office follow-up.</p>
                  </div>
                  <button className="button secondary icon-result" onClick={downloadAdmissionRegister} type="button">Excel</button>
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Enquiry ID</th>
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
