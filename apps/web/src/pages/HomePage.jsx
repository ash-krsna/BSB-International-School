import Shell from "../components/Shell";
import {
  campusMoments,
  featureCards,
  learningPillars,
  principalMessage,
  quickHighlights,
  schoolStats,
  showcaseItems
} from "../content/schoolData";

export default function HomePage() {
  const heroGallery = showcaseItems.filter((item) => item.type === "image").slice(0, 6);

  return (
    <Shell>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">BSB International School</span>
            <h1>Growing curious minds with discipline, care, and joyful learning.</h1>
            <p className="lede">
              BSB International School is a growing primary school that adds one classroom and one higher standard each year.
              The school blends values, modern teaching, and a warm environment where children can learn with confidence.
            </p>
            <div className="button-row">
              <a href="/admissions" className="button primary">Apply for Admission</a>
              <a href="/results" className="button secondary">Check Results</a>
            </div>
            <div className="hero-points">
              <span>Principal-led guidance</span>
              <span>Photo-rich school updates</span>
              <span>Parent and student portal</span>
            </div>
            <div className="stat-strip" aria-label="School highlights">
              {schoolStats.map((stat) => (
                <article key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
          <div className="hero-panel school-scene">
            <div className="scene-badge">Creating The Leaders</div>
            <img className="scene-logo" src="/showcase/logo-transparent.png" alt="BSB International School logo" />
            <img className="scene-campus" src={campusMoments[0].src} alt={campusMoments[0].title} />
            <div className="scene-card">
              <strong>Admissions Open</strong>
              <p>Online applications, parent details, and document upload in one simple flow.</p>
            </div>
            <div className="scene-card offset">
              <strong>Safe, Growing Campus</strong>
              <p>Step-by-step school development with a strong focus on learning foundations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Why Families Choose BSB</span>
            <h2>Everything important is easy for parents to understand.</h2>
          </div>
          <div className="feature-grid">
            {featureCards.map((card) => (
              <article className="card playful-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section learning-band">
        <div className="container learning-grid">
          <div>
            <span className="eyebrow">Learning Approach</span>
            <h2>Small-school attention with a clear growth path.</h2>
            <p className="lede">
              BSB is being built carefully, one higher standard at a time, so academic routines, student care, and school
              systems can grow together without losing personal attention.
            </p>
          </div>
          <div className="pillar-list">
            {learningPillars.map((pillar) => (
              <article className="pillar-item" key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container principal-grid">
          <article className="card principal-card">
            <span className="eyebrow">Principal's Message</span>
            <h2>Building a school where every child feels seen, guided, and encouraged.</h2>
            <p className="lede">{principalMessage.trim()}</p>
          </article>
          <article className="card portrait-card">
            <img src="/showcase/1758431049617.jpg.jpeg" alt="Principal Santosh Bankar" />
            <div>
              <h3>Santosh Bankar</h3>
              <p>Principal</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">School Highlights</span>
            <h2>Simple things parents want to know at a glance.</h2>
          </div>
          <div className="feature-grid">
            {quickHighlights.map((item) => (
              <article className="card feature-note" key={item}>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Real School Moments</span>
            <h2>Actual photos from campus and student life.</h2>
          </div>
          <div className="campus-grid">
            {campusMoments.map((item) => (
              <article className="card campus-card" key={item.src}>
                <img src={item.src} alt={item.title} />
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section showcase-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Campus Showcase</span>
            <h2>Moments from the school community.</h2>
          </div>
        </div>
        <div className="showcase-marquee">
          <div className="showcase-track">
            {[...heroGallery, ...heroGallery].map((item, index) => (
              <article className="showcase-slide" key={`${item.id}-${index}`}>
                <img src={item.src} alt={item.title} />
                <div className="showcase-copy">
                  <span className="chip">{item.category}</span>
                  <h3>{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
