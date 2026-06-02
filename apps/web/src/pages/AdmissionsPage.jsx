import { useState } from "react";
import Shell from "../components/Shell";
import { admissionsSteps } from "../content/schoolData";
import { apiRequest } from "../lib/api";

const CLASS_BADGE_MARKS = {
  "Class 1": "1",
  "Class 2": "2",
  "Class 3": "3",
  "Class 4": "4",
  "Class 5": "5"
};

export default function AdmissionsPage() {
  const [applyingClass, setApplyingClass] = useState("Class 1");
  const [submitState, setSubmitState] = useState({ status: "idle", message: "" });
  const today = new Date().toLocaleDateString("en-IN");

  function handlePrint() {
    window.print();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitState({ status: "loading", message: "Saving admission in school database..." });

    try {
      const formData = new FormData(event.currentTarget);
      const result = await apiRequest("/public/admissions", {
        method: "POST",
        body: formData
      });

      event.currentTarget.reset();
      setApplyingClass("Class 1");
      setSubmitState({
        status: "success",
        message: `Admission saved successfully. Application ID: ${result.admissionId}`
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error.message || "Admission could not be saved. Please try again."
      });
    }
  }

  return (
    <Shell>
      <section className="page-section">
        <div className="container two-column admission-layout">
          <div>
            <span className="eyebrow">Admissions Open</span>
            <h1>Online admission form</h1>
            <p className="lede">
              Parents can apply online, share student details, and upload available documents directly for office review.
            </p>
            <div className="card process-card">
              <h3>How admission works</h3>
              <ol className="step-list">
                {admissionsSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
          <form className="card form-grid printable-admission-form" encType="multipart/form-data" method="POST" onSubmit={handleSubmit}>
            <div className="print-form-head full-span">
              <img src="/showcase/logo-transparent.png" alt="BSB International School logo" />
              <div>
                <h2>BSB International School</h2>
                <p>Admission Application Form</p>
                <small>Application Date: {today}</small>
              </div>
              <div className="print-head-tools">
                <span className="class-admission-badge" aria-label={`Admission form class badge for ${applyingClass}`}>
                  <strong>{CLASS_BADGE_MARKS[applyingClass]}</strong>
                  <em>{applyingClass}</em>
                </span>
                <span className="photo-print-box">Student Photo</span>
              </div>
            </div>
            <div className="form-section-title full-span">
              <span>Student Details</span>
            </div>
            <div>
              <label htmlFor="applyingClassId">Applying Class</label>
              <select
                id="applyingClassId"
                name="applyingClassName"
                onChange={(event) => setApplyingClass(event.target.value)}
                value={applyingClass}
              >
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
              </select>
            </div>
            <div>
              <label htmlFor="studentFirstName">Student First Name</label>
              <input id="studentFirstName" name="studentFirstName" required />
            </div>
            <div>
              <label htmlFor="studentLastName">Student Last Name</label>
              <input id="studentLastName" name="studentLastName" required />
            </div>
            <div>
              <label htmlFor="studentGender">Gender</label>
              <select id="studentGender" name="studentGender" defaultValue="male">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="studentDob">Date of Birth</label>
              <input id="studentDob" type="date" name="studentDob" required />
            </div>
            <div>
              <label htmlFor="aadhaarNo">Aadhaar Number</label>
              <input id="aadhaarNo" name="aadhaarNo" inputMode="numeric" />
            </div>
            <div className="form-section-title full-span">
              <span>Parent & Contact Details</span>
            </div>
            <div>
              <label htmlFor="parentName">Parent Name</label>
              <input id="parentName" name="parentName" required />
            </div>
            <div>
              <label htmlFor="parentPhone">Parent Phone</label>
              <input id="parentPhone" name="parentPhone" required />
            </div>
            <div>
              <label htmlFor="parentEmail">Parent Email</label>
              <input id="parentEmail" type="email" name="parentEmail" />
            </div>
            <div className="full-span">
              <label htmlFor="address">Address</label>
              <textarea id="address" name="address" rows="4" />
            </div>
            <div className="form-section-title full-span">
              <span>School & Transport Details</span>
            </div>
            <div>
              <label htmlFor="previousSchool">Previous School</label>
              <input id="previousSchool" name="previousSchool" />
            </div>
            <div>
              <label htmlFor="scholarshipDetails">Scholarship Details</label>
              <input id="scholarshipDetails" name="scholarshipDetails" />
            </div>
            <div>
              <label htmlFor="busService">School Bus Service</label>
              <select id="busService" name="wantsBusService" defaultValue="false">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label htmlFor="pickupAddress">Pickup Address</label>
              <input id="pickupAddress" name="pickupAddress" />
            </div>
            <div className="form-section-title full-span">
              <span>Documents & Signatures</span>
            </div>
            <div className="print-file-field">
              <label htmlFor="photo">Student Photo</label>
              <div className="file-choice-grid">
                <label className="file-choice" htmlFor="photo">
                  <span>Upload from device</span>
                  <input id="photo" type="file" name="photo" accept="image/*" />
                </label>
                <label className="file-choice" htmlFor="photoCamera">
                  <span>Click photo from camera</span>
                  <input id="photoCamera" type="file" name="photoCamera" accept="image/*" capture="environment" />
                </label>
              </div>
              <span className="print-file-line">Photo received</span>
            </div>
            <div className="print-file-field">
              <label htmlFor="documents">Documents</label>
              <div className="file-choice-grid">
                <label className="file-choice" htmlFor="documents">
                  <span>Upload from device</span>
                  <input id="documents" type="file" name="documents" multiple />
                </label>
                <label className="file-choice" htmlFor="documentCamera">
                  <span>Click photo from camera</span>
                  <input id="documentCamera" type="file" name="documentCamera" accept="image/*" capture="environment" multiple />
                </label>
              </div>
              <span className="print-file-line">Documents received</span>
            </div>
            <div className="full-span print-signature-grid" aria-hidden="true">
              <span>Parent / Guardian Signature</span>
              <span>Admission Officer Signature</span>
              <span>Principal Signature</span>
            </div>
            <div className="full-span">
              <div className="button-row admission-actions">
                <button className="button primary" disabled={submitState.status === "loading"} type="submit">
                  {submitState.status === "loading" ? "Saving..." : "Submit Admission"}
                </button>
                <button className="button secondary" onClick={handlePrint} type="button">Print Admission Form</button>
              </div>
              {submitState.message ? (
                <p className={`status-text ${submitState.status === "error" ? "error-text" : ""}`}>{submitState.message}</p>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </Shell>
  );
}
