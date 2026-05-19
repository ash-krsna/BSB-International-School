import { useState } from "react";
import Shell from "../components/Shell";
import { apiRequest } from "../lib/api";
import { contactInfo } from "../content/schoolData";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const data = await apiRequest("/public/enquiries", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setMessage(data.message);
      form.reset();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <section className="page-section">
        <div className="container two-column">
          <div>
            <span className="eyebrow">Contact</span>
            <h1>Speak with the school office</h1>
            <p className="lede">
              Send your message here and it will be saved in the ERP system while also reaching the school office email.
            </p>
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
          <form className="card form-grid" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" required />
            </div>
            <div>
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" required />
            </div>
            <div className="full-span">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" />
            </div>
            <div className="full-span">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows="5" required />
            </div>
            <div className="full-span">
              <button className="button primary" disabled={busy} type="submit">
                {busy ? "Sending..." : "Send Enquiry"}
              </button>
              {message ? <p className="status-text">{message}</p> : null}
            </div>
          </form>
        </div>
      </section>
    </Shell>
  );
}
