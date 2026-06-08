
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../services/supabase/supabase";
import "./subjectsetup.css";

function SubjectSetup() {

  const { name } = useParams();

  const navigate = useNavigate();

  // ================= STATES =================

  const [subject, setSubject] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [categories, setCategories] =
    useState(["All"]);

  const [difficulty, setDifficulty] =
    useState("all");

  const [category, setCategory] =
    useState("All");

  const [questionCount, setQuestionCount] =
    useState(10);

  const [loading, setLoading] =
    useState(true);

  const [startingQuiz, setStartingQuiz] =
    useState(false);

  // ================= FETCH =================

  useEffect(() => {

    async function loadData() {

      try {

        setLoading(true);

        const decodedName =
          decodeURIComponent(name);

        const {
          data,
          error,
        } = await supabase

          .from("quizzes")

          .select("*")

          .eq(
            "subject_name",
            decodedName
          )

          .limit(1);

        if (error) {

          console.log(error);

          return;
        }

        if (!data || data.length === 0) {

          setSubject(null);

          return;
        }

        const quiz =
          data[0];

        setSubject(quiz);

        // ================= CLEAN QUESTIONS =================

        const cleanedQuestions =
          (quiz?.questions || []).map((q) => ({

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
              Array.isArray(q?.options)
                ? q.options
                : [],
          }));

        setQuestions(
          cleanedQuestions
        );

        // ================= CATEGORIES =================

        const extractedCategories = [

          "All",

          ...new Set(

            cleanedQuestions
              .map(
                (q) =>
                  q.category
              )
              .filter(Boolean)
          ),
        ];

        setCategories(
          extractedCategories
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    }

    loadData();

  }, [name]);

  // ================= FILTER =================

  const filteredQuestions =
    useMemo(() => {

      let filtered =
        [...questions];

      // difficulty

      if (
        difficulty !== "all"
      ) {

        filtered =
          filtered.filter(
            (q) =>

              (
                q.difficulty ||
                "easy"
              )
                .toLowerCase()
                .trim() ===
              difficulty
          );
      }

      // category

      if (
        category !== "All"
      ) {

        filtered =
          filtered.filter(
            (q) =>
              q.category ===
              category
          );
      }

      return filtered;

    }, [
      questions,
      difficulty,
      category,
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

  // ================= FINAL QUESTIONS =================

  const finalQuestions =
    filteredQuestions.slice(
      0,
      questionCount
    );

  const estimatedTime =
    Math.max(
      1,
      Math.round(
        finalQuestions.length * 0.5
      )
    );

  // ================= START QUIZ =================

  function startQuiz() {

    if (
      finalQuestions.length === 0
    ) {

      alert(
        "No questions available."
      );

      return;
    }

    setStartingQuiz(true);

    navigate(
      `/quiz/${encodeURIComponent(name)}`,
      {
        state: {

          questions:
            finalQuestions,

          settings: {

            difficulty,

            category,

            count:
              finalQuestions.length,
          },
        },
      }
    );
  }

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="setup-loading">

        <div className="setup-loader"></div>

        <h1>
          Loading Setup...
        </h1>

      </div>
    );
  }

  // ================= EMPTY =================

  if (!subject) {

    return (

      <div className="setup-loading">

        <h1>
          Subject Not Found
        </h1>

      </div>
    );
  }

  // ================= PAGE =================

  return (

    <div className="setup-page">

      <div className="setup-card">

        <div className="setup-top">

          <div className="setup-badge">

            SMART QUIZ

          </div>

          <h1>

            {
              subject.subject_name ||
              subject.pdf_name
            }

          </h1>

          <p>

            Customize your AI-powered quiz experience.

          </p>

        </div>

        {/* ================= STATS ================= */}

        <div className="setup-stats-grid">

          <div className="setup-stat-box">

            <h2>
              {questions.length}
            </h2>

            <p>
              Questions
            </p>

          </div>

          <div className="setup-stat-box easy-box">

            <h2>
              {easyCount}
            </h2>

            <p>
              Easy
            </p>

          </div>


        </div>

        {/* ================= DIFFICULTY ================= */}

        <div className="setup-group">

          <h3>
            Select Difficulty
          </h3>

          <div className="setup-options">

            {[
              "all",
              "easy",
             
            ].map((item) => (

              <button
                key={item}
                className={
                  difficulty === item
                    ? "setup-btn active"
                    : "setup-btn"
                }
                onClick={() =>
                  setDifficulty(item)
                }
              >

                {item}

              </button>
            ))}

          </div>

        </div>

        {/* ================= CATEGORY ================= */}

        <div className="setup-group">

          <h3>
            Select Topic
          </h3>

          <div className="setup-options">

            {categories.map((item) => (

              <button
                key={item}
                className={
                  category === item
                    ? "setup-btn active"
                    : "setup-btn"
                }
                onClick={() =>
                  setCategory(item)
                }
              >

                {item}

              </button>
            ))}

          </div>

        </div>

        {/* ================= COUNT ================= */}

        <div className="setup-group">

          <h3>
            Number Of Questions
          </h3>

          <select
            className="setup-select"
            value={questionCount}
            onChange={(e) =>
              setQuestionCount(
                Number(e.target.value)
              )
            }
          >

            <option value={5}>
              5 Questions
            </option>

            <option value={10}>
              10 Questions
            </option>

            <option value={15}>
              15 Questions
            </option>


          </select>

        </div>

        {/* ================= SUMMARY ================= */}

        <div className="setup-summary-box">

          <div className="summary-item">

            <h4>
              Difficulty
            </h4>

            <p>
              {difficulty}
            </p>

          </div>

          <div className="summary-item">

            <h4>
              Category
            </h4>

            <p>
              {category}
            </p>

          </div>

          <div className="summary-item">

            <h4>
              Questions
            </h4>

            <p>
              {finalQuestions.length}
            </p>

          </div>

          <div className="summary-item">

            <h4>
              Estimated Time
            </h4>

            <p>
              {estimatedTime} mins
            </p>

          </div>

        </div>

        {/* ================= AVAILABLE ================= */}

        <div className="available-questions-box">

          <h3>

            {
              filteredQuestions.length
            }

          </h3>

          <p>

            Questions Available

          </p>

        </div>

        {/* ================= START ================= */}

        <button
          className="start-smart-btn"
          onClick={startQuiz}
          disabled={
            finalQuestions.length === 0 ||
            startingQuiz
          }
        >

          {
            startingQuiz
              ? "Starting Quiz..."
              : "Start Smart Quiz"
          }

        </button>

      </div>

    </div>
  );
}

export default SubjectSetup;

