import { useEffect, useMemo, useState } from "react";

import { useParams, Link } from "react-router-dom";

import { supabase } from "../../services/supabase/supabase";

import "./subjectstudy.css";

export default function SubjectStudyMode() {

  const { id } = useParams();

  // ================= STATES =================

  const [quiz, setQuiz] =
    useState(null);

  const [mode, setMode] =
    useState("learn");

  const [loading, setLoading] =
    useState(true);

  const [difficulty, setDifficulty] =
    useState("all");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [score, setScore] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const [showAnswer, setShowAnswer] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(20);

  const [search, setSearch] =
    useState("");

  // ================= FETCH QUIZ =================

  useEffect(() => {

    async function loadQuiz() {

      try {

        setLoading(true);

        const {
          data,
          error,
        } = await supabase

          .from("quizzes")

          .select("*")

          .eq("id", id)

          .single();

        if (error) {

          console.log(error);

          return;
        }

        setQuiz(data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    }

    if (id) {

      loadQuiz();
    }

  }, [id]);

  // ================= NORMALIZE QUESTIONS =================

  const questions = useMemo(() => {

    if (!quiz?.questions) return [];

    return quiz.questions.map((q) => ({

      ...q,

      question:
        q?.question || "",

      explanation:
        q?.explanation ||
        "No explanation available.",

      answer:
        q?.answer || "",

      difficulty:
        (
          q?.difficulty ||
          "easy"
        )
          .toString()
          .trim()
          .toLowerCase(),

      options:
        Array.isArray(q?.options)
          ? q.options
          : [],
    }));

  }, [quiz]);

  // ================= FILTER QUESTIONS =================

  const filteredQuestions =
    useMemo(() => {

      return questions.filter((q) => {

        const matchesDifficulty =

          difficulty === "all" ||

          q.difficulty ===
            difficulty;

        const matchesSearch =

          q.question
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        return (
          matchesDifficulty &&
          matchesSearch
        );
      });

    }, [
      questions,
      difficulty,
      search,
    ]);

  // ================= RESET QUESTION INDEX =================

  useEffect(() => {

    setCurrentQuestion(0);

    setFinished(false);

    setSelectedAnswer("");

    setShowAnswer(false);

    setTimeLeft(20);

  }, [
    difficulty,
    search,
    mode,
  ]);

  // ================= CURRENT QUESTION =================

  const currentQuiz =
    filteredQuestions[
      currentQuestion
    ];

  // ================= TIMER =================

  useEffect(() => {

    if (
      mode !== "quiz" ||
      finished ||
      loading ||
      filteredQuestions.length === 0
    ) {
      return;
    }

    if (showAnswer) {
      return;
    }

    if (timeLeft <= 0) {

      nextQuestion();

      return;
    }

    const timer =
      setInterval(() => {

        setTimeLeft(
          (prev) => prev - 1
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, [
    timeLeft,
    finished,
    loading,
    mode,
    filteredQuestions.length,
    showAnswer,
  ]);

  // ================= ANSWER =================

  function handleAnswer(option) {

    if (
      showAnswer ||
      !currentQuiz
    ) {
      return;
    }

    setSelectedAnswer(option);

    setShowAnswer(true);

    if (
      option ===
      currentQuiz.answer
    ) {

      setScore(
        (prev) => prev + 1
      );
    }

    setTimeout(() => {

      nextQuestion();

    }, 1200);
  }

  // ================= NEXT QUESTION =================

  function nextQuestion() {

    const next =
      currentQuestion + 1;

    if (
      next >=
      filteredQuestions.length
    ) {

      setFinished(true);

      return;
    }

    setCurrentQuestion(next);

    setSelectedAnswer("");

    setShowAnswer(false);

    setTimeLeft(20);
  }

  // ================= RESET QUIZ =================

  function resetQuiz() {

    setCurrentQuestion(0);

    setSelectedAnswer("");

    setScore(0);

    setFinished(false);

    setShowAnswer(false);

    setTimeLeft(20);
  }

  // ================= COUNTS =================

  const easyCount =
    questions.filter(
      (q) =>
        q.difficulty ===
        "easy"
    ).length;

  const mediumCount =
    questions.filter(
      (q) =>
        q.difficulty ===
        "medium"
    ).length;

  const hardCount =
    questions.filter(
      (q) =>
        q.difficulty ===
        "hard"
    ).length;

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="study-loading">

        <div className="study-loader"></div>

        <h1>
          Loading Study Mode...
        </h1>

      </div>
    );
  }

  // ================= EMPTY =================

  if (!quiz) {

    return (

      <div className="study-loading">

        <h1>
          PDF Not Found
        </h1>

      </div>
    );
  }

  // ================= PAGE =================

  return (

    <div className="study-page">

      {/* HERO */}

      <div className="study-hero">

        <div className="study-hero-left">

          <div className="study-badge">

            AI STUDY MODE

          </div>

          <h1>

            {
              quiz.subject_name ||
              quiz.pdf_name
            }

          </h1>

          <p>

            {
              quiz.summary ||

              "Learn smarter using AI generated summaries, flashcards, and quizzes."
            }

          </p>

          <div className="study-buttons">

            <Link
              to={`/subject/${quiz.id}`}
            >

              <button className="study-btn secondary">

                Back To Subject

              </button>

            </Link>

            <a
              href={quiz.pdf_url}
              target="_blank"
              rel="noreferrer"
            >

              <button className="study-btn primary">

                Open PDF

              </button>

            </a>

          </div>

        </div>

        {/* HERO RIGHT */}

        <div className="study-hero-right">

          <div className="study-stat-card">

            <h1>
              {questions.length}
            </h1>

            <p>
              Questions
            </p>

          </div>

          <div className="study-stat-card">

            <h1>
              {easyCount}
            </h1>

            <p>
              Easy
            </p>

          </div>

       
         

        </div>

      </div>

      {/* MODE SWITCH */}

      <div className="mode-switch">

        {[
          "learn",
          "practice",
          "quiz",
        ].map((item) => (

          <button
            key={item}
            className={
              mode === item
                ? "mode-btn active-mode"
                : "mode-btn"
            }
            onClick={() =>
              setMode(item)
            }
          >

            {item}

          </button>
        ))}

      </div>

      {/* LEARN MODE */}

      {
        mode === "learn" && (

          <div className="learn-mode">

            <div className="summary-box">

              <h2>
                AI Summary
              </h2>

              <p>
                {
                  quiz.summary ||
                  "No summary available."
                }
              </p>

            </div>

            {/* FLASHCARDS */}

            {
              quiz.flashcards?.length > 0 && (

                <div className="flash-grid">

                  {
                    quiz.flashcards.map(
                      (
                        card,
                        index
                      ) => (

                        <div
                          key={index}
                          className="flash-card"
                        >

                          <h3>
                            {
                              card.question
                            }
                          </h3>

                          <p>
                            {
                              card.answer
                            }
                          </p>

                        </div>
                      )
                    )
                  }

                </div>
              )
            }

          </div>
        )
      }

      {/* PRACTICE MODE */}

      {
        mode === "practice" && (

          <div className="practice-mode">

            <div className="practice-top">

              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

              <div className="practice-filter">

                {
                  [
                    "all",
                    "easy",
                    "medium",
                    "hard",
                  ].map((item) => (

                    <button
                      key={item}
                      className={
                        difficulty === item
                          ? "filter-btn active-filter"
                          : "filter-btn"
                      }
                      onClick={() =>
                        setDifficulty(item)
                      }
                    >

                      {item}

                    </button>
                  ))
                }

              </div>

            </div>

            {
              filteredQuestions.length === 0 ? (

                <div className="empty-study">

                  <h2>
                    No Questions Found
                  </h2>

                </div>

              ) : (

                <div className="practice-list">

                  {
                    filteredQuestions.map(
                      (
                        q,
                        index
                      ) => (

                        <div
                          key={index}
                          className="practice-card"
                        >

                          <div className="practice-tags">

                            <span>
                              {
                                q.difficulty
                              }
                            </span>

                          </div>

                          <h3>
                            {q.question}
                          </h3>

                          <p>
                            {
                              q.explanation
                            }
                          </p>

                          <div className="answer-box">

                            <strong>
                              Answer:
                            </strong>

                            {" "}

                            {q.answer}

                          </div>

                        </div>
                      )
                    )
                  }

                </div>
              )
            }

          </div>
        )
      }

      {/* QUIZ MODE */}

      {
        mode === "quiz" && (

          <div className="quiz-mode">

            {
              filteredQuestions.length === 0 ? (

                <div className="empty-study">

                  <h2>
                    No Questions Available
                  </h2>

                </div>

              ) : !finished ? (

                <div className="quiz-box">

                  <div className="quiz-top">

                    <h2>

                      Question
                      {" "}
                      {currentQuestion + 1}

                      /

                      {
                        filteredQuestions.length
                      }

                    </h2>

                    <div className="quiz-timer">

                      ⏳ {timeLeft}s

                    </div>

                  </div>

                  <h3 className="quiz-question">

                    {
                      currentQuiz?.question
                    }

                  </h3>

                  <div className="quiz-options">

                    {
                      currentQuiz?.options?.map(
                        (
                          option,
                          index
                        ) => (

                          <button
                            key={index}
                            className={`quiz-option

                            ${
                              showAnswer &&
                              option === currentQuiz.answer

                                ? "correct"

                                : ""
                            }

                            ${
                              showAnswer &&
                              option === selectedAnswer &&
                              option !== currentQuiz.answer

                                ? "wrong"

                                : ""
                            }
                            `}
                            onClick={() =>
                              handleAnswer(
                                option
                              )
                            }
                          >

                            {option}

                          </button>
                        )
                      )
                    }

                  </div>

                  {
                    showAnswer && (

                      <div className="quiz-explanation">

                        <h4>
                          Explanation
                        </h4>

                        <p>

                          {
                            currentQuiz.explanation
                          }

                        </p>

                      </div>
                    )
                  }

                  <div className="quiz-score">

                    Score:
                    {" "}
                    {score}

                  </div>

                </div>

              ) : (

                <div className="result-box">

                  <h1>
                    Quiz Completed 🎉
                  </h1>

                  <div className="final-score">

                    {score}

                    /

                    {
                      filteredQuestions.length
                    }

                  </div>

                  <div className="final-percent">

                    {
                      Math.round(

                        (
                          score /

                          filteredQuestions.length
                        ) * 100
                      )
                    }%

                  </div>

                  <button
                    className="restart-btn"
                    onClick={resetQuiz}
                  >

                    Restart Quiz

                  </button>

                </div>
              )
            }

          </div>
        )
      }

    </div>
  );
}