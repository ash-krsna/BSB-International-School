import Shell from "../components/Shell";
import {
  activityCards,
  campusMoments,
  featureCards,
  learningPillars,
  principalMessage,
  quickHighlights,
  schoolStats,
  showcaseItems,
  websiteServices
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
              <a href="/learn" className="button secondary">Play & Learn</a>
            </div>
            <div className="hero-points">
              <span>Principal-led guidance</span>
              <span>Photo-rich school updates</span>
              <span>Website-first parent services</span>
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
          <div className="hero-panel school-scene media-stage">
            <div className="scene-badge">Creating The Leaders</div>
            <img className="scene-campus hero-campus" src={campusMoments[0].src} alt={campusMoments[0].title} />
            <div className="learning-stack" aria-hidden="true">
              <span className="stack-block block-a">ABC</span>
              <span className="stack-block block-b">123</span>
              <span className="stack-block block-c">A+</span>
            </div>
            <img className="scene-logo stage-logo" src="/showcase/logo-transparent.png" alt="BSB International School logo" />
            <div className="scene-card">
              <strong>Modern Learning</strong>
              <p>Bright activities, real school moments, and simple access for parents.</p>
            </div>
            <div className="scene-card offset">
              <strong>Admissions Open</strong>
              <p>Apply online, check results, view events, and message the school office.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section command-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Website Control Center</span>
            <h2>All important school work is now available from the website.</h2>
            <p className="lede">
              Until future channels are hosted later, the website works as the main digital desk for parents, students,
              staff, and the school office.
            </p>
          </div>
          <div className="service-grid">
            {websiteServices.map((service) => (
              <a className="service-card" href={service.path} key={service.title}>
                <span>{service.metric}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section future-band">
        <div className="container future-grid">
          <div>
            <span className="eyebrow">New Student Zone</span>
            <h2>Interactive learning, growth graphs, and a mini quiz in one bright space.</h2>
            <p className="lede">
              The new Play & Learn area gives children a friendly place to explore progress, answer quick questions, and
              see the school growing year by year.
            </p>
            <div className="button-row">
              <a href="/learn" className="button primary">Open Play & Learn</a>
              <a href="/gallery" className="button secondary">Watch Events</a>
            </div>
          </div>
          <div className="future-console" aria-hidden="true">
            <span className="screen-dot pink" />
            <span className="screen-dot yellow" />
            <span className="screen-dot green" />
            <div className="console-graph">
              <span />
              <span />
              <span />
              <span />
            </div>
            <strong>ABC + 123</strong>
            <p>Learning mode active</p>
          </div>
        </div>
      </section>

      <section className="section activity-section">
        <div className="container">
          <div className="section-heading centered-heading">
            <span className="eyebrow">Student Learning Zone</span>
            <h2>Play, explore, watch, and read with BSB.</h2>
          </div>
          <div className="activity-grid">
            {activityCards.map((activity) => (
              <a className={`activity-card ${activity.color}`} href={activity.mode === "Watch" ? "/gallery" : "/learn"} key={activity.title}>
                <span>{activity.mode}</span>
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
              </a>
            ))}
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
