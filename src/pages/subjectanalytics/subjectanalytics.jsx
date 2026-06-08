import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { supabase } from "../../services/supabase/supabase";

import "./subjectanalytics.css";

function SubjectAnalytics() {
  const { name } = useParams();

  const decodedName = decodeURIComponent(name);

  // ================= STATES =================

  const [loading, setLoading] = useState(true);

  const [attempts, setAttempts] = useState([]);

  const [topPlayers, setTopPlayers] = useState([]);

  const [subjectQuestions, setSubjectQuestions] =
    useState([]);

  const [subjectInfo, setSubjectInfo] =
    useState(null);

  const [error, setError] =
    useState("");

  // ================= LOAD DATA =================

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);

        setError("");

        // ================= QUIZ =================

        const {
          data: quizData,
          error: quizError,
        } = await supabase
          .from("quizzes")
          .select("*")
          .ilike(
            "subject_name",
            decodedName
          )
          .limit(1)
          .single();

        if (quizError) {
          console.log(quizError);
        }

        setSubjectInfo(quizData);

        // ================= ATTEMPTS =================

        const {
          data: attemptData,
          error: attemptError,
        } = await supabase
          .from("quiz_attempts")
          .select("*")
          .ilike(
            "subject",
            decodedName
          )
          .order("created_at", {
            ascending: false,
          });

        if (attemptError) {
          console.log(attemptError);
        }

        // ================= QUESTIONS =================

        let questions =
          quizData?.questions || [];

        if (
          !questions ||
          questions.length === 0
        ) {
          const {
            data: questionData,
            error: questionError,
          } = await supabase
            .from("questions")
            .select("*")
            .ilike(
              "subject",
              decodedName
            );

          if (questionError) {
            console.log(questionError);
          }

          questions =
            questionData || [];
        }

        // ================= NORMALIZE =================

        questions = questions.map((q) => ({
          ...q,
          difficulty: (
            q?.difficulty || "easy"
          )
            .toString()
            .trim()
            .toLowerCase(),
        }));

        setAttempts(attemptData || []);

        setSubjectQuestions(
          questions || []
        );

        // ================= LEADERBOARD =================

        const groupedPlayers = {};

        (attemptData || []).forEach(
          (attempt) => {
            const playerName =
              attempt.username ||
              "Anonymous";

            if (
              !groupedPlayers[playerName]
            ) {
              groupedPlayers[playerName] =
                {
                  username: playerName,
                  totalScore: 0,
                  attempts: 0,
                  highest: 0,
                };
            }

            groupedPlayers[
              playerName
            ].totalScore +=
              attempt.percentage || 0;

            groupedPlayers[
              playerName
            ].attempts += 1;

            if (
              attempt.percentage >
              groupedPlayers[playerName]
                .highest
            ) {
              groupedPlayers[
                playerName
              ].highest =
                attempt.percentage;
            }
          }
        );

        const leaderboard =
          Object.values(groupedPlayers)
            .map((player) => ({
              ...player,

              average: Math.round(
                player.totalScore /
                  player.attempts
              ),
            }))
            .sort(
              (a, b) =>
                b.average - a.average
            );

        setTopPlayers(leaderboard);
      } catch (err) {
        console.log(err);

        setError(
          "Failed to load analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [decodedName]);

  // ================= CALCULATIONS =================

  const totalAttempts =
    attempts.length;

  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce(
            (acc, item) =>
              acc +
              (item.percentage || 0),
            0
          ) / attempts.length
        )
      : 0;

  const highestScore =
    attempts.length > 0
      ? Math.max(
          ...attempts.map(
            (a) =>
              a.percentage || 0
          )
        )
      : 0;

  const multiplayerAttempts =
    attempts.filter(
      (item) => item.multiplayer
    ).length;

  const singlePlayerAttempts =
    attempts.filter(
      (item) => !item.multiplayer
    ).length;

  // ================= DIFFICULTY =================

  const easyCount =
    subjectQuestions.filter(
      (q) =>
        q.difficulty === "easy"
    ).length;

  const mediumCount =
    subjectQuestions.filter(
      (q) =>
        q.difficulty === "medium"
    ).length;

  const hardCount =
    subjectQuestions.filter(
      (q) =>
        q.difficulty === "hard"
    ).length;

  // ================= CATEGORY =================

  const categories =
    useMemo(() => {
      const allCategories =
        subjectQuestions.map(
          (q) =>
            q.category ||
            "General"
        );

      return [
        ...new Set(allCategories),
      ];
    }, [subjectQuestions]);

  // ================= RECENT =================

  const recentAttempts =
    attempts.slice(0, 10);

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="analytics-loader"></div>

        <h2>
          Loading Analytics...
        </h2>
      </div>
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <div className="analytics-loading">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* HERO */}

      <div className="analytics-hero">

        <div className="analytics-overlay"></div>

        <div className="analytics-hero-left">

          <div className="analytics-badge">
            SUBJECT ANALYTICS
          </div>

          <h1>
            {decodedName}
          </h1>

          <p>
            {subjectInfo?.summary ||
              "Track player performance, leaderboard rankings and learning progress."}
          </p>

          <div className="analytics-buttons">

            <Link
              to={`/subject/${encodeURIComponent(
                decodedName
              )}`}
            >
              <button className="back-btn">
                Back To Subject
              </button>
            </Link>

            <Link
              to={`/subject/${encodeURIComponent(
                decodedName
              )}/setup`}
            >
              <button className="start-btn">
                Start Quiz
              </button>
            </Link>

          </div>

        </div>

        {/* RIGHT */}

        <div className="analytics-hero-right">

          <div className="hero-mini-card">

            <h2>
              {subjectQuestions.length}
            </h2>

            <p>
              Questions
            </p>

          </div>

          <div className="hero-mini-card">

            <h2>
              {categories.length}
            </h2>

            <p>
              Categories
            </p>

          </div>

          <div className="hero-mini-card">

            <h2>
              {highestScore}%
            </h2>

            <p>
              Highest Score
            </p>

          </div>

        </div>

      </div>

      {/* STATS */}

      <div className="analytics-stats-grid">

        <div className="analytics-stat-card">

          <span>🎯</span>

          <h2>
            {totalAttempts}
          </h2>

          <p>
            Total Attempts
          </p>

        </div>

        <div className="analytics-stat-card">

          <span>📊</span>

          <h2>
            {averageScore}%
          </h2>

          <p>
            Average Score
          </p>

        </div>

        <div className="analytics-stat-card">

          <span>🏆</span>

          <h2>
            {topPlayers[0]
              ?.username.slice(0,10) || "-"}
          </h2>

          <p>
            Top Player
          </p>

        </div>

        <div className="analytics-stat-card">

          <span>📘</span>

          <h2>
            {subjectQuestions.length}
          </h2>

          <p>
            Total Questions
          </p>

        </div>

      </div>

      {/* DIFFICULTY */}

      <div className="difficulty-section">

        <div className="section-header">

          <h2>
            Difficulty Breakdown
          </h2>

        </div>

        <div className="difficulty-grid">

          <div className="difficulty-card easy">

            <h1>
              {easyCount}
            </h1>

            <p>
              Easy Questions
            </p>

          </div>

          <div className="difficulty-card medium">

            <h1>
              {mediumCount}
            </h1>

            <p>
              Medium Questions
            </p>

          </div>

          <div className="difficulty-card hard">

            <h1>
              {hardCount}
            </h1>

            <p>
              Hard Questions
            </p>

          </div>

        </div>

      </div>

      {/* LEADERBOARD */}

      <div className="leaderboard-section">

        <div className="section-header">

          <h2>
            Leaderboard
          </h2>

        </div>

        {topPlayers.length === 0 ? (

          <div className="empty-box">

            <h3>
              No Leaderboard Yet
            </h3>

          </div>

        ) : (

          <div className="leaderboard-list">

            {topPlayers.map(
              (
                player,
                index
              ) => (

                <div
                  key={index}
                  className="leaderboard-card"
                >

                  <div className="leaderboard-left">

                    <div className="rank">
                      #{index + 1}
                    </div>

                    <div>

                      <h3>
                        {
                          player.username
                        }
                      </h3>

                      <p>
                        {
                          player.attempts
                        }{" "}
                        attempts
                      </p>

                    </div>

                  </div>

                  <div className="leaderboard-right">

                    <span className="highest-score">

                      Best:{" "}
                      {
                        player.highest
                      }%

                    </span>

                    <div className="leaderboard-score">

                      {
                        player.average
                      }%

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* RECENT */}

      <div className="recent-section">

        <div className="section-header">

          <h2>
            Recent Attempts
          </h2>

        </div>

        {recentAttempts.length === 0 ? (

          <div className="empty-box">

            <h3>
              No Attempts Yet
            </h3>

          </div>

        ) : (

          <div className="recent-list">

            {recentAttempts.map(
              (attempt) => (

                <div
                  key={attempt.id}
                  className="recent-card"
                >

                  <div className="recent-user">

                    <h3>
                      {attempt.username ||
                        "Anonymous"}
                    </h3>

                    <p>

                      {new Date(
                        attempt.created_at
                      ).toLocaleDateString()}

                    </p>

                  </div>

                  <div className="recent-mode">

                    {attempt.multiplayer
                      ? "Multiplayer"
                      : "Single Player"}

                  </div>

                  <div className="recent-score">

                    {
                      attempt.percentage
                    }%

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default SubjectAnalytics;