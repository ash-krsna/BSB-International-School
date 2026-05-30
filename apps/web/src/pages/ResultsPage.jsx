import { useState } from "react";
import Shell from "../components/Shell";
import { apiRequest } from "../lib/api";

export default function ResultsPage() {
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    const rollNo = formData.get("rollNo");
    const dob = formData.get("dob");

    try {
      const response = await apiRequest(`/public/results?rollNo=${encodeURIComponent(rollNo)}&dob=${encodeURIComponent(dob)}`);
      setResult(response.data);
      setMessage("");
    } catch (error) {
      setResult(null);
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <section className="page-section">
        <div className="container narrow">
          <span className="eyebrow">Result Portal</span>
          <h1>Public result lookup</h1>
          <p className="lede">Enter the student roll number and date of birth to view the latest published result.</p>
          <form className="card form-grid" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="rollNo">Roll Number</label>
              <input id="rollNo" name="rollNo" required />
            </div>
            <div>
              <label htmlFor="dob">Date of Birth</label>
              <input id="dob" name="dob" type="date" required />
            </div>
            <div className="full-span">
              <button className="button primary icon-result" disabled={busy} type="submit">
                {busy ? "Checking..." : "Check Result"}
              </button>
            </div>
          </form>
          {message ? <p className="status-text">{message}</p> : null}
          {result ? (
            <article className="card result-card">
              <h3>{result.studentName}</h3>
              <p>Class: {result.className}</p>
              {result.latestResult ? (
                <div className="mini-stat-grid">
                  <article>
                    <strong>Exam</strong>
                    <p>{result.latestResult.examName}</p>
                  </article>
                  <article>
                    <strong>Academic Year</strong>
                    <p>{result.latestResult.academicYear}</p>
                  </article>
                  <article>
                    <strong>Average Marks</strong>
                    <p>{result.latestResult.averageMarks}</p>
                  </article>
                  <article>
                    <strong>Average Percentage</strong>
                    <p>{result.latestResult.averagePercentage}%</p>
                  </article>
                </div>
              ) : (
                <p>No result published yet.</p>
              )}
            </article>
          ) : null}
        </div>
      </section>
    </Shell>
  );
}
