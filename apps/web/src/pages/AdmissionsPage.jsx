import { useState } from "react";
import Shell from "../components/Shell";
import { admissionsSteps } from "../content/schoolData";
import { API_BASE_URL } from "../lib/api";

async function readAdmissionResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  throw new Error(
    text.includes("NOT_FOUND") || text.includes("The page")
      ? "Admission API is not connected. Set VITE_API_BASE_URL to your deployed backend URL, then redeploy."
      : "Admission API returned an invalid response. Please check the backend deployment."
  );
}

export default function AdmissionsPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(`${API_BASE_URL}/public/admissions`, {
        method: "POST",
        body: formData
      });
      const data = await readAdmissionResponse(response);
      if (!response.ok) {
        throw new Error(data.message || "Unable to submit admission.");
      }
      setMessage(`Admission submitted successfully. Application ID: ${data.admissionId}`);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
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
          <form className="card form-grid" onSubmit={handleSubmit}>
            <input type="hidden" name="academicYearId" value="1" />
            <div>
              <label htmlFor="applyingClassId">Applying Class</label>
              <select id="applyingClassId" name="applyingClassId" defaultValue="4">
                <option value="4">Class 1</option>
                <option value="5">Class 2</option>
                <option value="6">Class 3</option>
                <option value="7">Class 4</option>
                <option value="8">Class 5</option>
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
            <div>
              <label htmlFor="photo">Student Photo</label>
              <input id="photo" type="file" name="photo" accept="image/*" />
            </div>
            <div>
              <label htmlFor="documents">Documents</label>
              <input id="documents" type="file" name="documents" multiple />
            </div>
            <div className="full-span">
              <button className="button primary" disabled={busy} type="submit">
                {busy ? "Submitting..." : "Submit Admission"}
              </button>
              {message ? <p className="status-text">{message}</p> : null}
            </div>
          </form>
        </div>
      </section>
    </Shell>
  );
}
