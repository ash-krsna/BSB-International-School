import Shell from "../components/Shell";
import { admissionsSteps } from "../content/schoolData";

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/akash.gita.bhagwat@gmail.com";
const FORMSUBMIT_NEXT = "https://bsb-international-school.vercel.app/admissions?submitted=1";

export default function AdmissionsPage() {
  const submitted = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("submitted") === "1";

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
          <form action={FORMSUBMIT_ENDPOINT} className="card form-grid" encType="multipart/form-data" method="POST">
            <input type="hidden" name="School" value="BSB International School" />
            <input type="hidden" name="_subject" value="New admission application - BSB International School" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value={FORMSUBMIT_NEXT} />
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
              <input id="parentEmail" type="email" name="email" />
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
              <button className="button primary icon-admission" type="submit">Submit Admission</button>
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
