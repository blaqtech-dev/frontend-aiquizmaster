import { useParams, Link } from "react-router-dom";

import {
  useEffect,
  useState,
  useMemo,
} from "react";

import { supabase }
from "../../services/supabase/supabase";

import "./subjectdetails.css";

function SubjectDetails() {

  // ================= PARAMS =================

  const { name } = useParams();

  // ================= STATES =================

  const [quiz, setQuiz] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [difficulty, setDifficulty] =
    useState("All");

  const [search, setSearch] =
    useState("");

  // ================= FETCH QUIZ =================

  useEffect(() => {

    async function fetchQuiz() {

      try {

        setLoading(true);

        const decodedName =
          decodeURIComponent(name);

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

          return;
        }

        setQuiz(quizData);

        // ================= QUESTIONS =================

        let loadedQuestions = [];

        // FROM QUIZ TABLE

        if (
          quizData?.questions &&
          Array.isArray(
            quizData.questions
          )
        ) {

          loadedQuestions =
            quizData.questions;
        }

        // FALLBACK TO QUESTIONS TABLE

        if (
          loadedQuestions.length === 0
        ) {

          const {
            data: dbQuestions,
            error: questionError,
          } = await supabase

            .from("questions")

            .select("*")

            .ilike(
              "subject",
              decodedName
            );

          if (questionError) {

            console.log(
              questionError
            );
          }

          loadedQuestions =
            dbQuestions || [];
        }

        // ================= NORMALIZE =================

        loadedQuestions =
          loadedQuestions.map((q) => ({

            ...q,

            question:
              q?.question || "",

            answer:
              q?.answer || "",

            explanation:
              q?.explanation ||
              "No explanation available.",

            category:
              q?.category ||
              "General",

            difficulty:
              (
                q?.difficulty ||
                "easy"
              )

                .toString()

                .trim()

                .toLowerCase(),

            options:
              Array.isArray(
                q?.options
              )

                ? q.options

                : [],
          }));

        setQuestions(
          loadedQuestions
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    }

    fetchQuiz();

  }, [name]);

  // ================= FILTER QUESTIONS =================

  const filteredQuestions =
    useMemo(() => {

      return questions.filter((q) => {

        const matchesDifficulty =

          difficulty === "All" ||

          q.difficulty ===
            difficulty.toLowerCase();

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

  // ================= COUNTS =================

  const easyCount =
    questions.filter(
      (q) =>
        q.difficulty === "easy"
    ).length;

  const mediumCount =
    questions.filter(
      (q) =>
        q.difficulty === "medium"
    ).length;

  const hardCount =
    questions.filter(
      (q) =>
        q.difficulty === "hard"
    ).length;

  // ================= CATEGORY COUNT =================

  const categories =
    useMemo(() => {

      return [

        ...new Set(

          questions.map(
            (q) =>
              q.category ||
              "General"
          )
        ),
      ];

    }, [questions]);

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="subject-details-loading">

        <div className="loader"></div>

        <h1>
          Loading Subject...
        </h1>

      </div>
    );
  }

  // ================= EMPTY =================

  if (!quiz) {

    return (

      <div className="subject-details-empty">

        <h1>
          Subject Not Found
        </h1>

        <Link to="/subjects">

          <button>

            Back To Subjects

          </button>

        </Link>

      </div>
    );
  }

  // ================= PAGE =================

  return (

    <div className="subject-details-page">

      {/* ================= HERO ================= */}

      <div className="subject-hero">

        <div className="hero-left">

          <div className="subject-badge">

            AI PDF SUBJECT

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

              "AI generated learning experience from uploaded PDF."
            }

          </p>

          <div className="hero-actions">

            <Link
              to={`/subject/${quiz.id}/study`}
            >

              <button className="primary-btn">

                Study Mode

              </button>

            </Link>

            <Link
              to={`/subject/${encodeURIComponent(
                quiz.subject_name
              )}/setup`}
            >

              <button className="setup-btn">

                Start Quiz

              </button>

            </Link>

            <Link
              to={`/subject/${encodeURIComponent(
                quiz.subject_name
              )}/analytics`}
            >

              <button className="analytics-btn  setup-btn">

                Analytics

              </button>

            </Link>

            {
              quiz.pdf_url && (

                <a
                  href={quiz.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                >

                  <button className="pdf-btn  setup-btn">

                    Open PDF

                  </button>

                </a>
              )
            }

          </div>

        </div>

        {/* ================= RIGHT ================= */}

        <div className="hero-right">

          <div className="hero-stat-card">

            <h2>
              {questions.length}
            </h2>

            <span>
              Questions
            </span>

          </div>

          <div className="hero-stat-card">

            <h2>
              {easyCount}
            </h2>

            <span>
              Easy
            </span>

          </div>

          <div className="hero-stat-card">

            <h2>
              {mediumCount}
            </h2>

            <span>
              Medium
            </span>

          </div>

          <div className="hero-stat-card">

            <h2>
              {hardCount}
            </h2>

            <span>
              Hard
            </span>

          </div>

          <div className="hero-stat-card">

            <h2>
              {categories.length}
            </h2>

            <span>
              Categories
            </span>

          </div>

        </div>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="search-area">

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

      </div>

      {/* ================= FILTERS ================= */}

      <div className="filter-buttons">

        {[
          "All",
          "easy",
          "medium",
          "hard",
        ].map((item) => (

          <button
            key={item}
            className={
              difficulty === item

                ? "active-filter"

                : ""
            }
            onClick={() =>
              setDifficulty(item)
            }
          >

            {item}

          </button>
        ))}

      </div>

      {/* ================= QUESTION COUNT ================= */}

      <div className="question-result-info">

        <h3>

          {
            filteredQuestions.length
          }

          {" "}

          Questions Found

        </h3>

      </div>

      {/* ================= QUESTIONS ================= */}

      {
        filteredQuestions.length === 0 ? (

          <div className="empty-question-box">

            <h2>
              No Questions Found
            </h2>

            <p>

              Try changing the search
              or difficulty filter.

            </p>

          </div>

        ) : (

          <div className="questions-grid">

            {
              filteredQuestions.map(
                (
                  q,
                  index
                ) => (

                  <div
                    key={index}
                    className="question-card"
                  >

                    {/* TOP */}

                    <div className="question-top">

                      <span className="difficulty-tag">

                        {
                          q.difficulty
                        }

                      </span>

                      <span className="category-tag">

                        {
                          q.category
                        }

                      </span>

                    </div>

                    {/* QUESTION */}

                    <h3>

                      {q.question}

                    </h3>

                    {/* EXPLANATION */}

                    <p className="question-explanation">

                      {
                        q.explanation
                      }

                    </p>

                    {/* OPTIONS */}

                    <div className="options-preview">

                      {
                        q.options.map(
                          (
                            option,
                            i
                          ) => (

                            <div
                              key={i}
                              className={`option-preview ${
                                option ===
                                q.answer

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

                  </div>
                )
              )
            }

          </div>
        )
      }

    </div>
  );
}

export default SubjectDetails;