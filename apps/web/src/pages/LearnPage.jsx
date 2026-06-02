import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Shell from "../components/Shell";
import { activityCards, growthData, showcaseItems } from "../content/schoolData";
import { apiRequest } from "../lib/api";

const classOptions = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

export default function LearnPage() {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [studentName, setStudentName] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [scoreboard, setScoreboard] = useState([]);
  const [quizMessage, setQuizMessage] = useState("");
  const learningVideos = showcaseItems.filter((item) => item.type === "video").slice(0, 2);

  const score = quizQuestions.reduce(
    (total, question) => total + (selectedAnswers[question.id] === question.correctOption ? 1 : 0),
    0
  );

  useEffect(() => {
    let ignore = false;

    async function loadQuiz() {
      setQuizMessage("");
      setSelectedAnswers({});
      try {
        const [questions, scores] = await Promise.all([
          apiRequest(`/public/quiz/questions?className=${encodeURIComponent(selectedClass)}`),
          apiRequest(`/public/quiz/scoreboard?className=${encodeURIComponent(selectedClass)}`)
        ]);

        if (!ignore) {
          setQuizQuestions(questions.data || []);
          setScoreboard(scores.data || []);
        }
      } catch (error) {
        if (!ignore) {
          setQuizMessage(error.message);
        }
      }
    }

    loadQuiz();
    return () => {
      ignore = true;
    };
  }, [selectedClass]);

  async function submitScore() {
    if (!studentName.trim()) {
      setQuizMessage("Please enter student name before saving score.");
      return;
    }

    if (Object.keys(selectedAnswers).length < quizQuestions.length) {
      setQuizMessage("Please answer all quiz questions first.");
      return;
    }

    try {
      await apiRequest("/public/quiz/scores", {
        method: "POST",
        body: JSON.stringify({
          studentName,
          className: selectedClass,
          score,
          totalQuestions: quizQuestions.length
        })
      });
      const scores = await apiRequest(`/public/quiz/scoreboard?className=${encodeURIComponent(selectedClass)}`);
      setScoreboard(scores.data || []);
      setQuizMessage("Score saved. Check the scoreboard.");
    } catch (error) {
      setQuizMessage(error.message);
    }
  }

  return (
    <Shell>
      <section className="page-section play-hero">
        <div className="container play-grid">
          <div>
            <span className="eyebrow">Play & Learn</span>
            <h1>Learn, play, and watch progress grow.</h1>
            <p className="lede">
              A student-friendly corner with simple games, school growth graphs, result progress, and playful learning visuals.
            </p>
            <div className="button-row">
              <a className="button primary icon-play" href="#learning-game">Play Quiz</a>
              <a className="button secondary icon-growth" href="#growth-graphs">View Growth</a>
            </div>
          </div>
          <div className="learning-orbit" aria-hidden="true">
            <div className="orbit-card cube-one">ABC</div>
            <div className="orbit-card cube-two">123</div>
            <div className="orbit-card cube-three">A+</div>
            <div className="orbit-core">
              <img src="/showcase/logo-transparent.png" alt="" />
              <span>Learn</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section activity-section">
        <div className="container">
          <div className="section-heading centered-heading">
            <span className="eyebrow">Learning Modes</span>
            <h2>Choose a bright way to learn today.</h2>
          </div>
          <div className="activity-grid">
            {activityCards.map((activity) => (
              <article className={`activity-card ${activity.color}`} key={activity.title}>
                <span>{activity.mode}</span>
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {learningVideos.length > 0 ? (
        <section className="section watch-section">
          <div className="container watch-grid">
            <div>
              <span className="eyebrow">Watch</span>
              <h2>School events children can enjoy again.</h2>
              <p className="lede">
                Event videos help students remember celebrations, stage moments, and the joy of learning together.
              </p>
              <a className="button secondary icon-gallery" href="/gallery">Open Full Gallery</a>
            </div>
            <div className="video-strip">
              {learningVideos.map((video) => (
                <article className="video-card" key={video.id}>
                  <video controls preload="metadata" src={video.src} />
                  <h3>{video.title}</h3>
                  <p>{video.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section" id="growth-graphs">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Student Growth</span>
            <h2>School growth and result progress.</h2>
          </div>
          <div className="growth-grid">
            <article className="card chart-card">
              <h3>Students every year</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="students" stroke="#11786f" fill="#33a3d3" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </article>
            <article className="card chart-card">
              <h3>Result growth</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="result" stroke="#f05aa3" strokeWidth={4} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </article>
          </div>
        </div>
      </section>

      <section className="section game-section" id="learning-game">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Mini Game</span>
            <h2>Knowledge and good habits quiz.</h2>
          </div>
          <div className="card quiz-control-panel">
            <div>
              <label htmlFor="quizStudentName">Student Name</label>
              <input id="quizStudentName" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Enter student name" />
            </div>
            <div>
              <label htmlFor="quizClass">Class</label>
              <select id="quizClass" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
                {classOptions.map((className) => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="quiz-grid">
            {quizQuestions.map((question) => (
              <article className="card quiz-card" key={question.id}>
                <span className="quiz-category">{question.category}</span>
                <h3>{question.question}</h3>
                <div className="choice-grid">
                  {[
                    ["A", question.optionA],
                    ["B", question.optionB],
                    ["C", question.optionC],
                    ["D", question.optionD]
                  ].map(([optionKey, choice]) => (
                    <button
                      className={`choice-button${selectedAnswers[question.id] === optionKey ? " selected" : ""}${optionKey === question.correctOption && selectedAnswers[question.id] ? " correct-choice" : ""}`}
                      key={optionKey}
                      onClick={() => setSelectedAnswers((answers) => ({ ...answers, [question.id]: optionKey }))}
                      type="button"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <article className="card score-card">
            <h3>Score: {score} / {quizQuestions.length}</h3>
            <p>Good score puts the student name on the class scoreboard.</p>
            <button className="button primary icon-growth" onClick={submitScore} type="button">Save Score</button>
            {quizMessage ? <p className="status-text">{quizMessage}</p> : null}
          </article>
          <article className="card scoreboard-card">
            <h3>{selectedClass} Scoreboard</h3>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreboard.map((item, index) => (
                    <tr key={`${item.studentName}-${item.createdAt}`}>
                      <td>{index + 1}</td>
                      <td>{item.studentName}</td>
                      <td>{item.className}</td>
                      <td>{item.score} / {item.totalQuestions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>
    </Shell>
  );
}
