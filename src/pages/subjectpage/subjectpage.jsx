import { useEffect, useMemo, useState } from "react";

import { supabase }
from "../../services/supabase/supabase";
import { useAuth } from "../../context/authcontext/authcontext";

import SubjectCard
from "../../components/subjectcard/subjectcard";

import "./subject.css";

function Subjects() {

   const { user } = useAuth(); // ✅ FIXED

  // ================= STATES =================

  const [subjects, setSubjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("All");

  // ================= FETCH SUBJECTS =================

  useEffect(() => {

     if (!user) return;

    async function fetchSubjects() {

      try {

        setLoading(true);

        const {
          data,
          error,
        } = await supabase

          .from("quizzes")

          .select("*")
  .eq("user_id", user.id) // ✅ ONLY CURRENT USER DATA
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (error) {

          console.log(error);

          return;
        }

        // ================= GROUP SUBJECTS =================

        const subjectMap = {};

        data?.forEach((quiz) => {

          const rawName =

            quiz.subject_name ||

            quiz.pdf_name ||

            "Untitled Subject";

          const cleanName =

            rawName
              .replace(".pdf", "")
              .trim();

          const category =
            quiz.category ||
            "General";

          if (
            !subjectMap[cleanName]
          ) {

            subjectMap[cleanName] = {

              id: quiz.id,

              name: cleanName,

              category,

              description:

                quiz.summary ||

                "AI generated learning subject from uploaded PDF.",

              total_questions: 0,

              total_pdfs: 0,

              quizzes: [],

              created_at:
                quiz.created_at,

              latest_score:
                quiz.score || 0,
            };
          }

          subjectMap[
            cleanName
          ].quizzes.push(quiz);

          subjectMap[
            cleanName
          ].total_questions +=

            quiz.total_questions || 0;

          subjectMap[
            cleanName
          ].total_pdfs += 1;
        });

        setSubjects(
          Object.values(subjectMap)
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    }

    fetchSubjects();

  }, [user]);

  // ================= TOTALS =================

  const totalQuestions =
    subjects.reduce(
      (total, item) =>

        total +
        item.total_questions,

      0
    );

  const totalPdfs =
    subjects.reduce(
      (total, item) =>

        total +
        item.total_pdfs,

      0
    );

  // ================= CATEGORY =================

  const categories = useMemo(() => {

    return [

      "All",

      ...new Set(

        subjects.map(
          (item) =>
            item.category
        )
      ),
    ];

  }, [subjects]);

  // ================= FILTER =================

  const filteredSubjects =
    subjects.filter((item) => {

      const matchesSearch =

        item.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =

        activeCategory === "All" ||

        item.category ===
          activeCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="subjects-loading">

        <div className="subjects-loader"></div>

        <h1>
          Loading AI Subjects...
        </h1>

      </div>
    );
  }

  // ================= PAGE =================

  return (

    <div className="subjects-page">

      {/* ================= HERO ================= */}

      <div className="subjects-hero">

        <div className="hero-overlay"></div>

        <div className="subjects-hero-left">

          <div className="subjects-badge">

            AI LEARNING PLATFORM

          </div>

          <h1>

            Smart AI Study Subjects

          </h1>

          <p>

            Upload PDFs and instantly transform them into
            intelligent learning experiences with quizzes,
            summaries, flashcards, analytics, and practice modes.

          </p>

          <div className="hero-buttons">

            <button className="hero-btn-primary">

              Explore Subjects

            </button>

            <button className="hero-btn-secondary">

              AI Powered

            </button>

          </div>

        </div>

        {/* ================= HERO RIGHT ================= */}

        <div className="subjects-hero-right">

          <div className="hero-stat-box">

            <h2>
              {subjects.length}
            </h2>

            <p>
              Subjects
            </p>

          </div>

          <div className="hero-stat-box">

            <h2>
              {totalQuestions}
            </h2>

            <p>
              Questions
            </p>

          </div>

          <div className="hero-stat-box">

            <h2>
              {totalPdfs}
            </h2>

            <p>
              PDFs
            </p>

          </div>

        </div>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="subjects-search-wrapper">

        <div className="subjects-search">

          <input
            type="text"
            placeholder="Search AI subjects..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

      </div>

      {/* ================= CATEGORY ================= */}

      <div className="subjects-categories">

        {
          categories.map(
            (category) => (

              <button
                key={category}
                className={
                  activeCategory === category

                    ? "category-btn active-category"

                    : "category-btn"
                }
                onClick={() =>
                  setActiveCategory(
                    category
                  )
                }
              >

                {category}

              </button>
            )
          )
        }

      </div>

      {/* ================= INFO BAR ================= */}

      <div className="subjects-info-bar">

        <div>

          <h3>

            {
              filteredSubjects.length
            }
            {" "}
            Subjects Found

          </h3>

          <p>

            Browse your AI generated learning materials

          </p>

        </div>

      </div>

      {/* ================= GRID ================= */}

      <div className="subjects-grid">

        {
          filteredSubjects.length > 0 ? (

            filteredSubjects.map(
              (subject) => (

                <SubjectCard
                  key={subject.name}
                  subject={subject}
                />
              )
            )

          ) : (

            <div className="empty-subjects">

              <div className="empty-icon">

                📚

              </div>

              <h2>
                No Subjects Yet
              </h2>

              <p>

                Upload PDFs to automatically create
                AI-powered learning subjects.

              </p>

            </div>
          )
        }

      </div>

    </div>
  );
}

export default Subjects;