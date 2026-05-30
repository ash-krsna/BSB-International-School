import Shell from "../components/Shell";

const FEEDBACK_ENDPOINT = "https://formsubmit.co/akash.gita.bhagwat@gmail.com";
const FEEDBACK_NEXT = "https://bsb-international-school.vercel.app/feedback?submitted=1";

export default function FeedbackPage() {
  const submitted = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("submitted") === "1";

  return (
    <Shell>
      <section className="page-section feedback-hero">
        <div className="container two-column">
          <div>
            <span className="eyebrow">Parent Voice</span>
            <h1>Share feedback with the school</h1>
            <p className="lede">
              Parents can share appreciation, suggestions, concerns, or ideas so the school office can respond with care.
            </p>
            <div className="card feedback-note">
              <h3>What you can send</h3>
              <p>Teaching feedback, event suggestions, safety notes, admission questions, gallery requests, or parent support needs.</p>
            </div>
          </div>
          <form action={FEEDBACK_ENDPOINT} className="card form-grid feedback-form" method="POST">
            <input type="hidden" name="_subject" value="New parent feedback - BSB International School" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value={FEEDBACK_NEXT} />
            <input type="hidden" name="School" value="BSB International School" />
            <div>
              <label htmlFor="feedbackName">Name</label>
              <input id="feedbackName" name="Name" required />
            </div>
            <div>
              <label htmlFor="feedbackPhone">Phone</label>
              <input id="feedbackPhone" name="Phone" required />
            </div>
            <div>
              <label htmlFor="feedbackEmail">Email</label>
              <input id="feedbackEmail" name="email" type="email" />
            </div>
            <div>
              <label htmlFor="feedbackType">Feedback Type</label>
              <select id="feedbackType" name="Feedback Type" defaultValue="Suggestion">
                <option>Suggestion</option>
                <option>Appreciation</option>
                <option>Concern</option>
                <option>Event / Function</option>
                <option>Admission</option>
              </select>
            </div>
            <div className="full-span">
              <label htmlFor="feedbackMessage">Message</label>
              <textarea id="feedbackMessage" name="Message" rows="6" required />
            </div>
            <div className="full-span">
              <button className="button primary icon-feedback" type="submit">Send Feedback</button>
              {submitted ? <p className="status-text">Feedback submitted successfully. Thank you for sharing it.</p> : null}
            </div>
          </form>
        </div>
      </section>
    </Shell>
  );
}
