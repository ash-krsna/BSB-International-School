import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

export default function StudentsView({ token, mode = "students" }) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let active = true;
    const endpoint = mode === "admissions" ? "/admissions" : `/students?search=${encodeURIComponent(search)}`;

    apiRequest(endpoint, { token })
      .then((data) => {
        if (!active) {
          return;
        }
        const list = data.data || [];
        setStudents(list);
        if (mode === "students" && list[0] && !selectedId) {
          setSelectedId(list[0].id);
        }
      })
      .catch(() => {
        if (active) {
          setStudents([]);
        }
      });

    return () => {
      active = false;
    };
  }, [mode, search, selectedId, token]);

  useEffect(() => {
    if (mode !== "students" || !selectedId) {
      return;
    }

    let active = true;
    apiRequest(`/students/${selectedId}/dashboard`, { token })
      .then((data) => {
        if (active) {
          setProfile(data.data);
        }
      })
      .catch(() => {
        if (active) {
          setProfile(null);
        }
      });

    return () => {
      active = false;
    };
  }, [mode, selectedId, token]);

  if (mode === "admissions") {
    return (
      <section className="desktop-view">
        <div className="view-header">
          <div>
            <p className="desktop-eyebrow">Admission Queue</p>
            <h1>Online applications waiting for office review</h1>
          </div>
        </div>

        <article className="desktop-card">
          <div className="desktop-list">
            {students.map((item) => (
              <button className="desktop-list-item" key={item.id} type="button">
                <div>
                  <strong>{item.studentFirstName} {item.studentLastName}</strong>
                  <span>{item.parentName}</span>
                </div>
                <small>{item.status}</small>
              </button>
            ))}
            {!students.length ? <p className="desktop-copy">No admissions found.</p> : null}
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="desktop-view">
      <div className="view-header">
        <div>
          <p className="desktop-eyebrow">Student Management</p>
          <h1>Profiles, timeline, fees, and growth record</h1>
        </div>
        <button className="desktop-primary-button" type="button">Add Student</button>
      </div>

      <div className="desktop-card search-card">
        <input
          className="desktop-search"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by student ID, name, roll number, Aadhaar, or parent phone..."
          value={search}
        />
      </div>

      <div className="desktop-grid">
        <article className="desktop-card">
          <div className="card-head">
            <h2>Students</h2>
            <span>{students.length} records</span>
          </div>
          <div className="desktop-list">
            {students.map((student) => (
              <button
                className={`desktop-list-item${selectedId === student.id ? " active" : ""}`}
                key={student.id}
                onClick={() => setSelectedId(student.id)}
                type="button"
              >
                <div>
                  <strong>{student.fullName}</strong>
                  <span>{student.studentId} • {student.className || "-"} • Roll {student.rollNo}</span>
                </div>
                <small>{student.status}</small>
              </button>
            ))}
            {!students.length ? <p className="desktop-copy">No students matched the current filters.</p> : null}
          </div>
        </article>

        <article className="desktop-card">
          <div className="card-head">
            <h2>Student Dashboard</h2>
            <span>{profile?.profile?.studentId || "Select a student"}</span>
          </div>
          {profile ? (
            <div className="desktop-profile-stack">
              <div className="desktop-data-list">
                <div><span>Class</span><strong>{profile.profile.className || "-"}</strong></div>
                <div><span>Attendance</span><strong>{profile.attendance.attendancePercentage}%</strong></div>
                <div><span>Fee Pending</span><strong>Rs {Number(profile.fees.pendingAmount || 0).toLocaleString()}</strong></div>
                <div><span>Latest Result</span><strong>{profile.latestResult?.averagePercentage ?? "-"}%</strong></div>
              </div>

              <div>
                <h3>Recent Timeline</h3>
                <div className="desktop-table">
                  {profile.timeline.slice(0, 6).map((item, index) => (
                    <div key={`${item.title}-${index}`}>
                      <span>{item.title}</span>
                      <strong>{item.description}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3>Achievements</h3>
                <div className="desktop-tag-row">
                  {profile.achievements.length
                    ? profile.achievements.map((item) => <span className="desktop-tag" key={item.id}>{item.title}</span>)
                    : <p className="desktop-copy">No achievements added yet.</p>}
                </div>
              </div>
            </div>
          ) : (
            <p className="desktop-copy">Select a student to open the full profile dashboard.</p>
          )}
        </article>
      </div>
    </section>
  );
}
