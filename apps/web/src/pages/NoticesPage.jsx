import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { apiRequest } from "../lib/api";

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    apiRequest("/public/notices").then((data) => setNotices(data.data)).catch(() => setNotices([]));
  }, []);

  return (
    <Shell>
      <section className="page-section">
        <div className="container">
          <span className="eyebrow">School Notices</span>
          <h1>Announcements and updates</h1>
          <div className="stack-grid">
            {notices.length
              ? notices.map((notice) => (
                  <article className="card" key={notice.id}>
                    <div className="notice-head">
                      <h3>{notice.title}</h3>
                      <span className="chip">{notice.audience}</span>
                    </div>
                    <p>{notice.body}</p>
                  </article>
                ))
              : <p className="empty-copy">No notices have been published yet.</p>}
          </div>
        </div>
      </section>
    </Shell>
  );
}
