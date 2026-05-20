import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Shell from "../components/Shell";
import { activityCards, growthData, learningChallenges } from "../content/schoolData";

export default function LearnPage() {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const score = learningChallenges.reduce(
    (total, challenge, index) => total + (selectedAnswers[index] === challenge.answer ? 1 : 0),
    0
  );

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
              <a className="button primary" href="#learning-game">Play Quiz</a>
              <a className="button secondary" href="#growth-graphs">View Growth</a>
            </div>
          </div>
          <div className="learning-orbit" aria-hidden="true">
            <div className="orbit-card cube-one">ABC</div>
            <div className="orbit-card cube-two">123</div>
            <div className="orbit-card cube-three">A+</div>
            <div className="cartoon-kid orbit-kid">
              <span className="hair" />
              <span className="face" />
              <span className="body" />
              <span className="arm left" />
              <span className="arm right" />
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
            <h2>Quick quiz for bright learners.</h2>
          </div>
          <div className="quiz-grid">
            {learningChallenges.map((challenge, index) => (
              <article className="card quiz-card" key={challenge.question}>
                <h3>{challenge.question}</h3>
                <div className="choice-grid">
                  {challenge.choices.map((choice) => (
                    <button
                      className={`choice-button${selectedAnswers[index] === choice ? " selected" : ""}${choice === challenge.answer && selectedAnswers[index] ? " correct-choice" : ""}`}
                      key={choice}
                      onClick={() => setSelectedAnswers((answers) => ({ ...answers, [index]: choice }))}
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
            <h3>Score: {score} / {learningChallenges.length}</h3>
            <p>Keep trying until all stars are shining.</p>
          </article>
        </div>
      </section>
    </Shell>
  );
}
