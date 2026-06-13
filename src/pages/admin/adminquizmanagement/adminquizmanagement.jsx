import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./adminquiz.css";

export function AdminQuizManagement() {

  const [loading, setLoading] =
    useState(true);

  const [quizzes, setQuizzes] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [filtered, setFiltered] =
    useState([]);

  const [stats, setStats] =
    useState({
      totalPdfs: 0,
      totalAttempts: 0,
      averageScore: 0,
      totalSubjects: 0,
    });

  const [selectedQuiz, setSelectedQuiz] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {

    const result =
      quizzes.filter((quiz) =>

        quiz.pdf_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||

        quiz.subject
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||

        quiz.subject_name
          ?.toLowerCase()
          .includes(search.toLowerCase())

      );

    setFiltered(result);

  }, [search, quizzes]);

  async function loadQuizzes() {

    try {

      setLoading(true);

      const {
        data: quizzesData
      } = await supabase

        .from("quizzes")

        .select("*")

        .order(
          "created_at",
          { ascending: false }
        );

      const {
        data: attemptsData
      } = await supabase

        .from("quiz_attempts")

        .select("*");

      const totalAttempts =
        attemptsData?.length || 0;

      const averageScore =
        totalAttempts > 0
          ? Math.round(
              attemptsData.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.percentage || 0
                  ),
                0
              ) / totalAttempts
            )
          : 0;

      const subjects =
        new Set(
          quizzesData?.map(
            (q) =>
              q.subject ||
              q.subject_name
          )
        );

      setStats({
        totalPdfs:
          quizzesData?.length || 0,

        totalAttempts,

        averageScore,

        totalSubjects:
          subjects.size,
      });

      setQuizzes(
        quizzesData || []
      );

      setFiltered(
        quizzesData || []
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  async function deleteQuiz(id) {

    const confirmDelete =
      window.confirm(
        "Delete this quiz permanently?"
      );

    if (!confirmDelete) return;

    const { error } =
      await supabase

        .from("quizzes")

        .delete()

        .eq("id", id);

    if (!error) {

      alert("Quiz deleted");

      loadQuizzes();
    }
  }

  function viewQuiz(quiz) {

    setSelectedQuiz(quiz);

    setShowModal(true);
  }

  function closeModal() {

    setShowModal(false);

    setSelectedQuiz(null);
  }

  function downloadPdf(
    url,
    name
  ) {

    if (!url) {

      alert(
        "PDF URL not available"
      );

      return;
    }

    window.open(
      url,
      "_blank"
    );
  }

  if (loading) {

    return (

      <div className="adminquiz-loading">

        <div className="adminquiz-loader"></div>

        <h2>
          Loading Quiz Data...
        </h2>

      </div>
    );
  }

  return (

    <div className="adminquiz-page">

      <div className="adminquiz-header">

        <span className="adminquiz-badge">
          QUIZ MANAGEMENT
        </span>

        <h1>
          Manage Platform Quizzes
        </h1>

        <p>
          Monitor uploads, subjects,
          quiz activity and performance.
        </p>

      </div>

      {/* STATS */}

      <div className="adminquiz-stats">

        <div className="adminquiz-card">

          <h2>
            {stats.totalPdfs}
          </h2>

          <p>
            Total PDFs
          </p>

        </div>

        <div className="adminquiz-card">

          <h2>
            {stats.totalSubjects}
          </h2>

          <p>
            Subjects
          </p>

        </div>

        <div className="adminquiz-card">

          <h2>
            {stats.totalAttempts}
          </h2>

          <p>
            Quiz Attempts
          </p>

        </div>

        <div className="adminquiz-card">

          <h2>
            {stats.averageScore}%
          </h2>

          <p>
            Average Score
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="adminquiz-search">

        <input
          type="text"
          placeholder="Search subject or PDF..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      {/* TABLE */}

      <div className="adminquiz-table-wrapper">

        <table>

          <thead>

            <tr>

              <th>
                PDF Name
              </th>

              <th>
                Subject
              </th>

              <th>
                Difficulty
              </th>

              <th>
                Created
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.map(
              (quiz) => (

                <tr
                  key={quiz.id}
                >

                  <td>
                    {quiz.pdf_name}
                  </td>

                  <td>
                    {quiz.subject ||
                      quiz.subject_name ||
                      "N/A"}
                  </td>

                  <td>
                    {quiz.difficulty ||
                      "Easy"}
                  </td>

                  <td>

                    {new Date(
                      quiz.created_at
                    ).toLocaleDateString()}

                  </td>

                  <td>

                    <div className="quiz-actions">

                      <button
                        className="view-btn"
                        onClick={() =>
                          viewQuiz(
                            quiz
                          )
                        }
                      >
                        View
                      </button>

                      <button
                        className="download-btn"
                        onClick={() =>
                          downloadPdf(
                            quiz.pdf_url,
                            quiz.pdf_name
                          )
                        }
                      >
                        Download
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

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

      {showModal &&
        selectedQuiz && (

        <div
          className="quiz-modal-overlay"
          onClick={
            closeModal
          }
        >

          <div
            className="quiz-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="quiz-modal-header">

              <h2>
                Quiz Details
              </h2>

              <button
                className="close-modal"
                onClick={
                  closeModal
                }
              >
                ×
              </button>

            </div>

            <div className="quiz-modal-content">

              <p>

                <strong>
                  PDF:
                </strong>{" "}

                {
                  selectedQuiz.pdf_name
                }

              </p>

              <p>

                <strong>
                  Subject:
                </strong>{" "}

                {selectedQuiz.subject ||
                  selectedQuiz.subject_name ||
                  "N/A"}

              </p>

              <p>

                <strong>
                  Difficulty:
                </strong>{" "}

                {selectedQuiz.difficulty ||
                  "Easy"}

              </p>

              <p>

                <strong>
                  Created:
                </strong>{" "}

                {new Date(
                  selectedQuiz.created_at
                ).toLocaleString()}

              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}