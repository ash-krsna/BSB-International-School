import Shell from "../components/Shell";
import { campusMoments, leadership, staffMembers } from "../content/schoolData";

export default function AboutPage() {
  return (
    <Shell>
      <section className="page-section">
        <div className="container two-column">
          <div>
            <span className="eyebrow">About School</span>
            <h1>BSB International School</h1>
            <p className="lede">
              A growing primary school focused on quality education, discipline, student confidence, and modern learning methods.
            </p>
            <div className="stack-grid">
              {leadership.map((member) => (
                <article className="card" key={member.role}>
                  <h3>{member.role}</h3>
                  <p><strong>{member.name}</strong></p>
                  <p>{member.note}</p>
                </article>
              ))}
            </div>
          </div>
          <aside className="card emphasis-card">
            <h3>School Direction</h3>
            <p>
              The school is growing one level at a time, with careful attention to classroom quality, routine, and child
              development. The website, parent portal, and office dashboard are designed to support that growth in a simple way.
            </p>
            <img className="emphasis-photo" src={campusMoments[0].src} alt={campusMoments[0].title} />
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">School Staff</span>
            <h2>Meet the teaching and leadership team.</h2>
          </div>
          <div className="feature-grid">
            {staffMembers.map((member) => (
              <article className={`card staff-card${member.role === "Principal" || member.role === "Vice Principal" ? " staff-card-lead" : ""}`} key={member.name}>
                {member.image ? (
                  <img className="staff-photo" src={member.image} alt={member.name} />
                ) : (
                  <div className="staff-avatar" aria-hidden="true">
                    {member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                  </div>
                )}
                <span className="chip">{member.role}</span>
                <h3>{member.name}</h3>
                <p>
                  {member.role === "Principal"
                    ? "Leading the school with focus on discipline, growth, and student care."
                    : member.role === "Vice Principal"
                      ? "Supporting school operations, academic routines, and student progress."
                      : "Helping children learn through guidance, classroom engagement, and steady encouragement."}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Campus Visuals</span>
            <h2>Real school photographs used across the public website.</h2>
          </div>
          <div className="campus-grid">
            {campusMoments.map((item) => (
              <article className="card campus-card" key={item.title}>
                <img src={item.src} alt={item.title} />
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
