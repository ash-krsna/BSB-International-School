export default function ResultsView() {
  return (
    <section className="desktop-view">
      <div className="view-header">
        <div>
          <p className="desktop-eyebrow">Result Management</p>
          <h1>Upload marks, publish results, and prepare marksheets</h1>
        </div>
        <button className="desktop-primary-button" type="button">Publish Result</button>
      </div>
      <article className="desktop-card">
        <h2>Bulk Mark Entry</h2>
        <div className="desktop-form-grid">
          <input placeholder="Exam title" />
          <input placeholder="Class" />
          <input placeholder="Subject" />
          <button className="desktop-primary-button" type="button">Import Excel</button>
        </div>
      </article>
    </section>
  );
}
