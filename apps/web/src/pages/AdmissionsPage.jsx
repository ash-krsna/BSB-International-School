import { useState } from "react";
import Shell from "../components/Shell";
import { admissionsSteps } from "../content/schoolData";

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/akash.gita.bhagwat@gmail.com";
const FORMSUBMIT_NEXT = "https://bsb-international-school.vercel.app/admissions?submitted=1";
const CLASS_SORT_MARKS = {
  "Class 1": "1",
  "Class 2": "2",
  "Class 3": "3",
  "Class 4": "4",
  "Class 5": "5"
};

export default function AdmissionsPage() {
  const submitted = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("submitted") === "1";
  const [applyingClass, setApplyingClass] = useState("Class 1");
  const today = new Date().toLocaleDateString("en-IN");

  function handlePrint() {
    window.print();
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
          <form action={FORMSUBMIT_ENDPOINT} className="card form-grid printable-admission-form" encType="multipart/form-data" method="POST">
            <input type="hidden" name="School" value="BSB International School" />
            <input type="hidden" name="_subject" value="New admission application - BSB International School" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value={FORMSUBMIT_NEXT} />
            <div className="print-form-head full-span">
              <img src="/showcase/logo-transparent.png" alt="BSB International School logo" />
              <div>
                <h2>BSB International School</h2>
                <p>Admission Application Form</p>
                <small>Application Date: {today}</small>
              </div>
              <div className="print-head-tools">
                <span className="class-sort-badge" aria-label={`Admission form class marker for ${applyingClass}`}>
                  <strong>{CLASS_SORT_MARKS[applyingClass]}</strong>
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
                name="Applying Class"
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
              <input id="studentFirstName" name="Student First Name" required />
            </div>
            <div>
              <label htmlFor="studentLastName">Student Last Name</label>
              <input id="studentLastName" name="Student Last Name" required />
            </div>
            <div>
              <label htmlFor="studentGender">Gender</label>
              <select id="studentGender" name="Gender" defaultValue="Male">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="studentDob">Date of Birth</label>
              <input id="studentDob" type="date" name="Date of Birth" required />
            </div>
            <div>
              <label htmlFor="aadhaarNo">Aadhaar Number</label>
              <input id="aadhaarNo" name="Aadhaar Number" inputMode="numeric" />
            </div>
            <div className="form-section-title full-span">
              <span>Parent & Contact Details</span>
            </div>
            <div>
              <label htmlFor="parentName">Parent Name</label>
              <input id="parentName" name="Parent Name" required />
            </div>
            <div>
              <label htmlFor="parentPhone">Parent Phone</label>
              <input id="parentPhone" name="Parent Phone" required />
            </div>
            <div>
              <label htmlFor="parentEmail">Parent Email</label>
              <input id="parentEmail" type="email" name="email" />
            </div>
            <div className="full-span">
              <label htmlFor="address">Address</label>
              <textarea id="address" name="Address" rows="4" />
            </div>
            <div className="form-section-title full-span">
              <span>School & Transport Details</span>
            </div>
            <div>
              <label htmlFor="previousSchool">Previous School</label>
              <input id="previousSchool" name="Previous School" />
            </div>
            <div>
              <label htmlFor="scholarshipDetails">Scholarship Details</label>
              <input id="scholarshipDetails" name="Scholarship Details" />
            </div>
            <div>
              <label htmlFor="busService">School Bus Service</label>
              <select id="busService" name="School Bus Service" defaultValue="No">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label htmlFor="pickupAddress">Pickup Address</label>
              <input id="pickupAddress" name="Pickup Address" />
            </div>
            <div className="form-section-title full-span">
              <span>Documents & Signatures</span>
            </div>
            <div className="print-file-field">
              <label htmlFor="photo">Student Photo</label>
              <div className="file-choice-grid">
                <label className="file-choice" htmlFor="photo">
                  <span>Upload from device</span>
                  <input id="photo" type="file" name="Student Photo Upload" accept="image/*" />
                </label>
                <label className="file-choice" htmlFor="photoCamera">
                  <span>Click photo from camera</span>
                  <input id="photoCamera" type="file" name="Student Photo Camera" accept="image/*" capture="environment" />
                </label>
              </div>
              <span className="print-file-line">Photo received</span>
            </div>
            <div className="print-file-field">
              <label htmlFor="documents">Documents</label>
              <div className="file-choice-grid">
                <label className="file-choice" htmlFor="documents">
                  <span>Upload from device</span>
                  <input id="documents" type="file" name="Documents Upload" multiple />
                </label>
                <label className="file-choice" htmlFor="documentCamera">
                  <span>Click photo from camera</span>
                  <input id="documentCamera" type="file" name="Document Camera Photo" accept="image/*" capture="environment" />
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
                <button className="button primary" type="submit">Submit Admission</button>
                <button className="button secondary" onClick={handlePrint} type="button">Print Admission Form</button>
              </div>
              {submitted ? (
                <p className="status-text">Admission submitted successfully. Please check the school email inbox.</p>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    </Shell>
  );
}
