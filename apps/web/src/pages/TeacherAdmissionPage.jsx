import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../state/AuthContext";
import { API_BASE_URL, apiRequest } from "../lib/api";

const teacherRoles = ["teacher"];

export default function TeacherAdmissionPage() {
  const { session, login, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [admissions, setAdmissions] = useState([]);
  const [registerMessage, setRegisterMessage] = useState("");
  const [officialMessage, setOfficialMessage] = useState("");
  const [officialBusy, setOfficialBusy] = useState(false);
  const [officialFeeDraft, setOfficialFeeDraft] = useState({ totalFee: "", paidFee: "" });

  const isTeacher = useMemo(
    () => session?.user?.roles?.some((role) => teacherRoles.includes(role)),
    [session]
  );
  const hasOtherRole = Boolean(session && !isTeacher);

  async function loadAdmissions() {
    if (!session?.token || !isTeacher) {
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
    loadAdmissions();
  }, [isTeacher, session?.token]);

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

    if (API_BASE_URL === "/api") {
      setMessage("Backend API is not connected yet. Ask the admin to set VITE_API_BASE_URL on Vercel to the deployed backend API URL before using admissions.");
      setBusy(false);
      return;
    }

    const form = new FormData(event.currentTarget);

    try {
      const nextSession = await login({
        identifier: form.get("identifier"),
        password: form.get("password")
      });

      const allowed = nextSession.user.roles.some((role) => teacherRoles.includes(role));
      if (!allowed) {
        logout();
        throw new Error("This page is only for teachers assigned to admission work.");
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
    setOfficialMessage("Saving admission and preparing parent confirmation...");

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
      setOfficialMessage(`Admission saved. Student ID: ${result.studentId}. Parent confirmation message queued.`);
      await loadAdmissions();
    } catch (error) {
      setOfficialMessage(error.message);
    } finally {
      setOfficialBusy(false);
    }
  }

  return (
    <Shell>
      <section className="page-section teacher-admission-page">
        <div className="container narrow">
          {!session ? (
            <>
              <span className="eyebrow">Teacher Admission Desk</span>
              <h1>Teacher admission portal</h1>
              <p className="lede">
                Teachers assigned to admission work can fill confirmed student admissions here. This is separate from the admin dashboard.
              </p>
              {API_BASE_URL === "/api" ? (
                <div className="card tone-warning teacher-route-note">
                  <h3>Backend connection required</h3>
                  <p>
                    This admission desk must be connected to the deployed backend API so student data saves in MySQL and photos/documents save in Cloudinary.
                    Set `VITE_API_BASE_URL` on Vercel to the backend URL before using this for real admissions.
                  </p>
                </div>
              ) : null}
              <form className="card form-grid teacher-login-card" onSubmit={handleSubmit}>
                <div className="full-span">
                  <label htmlFor="teacherIdentifier">Teacher Username</label>
                  <input id="teacherIdentifier" name="identifier" placeholder="Sarika_" required />
                </div>
                <div className="full-span">
                  <label htmlFor="teacherPassword">Password</label>
                  <input id="teacherPassword" name="password" type="password" required />
                </div>
                <div className="full-span">
                  <button className="button primary icon-login" disabled={busy} type="submit">
                    {busy ? "Checking teacher access..." : "Enter Admission Desk"}
                  </button>
                  {message ? <p className="status-text error-text">{message}</p> : null}
                </div>
              </form>
            </>
          ) : hasOtherRole ? (
            <article className="card">
              <span className="eyebrow">Teacher Only</span>
              <h1>Use the correct portal</h1>
              <p className="lede">This page is only for teacher admission work. Admins can use the admin portal to access every admission detail.</p>
              <button className="button secondary icon-logout" onClick={logout} type="button">Logout</button>
            </article>
          ) : (
            <>
              <div className="portal-head">
                <div>
                  <span className="eyebrow">Teacher Verified</span>
                  <h1>{session.user.fullName}</h1>
                  <p className="lede">Fill admissions carefully. Parent confirmation will be queued after saving.</p>
                </div>
                <button className="button secondary icon-logout" onClick={logout} type="button">Logout</button>
              </div>

              <article className="card admission-register-card official-admission-card" id="teacher-admission-form">
                <div className="portal-head compact-head">
                  <div>
                    <span className="eyebrow">Official Admission</span>
                    <h3>Teacher Admission Form</h3>
                    <p className="status-text">Use this for confirmed admissions only. Data saves to the school database and Excel register.</p>
                  </div>
                  <button className="button secondary icon-result" onClick={downloadAdmissionRegister} type="button">Excel</button>
                </div>
                <div className="official-admission-strip">
                  <span>Student ID generated</span>
                  <span>Database saved</span>
                  <span>Parent message queued</span>
                </div>
                <form className="form-grid staff-admission-form" encType="multipart/form-data" onSubmit={handleOfficialAdmissionSubmit}>
                  <div className="full-span staff-form-section">
                    <span>Student Identity</span>
                    <small>Basic student details used for ID card, result login, and class records.</small>
                  </div>
                  <div>
                    <label htmlFor="teacherApplyingClass">Applying Class</label>
                    <select id="teacherApplyingClass" name="applyingClassName" defaultValue="Class 1">
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
                    <label htmlFor="teacherStudentFirstName">First Name</label>
                    <input id="teacherStudentFirstName" name="studentFirstName" required />
                  </div>
                  <div>
                    <label htmlFor="teacherStudentMiddleName">Middle Name</label>
                    <input id="teacherStudentMiddleName" name="studentMiddleName" />
                  </div>
                  <div>
                    <label htmlFor="teacherStudentLastName">Last Name</label>
                    <input id="teacherStudentLastName" name="studentLastName" required />
                  </div>
                  <div>
                    <label htmlFor="teacherStudentGender">Gender</label>
                    <select id="teacherStudentGender" name="studentGender" defaultValue="male">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="teacherStudentDob">Date of Birth</label>
                    <input id="teacherStudentDob" name="studentDob" type="date" required />
                  </div>
                  <div>
                    <label htmlFor="teacherAadhaarNo">Aadhaar Number</label>
                    <input id="teacherAadhaarNo" inputMode="numeric" name="aadhaarNo" />
                  </div>
                  <div className="full-span staff-form-section">
                    <span>Parent & Contact</span>
                    <small>Mother's name will be used later for student result verification.</small>
                  </div>
                  <div>
                    <label htmlFor="teacherMotherName">Mother's Name</label>
                    <input id="teacherMotherName" name="motherName" required />
                  </div>
                  <div>
                    <label htmlFor="teacherParentName">Parent / Guardian Name</label>
                    <input id="teacherParentName" name="parentName" required />
                  </div>
                  <div>
                    <label htmlFor="teacherParentPhone">Parent Mobile Number</label>
                    <input id="teacherParentPhone" name="parentPhone" required />
                  </div>
                  <div>
                    <label htmlFor="teacherParentEmail">Email</label>
                    <input id="teacherParentEmail" name="parentEmail" type="email" />
                  </div>
                  <div className="full-span">
                    <label htmlFor="teacherAddress">Address</label>
                    <textarea id="teacherAddress" name="address" rows="3" />
                  </div>
                  <div className="full-span staff-form-section">
                    <span>School & Transport</span>
                    <small>Previous school, scholarship, and bus service details for office follow-up.</small>
                  </div>
                  <div>
                    <label htmlFor="teacherPreviousSchool">Previous School</label>
                    <input id="teacherPreviousSchool" name="previousSchool" />
                  </div>
                  <div>
                    <label htmlFor="teacherScholarshipDetails">Scholarship Details</label>
                    <input id="teacherScholarshipDetails" name="scholarshipDetails" />
                  </div>
                  <div>
                    <label htmlFor="teacherBusService">School Bus Service</label>
                    <select id="teacherBusService" name="wantsBusService" defaultValue="false">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="teacherPickupAddress">Pickup Address</label>
                    <input id="teacherPickupAddress" name="pickupAddress" />
                  </div>
                  <div className="full-span staff-form-section">
                    <span>Fees</span>
                    <small>Record the amount decided at admission and the amount received today.</small>
                  </div>
                  <div>
                    <label htmlFor="teacherTotalFee">Total Fee</label>
                    <input
                      id="teacherTotalFee"
                      inputMode="decimal"
                      name="totalFee"
                      onChange={(event) => setOfficialFeeDraft((current) => ({ ...current, totalFee: event.target.value }))}
                      value={officialFeeDraft.totalFee}
                    />
                  </div>
                  <div>
                    <label htmlFor="teacherPaidFee">Paid Fee</label>
                    <input
                      id="teacherPaidFee"
                      inputMode="decimal"
                      name="paidFee"
                      onChange={(event) => setOfficialFeeDraft((current) => ({ ...current, paidFee: event.target.value }))}
                      value={officialFeeDraft.paidFee}
                    />
                  </div>
                  <div>
                    <label htmlFor="teacherRemainingFee">Remaining Fee</label>
                    <input id="teacherRemainingFee" readOnly value={Math.max((Number(officialFeeDraft.totalFee) || 0) - (Number(officialFeeDraft.paidFee) || 0), 0)} />
                  </div>
                  <div>
                    <label htmlFor="teacherFeeNotes">Fee Notes</label>
                    <input id="teacherFeeNotes" name="feeNotes" placeholder="Receipt, discount, installment note" />
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
                    <label htmlFor="teacherPhoto">Student Photo</label>
                    <div className="file-choice-grid">
                      <label className="file-choice" htmlFor="teacherPhoto">
                        Choose from device
                        <input id="teacherPhoto" type="file" name="photo" accept="image/*" />
                      </label>
                      <label className="file-choice" htmlFor="teacherPhotoCamera">
                        Click from camera
                        <input id="teacherPhotoCamera" type="file" name="photoCamera" accept="image/*" capture="environment" />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="teacherDocuments">Documents</label>
                    <input className="staff-file-input" id="teacherDocuments" name="documents" type="file" multiple />
                  </div>
                  <div className="full-span official-submit-row">
                    <button className="button primary icon-admission" disabled={officialBusy} type="submit">
                      {officialBusy ? "Saving..." : "Save Admission"}
                    </button>
                    {officialMessage ? <p className={`status-text ${officialMessage.includes("saved") || officialMessage.includes("queued") ? "" : "error-text"}`}>{officialMessage}</p> : null}
                  </div>
                </form>
              </article>

              <article className="card admission-register-card">
                <div className="portal-head compact-head">
                  <div>
                    <h3>Recent Admissions</h3>
                    <p className="status-text">Admissions saved by the school are visible here for checking and Excel export.</p>
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
