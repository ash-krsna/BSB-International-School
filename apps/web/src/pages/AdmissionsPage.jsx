import { useState } from "react";
import Shell from "../components/Shell";
import { admissionsSteps } from "../content/schoolData";

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/akash.gita.bhagwat@gmail.com";

async function readFormSubmitResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  throw new Error(
    text.includes("Unable to submit")
      ? "FormSubmit could not send this admission. Please confirm the activation email from FormSubmit."
      : "Unable to submit admission right now. Please try again."
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
    formData.append("_subject", "New admission application - BSB International School");
    formData.append("_template", "table");
    formData.append("_captcha", "false");

    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json"
        },
        body: formData
      });
      const data = await readFormSubmitResponse(response);
      if (!response.ok) {
        throw new Error(data.message || "Unable to submit admission.");
      }
      setMessage("Admission submitted successfully. The details have been sent to the school email.");
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
          <form className="card form-grid" encType="multipart/form-data" onSubmit={handleSubmit}>
            <input type="hidden" name="School" value="BSB International School" />
            <div>
              <label htmlFor="applyingClassId">Applying Class</label>
              <select id="applyingClassId" name="Applying Class" defaultValue="Class 1">
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
              <label htmlFor="parentName">Parent Name</label>
              <input id="parentName" name="Parent Name" required />
            </div>
            <div>
              <label htmlFor="parentPhone">Parent Phone</label>
              <input id="parentPhone" name="Parent Phone" required />
            </div>
            <div>
              <label htmlFor="parentEmail">Parent Email</label>
              <input id="parentEmail" type="email" name="Parent Email" />
            </div>
            <div className="full-span">
              <label htmlFor="address">Address</label>
              <textarea id="address" name="Address" rows="4" />
            </div>
            <div>
              <label htmlFor="photo">Student Photo</label>
              <input id="photo" type="file" name="Student Photo" accept="image/*" />
            </div>
            <div>
              <label htmlFor="documents">Documents</label>
              <input id="documents" type="file" name="Documents" multiple />
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
