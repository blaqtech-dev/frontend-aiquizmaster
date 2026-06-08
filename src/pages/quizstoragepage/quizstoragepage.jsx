import { useEffect, useState } from "react";

import { supabase }
from "../../services/supabase/supabase";

import { useAuth }
from "../../context/authcontext/authcontext";

import "./quizstorage.css";
import { useNavigate } from "react-router-dom";

export function QuizStoragePage() {

  const { user } =
    useAuth();

  // ================= STATES =================

  const [
    quizzes,
    setQuizzes,
  ] = useState([]);


  const navigate = useNavigate();
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    expandedQuiz,
    setExpandedQuiz,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  // ================= FETCH QUIZZES =================

  useEffect(() => {

    async function fetchQuizzes() {

      if (!user)
        return;

      const {
        data,
        error,
      } = await supabase

        .from("quizzes")

        .select("*")

        .eq(
          "user_id",
          user.id
        )

        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {

        console.log(
          error.message
        );

      } else {

        setQuizzes(data || []);
      }

      setLoading(false);
    }

    fetchQuizzes();

  }, [user]);

  // ================= DELETE QUIZ =================

  async function deleteQuiz(id) {

    const confirmDelete =
      window.confirm(
        "Delete this quiz?"
      );

    if (!confirmDelete)
      return;

    const { error } =
      await supabase

        .from("quizzes")

        .delete()

        .eq("id", id);

    if (error) {

      console.log(
        error.message
      );

      return;
    }

    setQuizzes((prev) =>
      prev.filter(
        (quiz) =>
          quiz.id !== id
      )
    );
  }

  // ================= TOGGLE QUESTIONS =================

  function toggleQuiz(id) {

    if (
      expandedQuiz === id
    ) {

      setExpandedQuiz(null);

    } else {

      setExpandedQuiz(id);
    }
  }

  // ================= FILTERED QUIZZES =================

  const filteredQuizzes =

    quizzes.filter((quiz) =>

      quiz.pdf_name
        ?.toLowerCase()

        .includes(
          search.toLowerCase()
        )
    );

  // ================= ANALYTICS =================

  const totalQuestions =

    quizzes.reduce(
      (acc, quiz) =>

        acc +
        (quiz.total_questions || 0),

      0
    );

  const totalScore =

    quizzes.reduce(
      (acc, quiz) =>

        acc +
        (quiz.score || 0),

      0
    );

  const averageScore =

    quizzes.length > 0

      ? (
          totalScore /
          quizzes.length
        ).toFixed(1)

      : 0;

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="quiz-storage-page">

        <div className="quiz-storage-loading">

          <h1>
            Loading Quiz History...
          </h1>

        </div>

      </div>
    );
  }

  // ================= PAGE =================

  return (

    <div className="quiz-storage-page">

      {/* ================= HEADER ================= */}

      <div className="quiz-storage-header">

        <div>

          <h1>
            Quiz Storage
          </h1>

          <p>
            View all saved quizzes,
            generated questions,
            scores,
            summaries,
            flashcards,
            and uploaded PDFs.
          </p>

        </div>

      </div>

      {/* ================= ANALYTICS ================= */}

      <div className="analytics-grid">

        <div className="analytics-card">

          <span>
            Total Quizzes
          </span>

          <h2>
            {quizzes.length}
          </h2>

        </div>

        <div className="analytics-card">

          <span>
            Total Questions
          </span>

          <h2>
            {totalQuestions}
          </h2>

        </div>

        <div className="analytics-card">

          <span>
            Average Score
          </span>

          <h2>
            {averageScore}
          </h2>

        </div>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="search-wrapper">

        <input
          type="text"
          placeholder="Search quizzes..."
          className="search-input"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* ================= EMPTY ================= */}

      {
        filteredQuizzes.length === 0 && (

          <div className="quiz-empty">

            <div className="quiz-empty-icon">
              📘
            </div>

            <h2>
              No Quizzes Found
            </h2>

            <p>
              Upload PDFs and generate
              AI quizzes to see them here.
            </p>

          </div>
        )
      }

      {/* ================= QUIZ GRID ================= */}

      <div className="quiz-storage-grid">

        {
          filteredQuizzes.map((quiz) => (

            <div
              key={quiz.id}
              className="quiz-card"
            >

              {/* ================= TOP ================= */}

              <div className="quiz-card-top">

                <div className="quiz-icon">
                  📄
                </div>

                <div className="quiz-badge">
                  AI QUIZ
                </div>

              </div>

              {/* ================= TITLE ================= */}

              <h2 className="quiz-title">

                {
                  quiz.pdf_name ||
                  "Untitled PDF"
                }

              </h2>

              {/* ================= STATS ================= */}

              <div className="quiz-stats">

                <div className="quiz-stat">

                  <span>
                    Score
                  </span>

                  <strong>

                    {quiz.score || 0}
                    {" / "}
                    {
                      quiz.total_questions ||
                      0
                    }

                  </strong>

                </div>

                <div className="quiz-stat">

                  <span>
                    Questions
                  </span>

                  <strong>

                    {
                      quiz.questions
                        ?.length || 0
                    }

                  </strong>

                </div>

              </div>

              {/* ================= DATE ================= */}

              <div className="quiz-date">

                Created:
                {" "}

                {
                  new Date(
                    quiz.created_at
                  ).toLocaleString()
                }

              </div>

              {/* ================= ACTIONS ================= */}

              <div className="quiz-actions">

                <a
                  href={quiz.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="open-pdf-btn"
                >

                  Open PDF

                </a>


               

                <button
                  className="view-questions-btn"
                  onClick={() =>
                    toggleQuiz(
                      quiz.id
                    )
                  }
                >

                  {
                    expandedQuiz ===
                    quiz.id
                      ? "Hide Questions"
                      : "View Questions"
                  }

                </button>


<button
  className="ai-tutor-btn    open-pdf-btn"

  onClick={() =>
    navigate("/ai-tutor", {
      state: {
        pdfUrl: quiz.pdf_url,
        pdfName: quiz.pdf_name,
        quizId: quiz.id,
      },
    })
  }
>
  Ask AI Tutor
</button>



                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteQuiz(
                      quiz.id
                    )
                  }
                >

                  Delete

                </button>

              </div>

              {/* ================= EXPANDED ================= */}

              {
                expandedQuiz ===
                  quiz.id && (

                  <div className="questions-wrapper">

                    {/* ================= SUMMARY ================= */}

                    <div className="summary-section">

                      <h3>
                        AI Summary
                      </h3>

                      <p>

                        {
                          quiz.summary ||
                          "No summary available."
                        }

                      </p>

                    </div>

                    {/* ================= FLASHCARDS ================= */}

                    <div className="flashcards-section">

                      <h3>
                        Flashcards
                      </h3>

                      <div className="flashcard-grid">

                        {
                          quiz.flashcards?.map(
                            (
                              flashcard,
                              index
                            ) => (

                              <div
                                key={index}
                                className="flashcard-item"
                              >

                                <h4>

                                  {
                                    flashcard.question
                                  }

                                </h4>

                                <p>

                                  {
                                    flashcard.answer
                                  }

                                </p>

                              </div>
                            )
                          )
                        }

                      </div>

                    </div>

                    {/* ================= QUESTIONS ================= */}

                    <h3>
                      Saved Questions
                    </h3>

                    {
                      quiz.questions?.map(
                        (
                          question,
                          index
                        ) => (

                          <div
                            key={index}
                            className="question-card"
                          >

                            <h4>

                              {index + 1}.
                              {" "}

                              {
                                question.question
                              }

                            </h4>

                            <div className="options-list">

                              {
                                question.options?.map(
                                  (
                                    option,
                                    optionIndex
                                  ) => (

                                    <div
                                      key={
                                        optionIndex
                                      }
                                      className={`option-item ${
                                        option ===
                                        question.answer
                                          ? "correct-option"
                                          : ""
                                      }`}
                                    >

                                      {option}

                                    </div>
                                  )
                                )
                              }

                            </div>

                            <div className="answer-box">

                              Correct Answer:
                              {" "}

                              <span>

                                {
                                  question.answer
                                }

                              </span>

                            </div>

                            <div className="explanation-box">

                              <strong>
                                Explanation:
                              </strong>

                              <p>

                                {
                                  question.explanation ||
                                  "No explanation."
                                }

                              </p>

                            </div>

                          </div>
                        )
                      )
                    }

                  </div>
                )
              }

            </div>
          ))
        }

      </div>

    </div>
  );
}