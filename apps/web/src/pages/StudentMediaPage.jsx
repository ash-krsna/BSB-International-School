import { useState } from "react";
import Shell from "../components/Shell";
import { API_BASE_URL } from "../lib/api";
import { useAuth } from "../state/AuthContext";

const staffRoles = ["super_admin", "admin_staff", "principal", "teacher"];

export default function StudentMediaPage() {
  const { session } = useAuth();
  const [studentId, setStudentId] = useState("");
  const [mediaBundle, setMediaBundle] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const isStaff = session?.user?.roles?.some((role) => staffRoles.includes(role));

  async function authorizedFetch(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${session.token}`,
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (!session) {
      setMessage("Please login through the portal before searching student media.");
      return;
    }

    setBusy(true);
    setMessage("");
    setMediaBundle(null);

    try {
      const data = await authorizedFetch(`/student-media/search?studentId=${encodeURIComponent(studentId.trim())}`);
      setMediaBundle(data.data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!session || !isStaff) {
      setUploadMessage("Only authorized school staff can upload and tag student media.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setUploadMessage("Uploading media...");

    try {
      const data = await authorizedFetch("/student-media", {
        method: "POST",
        body: formData
      });
      setUploadMessage(data.message);
      event.currentTarget.reset();
    } catch (error) {
      setUploadMessage(error.message);
    }
  }

  return (
    <Shell>
      <section className="page-section student-media-page">
        <div className="container two-column">
          <div>
            <span className="eyebrow">Student Media</span>
            <h1>Find student photos and videos by Student ID.</h1>
            <p className="lede">
              Staff can tag uploaded media with Student IDs. Parents, students, and teachers can then search the ID to see
              the linked school memories.
            </p>
            <form className="card form-grid" onSubmit={handleSearch}>
              <div className="full-span">
                <label htmlFor="studentMediaSearch">Student ID</label>
                <input
                  id="studentMediaSearch"
                  name="studentId"
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder="Example: BSB-2026-0001"
                  required
                  value={studentId}
                />
              </div>
              <div className="full-span">
                <button className="button primary icon-gallery" disabled={busy} type="submit">
                  {busy ? "Searching..." : "Search Media"}
                </button>
                {message ? <p className="status-text">{message}</p> : null}
              </div>
            </form>
          </div>

          {isStaff ? (
            <form className="card form-grid student-media-upload" onSubmit={handleUpload}>
              <span className="eyebrow full-span">Staff Upload</span>
              <div className="full-span">
                <label htmlFor="studentIds">Student IDs</label>
                <input id="studentIds" name="studentIds" placeholder="BSB-2026-0001, BSB-2026-0002" required />
              </div>
              <div>
                <label htmlFor="mediaTitle">Title</label>
                <input id="mediaTitle" name="title" placeholder="Annual function dance" />
              </div>
              <div>
                <label htmlFor="mediaCategory">Category</label>
                <input id="mediaCategory" name="category" placeholder="Annual Function" />
              </div>
              <div className="full-span">
                <label htmlFor="mediaFiles">Images / Videos</label>
                <input id="mediaFiles" name="media" type="file" accept="image/*,video/*" multiple required />
              </div>
              <div className="full-span">
                <label htmlFor="mediaDescription">Description</label>
                <textarea id="mediaDescription" name="description" rows="3" />
              </div>
              <div className="full-span">
                <button className="button secondary icon-admission" type="submit">Upload & Tag Media</button>
                {uploadMessage ? <p className="status-text">{uploadMessage}</p> : null}
              </div>
            </form>
          ) : (
            <article className="card student-media-note">
              <h3>How sorting works</h3>
              <p>
                The school tags each image or video with Student IDs during upload. This keeps student media organized
                without automatic face recognition.
              </p>
            </article>
          )}
        </div>
      </section>

      {mediaBundle ? (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">{mediaBundle.student.studentId}</span>
              <h2>{mediaBundle.student.fullName}</h2>
              <p className="lede">{mediaBundle.media.length} linked media items found.</p>
            </div>
            <div className="gallery-grid-web event-gallery-grid">
              {mediaBundle.media.length ? (
                mediaBundle.media.map((item) => (
                  <article className="card media-card" key={item.id}>
                    {item.mediaType === "video" ? (
                      <video controls preload="metadata" src={item.fileUrl} />
                    ) : (
                      <img src={item.fileUrl} alt={item.title} />
                    )}
                    <div>
                      <span className="chip">{item.category}</span>
                      <h3>{item.title}</h3>
                      {item.description ? <p>{item.description}</p> : null}
                    </div>
                  </article>
                ))
              ) : (
                <p className="empty-copy">No photos or videos have been linked to this Student ID yet.</p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </Shell>
  );
}
