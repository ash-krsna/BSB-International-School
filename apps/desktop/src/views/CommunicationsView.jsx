import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

export default function CommunicationsView({ token }) {
  const [campaigns, setCampaigns] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/communications/campaigns", { token })
      .then((data) => {
        if (active) {
          setCampaigns(data.data || []);
        }
      })
      .catch(() => {
        if (active) {
          setCampaigns([]);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await apiRequest("/communications/broadcast", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: formData.get("title"),
          messageBody: formData.get("messageBody"),
          targetType: formData.get("targetType"),
          classId: formData.get("classId") || null,
          sendSms: true,
          sendWhatsApp: formData.get("sendWhatsApp") === "on",
          sendEmail: formData.get("sendEmail") === "on"
        })
      });

      setMessage(`${response.message} (${response.data.recipients} recipients)`);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="desktop-view">
      <div className="view-header">
        <div>
          <p className="desktop-eyebrow">Messages And Notices</p>
          <h1>Send parent alerts from the cloud backend</h1>
        </div>
      </div>

      <div className="desktop-grid">
        <article className="desktop-card">
          <h2>Broadcast Message</h2>
          <form className="desktop-form-grid" onSubmit={handleSubmit}>
            <input name="title" placeholder="Campaign title" required />
            <select defaultValue="all" name="targetType">
              <option value="all">All Parents</option>
              <option value="class">Class-wise</option>
            </select>
            <input name="classId" placeholder="Class ID (for class-wise)" />
            <input name="messageBody" placeholder="Message body" required />
            <label className="desktop-check"><input name="sendWhatsApp" type="checkbox" /> Send WhatsApp</label>
            <label className="desktop-check"><input name="sendEmail" type="checkbox" /> Send Email</label>
            <button className="desktop-primary-button" type="submit">Send Campaign</button>
            {message ? <p className="desktop-copy">{message}</p> : null}
          </form>
        </article>

        <article className="desktop-card">
          <div className="card-head">
            <h2>Recent Campaigns</h2>
            <span>{campaigns.length} items</span>
          </div>
          <div className="desktop-list">
            {campaigns.map((campaign) => (
              <div className="desktop-list-item static" key={campaign.id}>
                <div>
                  <strong>{campaign.title}</strong>
                  <span>{campaign.targetType} • {campaign.deliveryAttempts} deliveries</span>
                </div>
                <small>{campaign.createdBy || "System"}</small>
              </div>
            ))}
            {!campaigns.length ? <p className="desktop-copy">No campaigns sent yet.</p> : null}
          </div>
        </article>
      </div>
    </section>
  );
}
