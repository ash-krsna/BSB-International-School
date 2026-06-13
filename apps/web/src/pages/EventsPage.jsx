import Shell from "../components/Shell";
import { achievements, showcaseItems, upcomingEvents } from "../content/schoolData";

export default function EventsPage() {
  const eventMedia = showcaseItems
    .filter((item) => ["Annual Function", "Celebrations", "Campus Life"].includes(item.category))
    .slice(0, 8);

  return (
    <Shell>
      <section className="page-section events-hero">
        <div className="container two-column">
          <div>
            <span className="eyebrow">Events</span>
            <h1>School functions, celebrations, and learning activities in one place.</h1>
            <p className="lede">
              Parents can follow upcoming school programs and revisit real moments from annual functions, classroom
              activities, and campus celebrations.
            </p>
            <div className="button-row">
              <a className="button primary icon-gallery" href="/gallery">Open Gallery</a>
              <a className="button secondary icon-play" href="/learn">Learning Zone</a>
            </div>
          </div>
          <div className="event-stack-card">
            {upcomingEvents.map((event, index) => (
              <article className="card event-mini-card" key={event.title}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <div>
                  <span className="chip">{event.type}</span>
                  <h3>{event.title}</h3>
                  <p>{event.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Upcoming Events</span>
            <h2>What families should watch for.</h2>
          </div>
          <div className="timeline-grid">
            {upcomingEvents.map((event) => (
              <article className="card timeline-card" key={event.title}>
                <span>{event.date}</span>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section showcase-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Event Memories</span>
            <h2>Real school moments from BSB.</h2>
          </div>
          <div className="event-preview-grid">
            {eventMedia.map((item) => (
              <article className="card media-card" key={item.id}>
                {item.type === "video" ? <video controls preload="metadata" src={item.src} /> : <img src={item.src} alt={item.title} />}
                <span className="chip">{item.category}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Achievements</span>
            <h2>Progress the school community can see.</h2>
          </div>
          <div className="feature-grid">
            {achievements.map((achievement) => (
              <article className="card playful-card" key={achievement.title}>
                <h3>{achievement.title}</h3>
                <p>{achievement.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
