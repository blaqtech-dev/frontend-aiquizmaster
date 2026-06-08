import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/authcontext/authcontext";
import { logoutUser } from "../../services/authservice/authservice";
import { supabase } from "../../services/supabase/supabase";

import "./dashboard.css";

export function DashboardPage() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [role, setRole] = useState("");

  const [plan, setPlan] =
useState("free");

  const [loading, setLoading] = useState(true);

  const [totalQuizzes, setTotalQuizzes] = useState(0);

  const [totalSubjects, setTotalSubjects] = useState(0);

  const [averageScore, setAverageScore] = useState(0);

  const [recentAttempts, setRecentAttempts] = useState([]);

  const [recentQuizzes, setRecentQuizzes] = useState([]);

  const [topSubjects, setTopSubjects] = useState([]);

  const [leaderboard, setLeaderboard] = useState([]);const [pdfCount, setPdfCount] =
  useState(0);

const [questionCount, setQuestionCount] =
  useState(0);

const [imageCount, setImageCount] =
  useState(0);

  useEffect(() => {

    async function loadDashboard() {

      if (!user) return;

 



const savedPdfCount =
  Number(
    localStorage.getItem(
      `pdfCount-${user.id}`
    )
  ) || 0;

const savedQuestionCount =
  Number(
    localStorage.getItem(
      `questionCount-${user.id}`
    )
  ) || 0;

const savedImageCount =
  Number(
    localStorage.getItem(
      `imageCount-${user.id}`
    )
  ) || 0;

setPdfCount(savedPdfCount);

setQuestionCount(
  savedQuestionCount
);

setImageCount(
  savedImageCount
);

      try {

        setLoading(true);

        /* PROFILE */

      const {
  data: profileData,
  error: profileError,
} =
  await supabase

   .from("profiles")
.select("role, plan")

    .eq("id", user.id)

    .maybeSingle();

console.log(profileData);
console.log(profileError);

if (!profileData) {

  navigate("/select-role");

  return;
}

setRole(
  profileData?.role || ""
);

setPlan(
  profileData?.plan || "free"
);

        /* QUIZZES */

        const { data: quizData } =
          await supabase

            .from("quizzes")

            .select("*")

            .eq("user_id", user.id)

            .order("created_at", {
              ascending: false,
            });

        /* ATTEMPTS */

        const { data: attemptData } =
          await supabase

            .from("quiz_attempts")

            .select("*")

            .eq("user_id", user.id)

            .order("created_at", {
              ascending: false,
            });

        /* SUBJECTS */

        const { data: subjectData } =
          await supabase

            .from("subjects")

            .select("*");

        /* LEADERBOARD */

        const { data: leaderboardData } =
          await supabase

            .from("quiz_attempts")

            .select("*")

            .order("percentage", {
              ascending: false,
            })

            .limit(5);

        setTotalQuizzes(
          quizData?.length || 0
        );

        setTotalSubjects(
          subjectData?.length || 0
        );

        setRecentAttempts(
          attemptData?.slice(0, 6) || []
        );

        setRecentQuizzes(
          quizData?.slice(0, 4) || []
        );

        setLeaderboard(
          leaderboardData || []
        );

        /* AVERAGE */

        const total =
          attemptData?.reduce(
            (acc, item) =>
              acc + (item.percentage || 0),
            0
          ) || 0;

        const avg =
          attemptData?.length > 0
            ? Math.round(
                total / attemptData.length
              )
            : 0;

        setAverageScore(avg);

        /* TOP SUBJECTS */

        const grouped = {};

        (attemptData || []).forEach((item) => {

          if (!grouped[item.subject]) {

            grouped[item.subject] = {
              subject: item.subject,
              total: 0,
              count: 0,
            };
          }

          grouped[item.subject].total +=
            item.percentage || 0;

          grouped[item.subject].count += 1;
        });

        const ranked =
          Object.values(grouped)

            .map((item) => ({
              ...item,
              average: Math.round(
                item.total / item.count
              ),
            }))

            .sort(
              (a, b) =>
                b.average - a.average
            )

            .slice(0, 4);

        setTopSubjects(ranked);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    }

    loadDashboard();

  }, [user]);

  async function handleLogout() {

    await logoutUser();

    navigate("/");
  }

  if (loading) {

    return (

      <div className="dashboard-loading">

        <div className="loader"></div>

        <h2>
          Loading Dashboard...
        </h2>

      </div>
    );
  }

  return (

    <div className="dashboard-page">

      {/* ================= NAVBAR ================= */}

      <header className="dashboard-navbar">

        <div className="dashboard-logo">
          AI QuizMaster
        </div>

        <nav className="dashboard-nav-links">

          <Link to="/subjects">
            Subjects
          </Link>

          <Link to="/upload">
            Upload
          </Link>

          <Link to="/leaderboard">
            Leaderboard
          </Link>

          <Link to="/profile">
            Profile
          </Link>

        </nav>

        <div className="dashboard-user">

          <div className="user-avatar">

            {
              user?.email
                ?.charAt(0)
                .toUpperCase()
            }

          </div>

          <div className="user-details">

            <span>
              Logged In
            </span>

            <p>
              {user?.email}
            </p>

          </div>

        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="dashboard-container">

        {/* ================= HERO ================= */}

        <section className="dashboard-hero">

          <div className="hero-left">

            <div className="hero-badge">
              AI POWERED LEARNING
            </div>

            <h4 className="welcome-text">

              Welcome back,
              {" "}
              {
                user?.email?.split("@")[0]
              }

            </h4>

            <h1>
              Learn Smarter With AI Quiz Platform
            </h1>

            <p>

              Upload study PDFs,
              generate AI quizzes,
              revise with flashcards,
              and monitor your learning progress
              with real-time analytics.

            </p>

            <div className="hero-buttons">

              <Link to="/upload">

                <button className="dashboard-btn primary-btn">

                  Upload PDF

                </button>

              </Link>

              <Link to="/subjects">

                <button className="dashboard-btn secondary-btn">

                  Explore Subjects

                </button>

              </Link>

            </div>

            <div className="hero-role-access">

              {
                role === "teacher" && (

                  <Link to="/teacher-dashboard" className='open-teacher'>

                    Open Teacher Dashboard →

                  </Link>
                )
              }

              {
                role === "student" && (

                  <Link to="/student-dashboard"  className='open-student'>

                    Open Student Dashboard →

                  </Link>
                )
              }

            </div>

          </div>

          <div className="hero-right">

            <div className="hero-card">

              <h2>
                Platform Features
              </h2>

              <div className="hero-features">

                <div>
                  AI Quiz Generator
                </div>

                <div>
                  PDF Learning
                </div>

                <div>
                  Flashcards
                </div>

                <div>
                  Multiplayer Quiz
                </div>

                <div>
                  Classroom LMS
                </div>

                <div>
                  Analytics Tracking
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================= STATS ================= */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <h2>
              {totalQuizzes}
            </h2>

            <p>
              Uploaded PDFs
            </p>

          </div>

          <div className="stat-card">

            <h2>
              {averageScore}%
            </h2>

            <p>
              Average Score
            </p>

          </div>

          <div className="stat-card">

            <h2>
              {totalSubjects}
            </h2>

            <p>
              Subjects
            </p>

          </div>

          <div className="stat-card">

            <h2>
              {recentAttempts.length}
            </h2>

            <p>
              Quiz Attempts
            </p>

          </div>

        </section>



        <section className="dashboard-plan">

  <div className="plan-card">

    <h3>Current Plan</h3>

    <h1>

      {plan === "pro"
        ? "PRO"
        : "FREE"}

    </h1>

    <p>

      {
        plan === "pro"

          ? "Unlimited access enabled."

          : "Upgrade to unlock unlimited AI features."
      }

    </p>

    {
      plan !== "pro" && (

        <button
          onClick={() =>
            navigate("/upgrade")
          }
        >

          Upgrade Now

        </button>
      )
    }

  </div>

</section>

{
  plan !== "pro" && (

    <section className="usage-section">

      <div className="usage-card">

        <h2>
          Free Plan Usage
        </h2>

        <p>
          Monitor your remaining AI credits.
        </p>

        {/* PDF */}

        <div className="usage-item">

          <div className="usage-top">

            <span>
              PDF Uploads
            </span>

            <span>
              {pdfCount}/15
            </span>

          </div>

          <div className="usage-bar">

            <div
              className="usage-fill pdf"
              style={{
                width: `${
                  (pdfCount / 15) * 100
                }%`,
              }}
            />

          </div>

        </div>

        {/* AI Tutor */}

        <div className="usage-item">

          <div className="usage-top">

            <span>
              AI Questions
            </span>

            <span>
              {questionCount}/15
            </span>

          </div>

          <div className="usage-bar">

            <div
              className="usage-fill ai"
              style={{
                width: `${
                  (questionCount / 15) * 100
                }%`,
              }}
            />

          </div>

        </div>

        {/* IMAGE */}

        <div className="usage-item">

          <div className="usage-top">

            <span>
              Image Analysis
            </span>

            <span>
              {imageCount}/10
            </span>

          </div>

          <div className="usage-bar">

            <div
              className="usage-fill image"
              style={{
                width: `${
                  (imageCount / 10) * 100
                }%`,
              }}
            />

          </div>

        </div>

        <button
          className="usage-upgrade-btn"
          onClick={() =>
            navigate("/upgrade")
          }
        >

          Upgrade To Pro

        </button>

      </div>

    </section>
  )
}

        {/* ================= QUICK ACTIONS ================= */}

        <section className="dashboard-section">

          <div className="section-top">

            <h2>
              Quick Actions
            </h2>

          </div>

          <div className="quick-actions-grid">

            <Link
              to="/upload"
              className="quick-action-card"
            >

              <div className="quick-icon">
                📄
              </div>

              <h3>
                Upload PDF
              </h3>

              <p>
                Generate quizzes instantly
              </p>

            </Link>

            <Link
              to="/subjects"
              className="quick-action-card"
            >

              <div className="quick-icon">
                📚
              </div>

              <h3>
                Browse Subjects
              </h3>

              <p>
                Explore all subjects
              </p>

            </Link>

            <Link
              to="/leaderboard"
              className="quick-action-card"
            >

              <div className="quick-icon">
                🏆
              </div>

              <h3>
                Leaderboard
              </h3>

              <p>
                Compete globally
              </p>

            </Link>

            <Link
              to="/profile"
              className="quick-action-card"
            >

              <div className="quick-icon">
                👤
              </div>

              <h3>
                Profile
              </h3>

              <p>
                Manage your account
              </p>

            </Link>

            {
              role === "teacher" && (

                <Link
                  to="/teacher-dashboard"
                  className="quick-action-card"
                >

                  <div className="quick-icon">
                    👨‍🏫
                  </div>

                  <h3>
                    Teacher Dashboard
                  </h3>

                  <p>
                    Manage classrooms
                  </p>

                </Link>
              )
            }

            {
              role === "student" && (

                <Link
                  to="/student-dashboard"
                  className="quick-action-card"
                >

                  <div className="quick-icon">
                    🎓
                  </div>

                  <h3>
                    Student Dashboard
                  </h3>

                  <p>
                    Continue learning
                  </p>

                </Link>
              )
            }

          </div>

        </section>

        {/* ================= TEACHER TOOLS ================= */}

        {
          role === "teacher" && (

            <section className="dashboard-section">

              <div className="section-top">

                <h2>
                  Teacher Tools
                </h2>

              </div>

              <div className="quick-actions-grid">

                <Link
                  to="/create-classroom"
                  className="quick-action-card"
                >

                  <div className="quick-icon">
                    🏫
                  </div>

                  <h3>
                    Create Classroom
                  </h3>

                  <p>
                    Start teaching students
                  </p>

                </Link>

                <Link
                  to="/create-assignment"
                  className="quick-action-card"
                >

                  <div className="quick-icon">
                    📝
                  </div>

                  <h3>
                    Create Assignment
                  </h3>

                  <p>
                    Give students tasks
                  </p>

                </Link>

              </div>

            </section>
          )
        }

        {/* ================= ANALYTICS ================= */}

        <section className="dashboard-section">

          <div className="section-top">

            <h2>
              Learning Analytics
            </h2>

          </div>

          <div className="analytics-grid">

            <div className="analytics-card">

              <h3>
                Quiz Accuracy
              </h3>

              <div className="analytics-progress">

                <div
                  className="analytics-fill"
                  style={{
                    width: `${averageScore}%`
                  }}
                ></div>

              </div>

              <span>
                {averageScore}% Accuracy
              </span>

            </div>

            <div className="analytics-card">

              <h3>
                Study Consistency
              </h3>

              <div className="analytics-progress">

                <div
                  className="analytics-fill consistency"
                  style={{
                    width: `${Math.min(
                      recentAttempts.length * 10,
                      100
                    )}%`
                  }}
                ></div>

              </div>

              <span>
                {recentAttempts.length} Attempts
              </span>

            </div>

            <div className="analytics-card">

              <h3>
                Subject Coverage
              </h3>

              <div className="analytics-progress">

                <div
                  className="analytics-fill subjects"
                  style={{
                    width: `${Math.min(
                      totalSubjects * 15,
                      100
                    )}%`
                  }}
                ></div>

              </div>

              <span>
                {totalSubjects} Subjects
              </span>

            </div>

          </div>

        </section>

        {/* ================= TOP SUBJECTS ================= */}

        <section className="dashboard-section">

          <div className="section-top">

            <h2>
              Top Subjects
            </h2>

          </div>

          <div className="subject-performance-grid">

            {
              topSubjects.map((item, index) => (

                <div
                  key={index}
                  className="performance-card"
                >

                  <h3>
                    {item.subject}
                  </h3>

                  <h1>
                    {item.average}%
                  </h1>

                  <p>
                    Average Performance
                  </p>

                </div>
              ))
            }

          </div>

        </section>

        {/* ================= RECENT QUIZZES ================= */}

        <section className="dashboard-section">

          <div className="section-top">

            <h2>
              Recent Quizzes
            </h2>

          </div>

          <div className="recent-grid">

            {
              recentQuizzes.map((quiz) => (

                <div
                  key={quiz.id}
                  className="recent-card"
                >

                  <h3>
                    {quiz.title || "Untitled Quiz"}
                  </h3>

                  <p>
                    Subject:
                    {" "}
                    {quiz.subject || "General"}
                  </p>

                </div>
              ))
            }

          </div>

        </section>

        {/* ================= LEADERBOARD ================= */}

        <section className="dashboard-section">

          <div className="section-top">

            <h2>
              Top Leaderboard
            </h2>

          </div>

          <div className="leaderboard-grid">

            {
              leaderboard.map((item, index) => (

                <div
                  key={item.id}
                  className="leaderboard-card"
                >

                  <div className="leaderboard-rank">

                    #
                    {index + 1}

                  </div>

                  <div className="leaderboard-user">

                    <h3>
                      {item.subject}
                    </h3>

                    <p>
                      Quiz Attempt
                    </p>

                  </div>

                  <div className="leaderboard-score">

                    {item.percentage}%

                  </div>

                </div>
              ))
            }

          </div>

        </section>

        {/* ================= FOOTER ================= */}

        <footer className="dashboard-footer">

          <p>
            AI QuizMaster © 2026
          </p>

          <button
            className="logout-button"
            onClick={handleLogout}
          >

            Logout

          </button>

        </footer>

      </main>

    </div>
  );
}