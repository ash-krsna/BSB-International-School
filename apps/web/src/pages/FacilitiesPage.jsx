import Shell from "../components/Shell";
import { facilities, learningPillars } from "../content/schoolData";

export default function FacilitiesPage() {
  return (
    <Shell>
      <section className="page-section facilities-hero">
        <div className="container two-column">
          <div>
            <span className="eyebrow">Facilities</span>
            <h1>Simple, useful school spaces built around young learners.</h1>
            <p className="lede">
              BSB International School is growing carefully, so each facility supports real classroom needs: learning,
              discipline, parent communication, events, admissions, and future digital services.
            </p>
            <div className="button-row">
              <a className="button primary icon-admission" href="/admissions">Start Admission</a>
              <a className="button secondary icon-gallery" href="/gallery">View School Life</a>
            </div>
          </div>
          <div className="card facility-summary-card">
            <span className="eyebrow">Designed For</span>
            <h2>Primary school growth</h2>
            <p>
              Every part of the campus and website is being shaped to help teachers work faster, parents stay informed,
              and children learn with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Campus & Digital Facilities</span>
            <h2>Facilities that support daily school work.</h2>
          </div>
          <div className="facility-grid">
            {facilities.map((facility) => (
              <article className="card facility-card" key={facility.title}>
                <span className="chip">{facility.tag}</span>
                <h3>{facility.title}</h3>
                <p>{facility.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section learning-band">
        <div className="container learning-grid">
          <div>
            <span className="eyebrow">Learning Support</span>
            <h2>Facilities follow the school’s teaching approach.</h2>
            <p className="lede">
              The goal is not to show a long list of rooms. The goal is to make every facility useful for a child,
              teacher, parent, or school office workflow.
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
    </Shell>
  );
}
