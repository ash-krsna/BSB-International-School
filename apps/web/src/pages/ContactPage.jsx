import Shell from "../components/Shell";
import { contactInfo } from "../content/schoolData";

const CONTACT_ENDPOINT = "https://formsubmit.co/akash.gita.bhagwat@gmail.com";
const CONTACT_NEXT = "https://bsb-international-school.vercel.app/contact?submitted=1";

export default function ContactPage() {
  const submitted = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("submitted") === "1";

  return (
    <Shell>
      <section className="page-section">
        <div className="container two-column">
          <div>
            <span className="eyebrow">Contact</span>
            <h1>Speak with the school office</h1>
            <p className="lede">Send your message here and it will reach the school office inbox.</p>
            <div className="stack-grid">
              <article className="card">
                <h3>Message Routing</h3>
                <p>{contactInfo.replyNote}</p>
              </article>
              <article className="card">
                <h3>Office Hours</h3>
                <p>{contactInfo.officeHours}</p>
              </article>
            </div>
          </div>
          <form action={CONTACT_ENDPOINT} className="card form-grid" method="POST">
            <input type="hidden" name="_subject" value="New website enquiry - BSB International School" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value={CONTACT_NEXT} />
            <input type="hidden" name="School" value="BSB International School" />
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" name="Name" required />
            </div>
            <div>
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="Phone" required />
            </div>
            <div className="full-span">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" />
            </div>
            <div className="full-span">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="Message" rows="5" required />
            </div>
            <div className="full-span">
              <button className="button primary" type="submit">Send Enquiry</button>
              {submitted ? <p className="status-text">Message sent successfully. The school office will review it.</p> : null}
            </div>
          </form>
        </div>
      </section>
    </Shell>
  );
}
