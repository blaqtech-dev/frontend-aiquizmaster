import "./homepage.css";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState }
from "react";

import { supabase }
from "../../services/supabase/supabase";

import { useAuth }
from "../../context/authcontext/authcontext";

export function HomePage() {

  const {
    user,
    loading,
  } = useAuth();

  const navigate =
    useNavigate();

  const [role,
    setRole] =
    useState(null);

  const [roleLoading,
    setRoleLoading] =
    useState(true);

  // ================= GET USER ROLE =================

  useEffect(() => {

    if (user) {

      getRole();

    } else {

      setRole(null);

      setRoleLoading(false);
    }

  }, [user]);

  async function getRole() {

    try {

      setRoleLoading(true);

      const { data, error } =
        await supabase

          .from("profiles")

          .select("role")

          .eq("id", user.id)

          .maybeSingle();

      if (error) {

        console.log(error);

        setRole(null);

      } else {

        setRole(
          data?.role || null
        );
      }

    } catch (err) {

      console.log(err);

    } finally {

      setRoleLoading(false);
    }
  }

  // ================= SAFE ROUTING =================

  function handleProtectedNavigation(path) {

    if (!user) {

      navigate("/login");

      return;
    }

    // USER HAS NO ROLE YET

    if (!role) {

      navigate("/select-role");

      return;
    }

    navigate(path);
  }

  // ================= DASHBOARD ROUTING =================

  function handleDashboard() {

    if (!user) {

      navigate("/login");

      return;
    }

    if (!role) {

      navigate("/select-role");

      return;
    }

    if (role === "teacher") {

      navigate("/teacher-dashboard");

    } else {

      navigate("/student-dashboard");
    }
  }

  // ================= LOADING =================

  if (loading || roleLoading) {

    return (

      <div className="home-loading">

        <div className="home-loader"></div>

        <h1>
          Loading Platform...
        </h1>

      </div>
    );
  }

  return (

    <div className="homepage">

      {/* ================= HERO ================= */}

      <section className="hero-section">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="hero-badge">

            NEXT GENERATION AI LEARNING

          </div>

          <h1>

            Transform Any PDF Into

            <span>

              AI Powered Learning

            </span>

          </h1>

          <p>

            AI QuizMaster helps students and teachers
            learn smarter using artificial intelligence,
            multiplayer quizzes,
            classroom systems,
            analytics,
            AI tutoring,
            and intelligent PDF learning.

          </p>

          {/* ================= USER ================= */}

          {
            user && (

              <div className="welcome-user">

                Welcome back

                <span>

                  {
                    user.user_metadata?.username ||

                    user.email
                  }

                </span>

              </div>
            )
          }

          {/* ================= HERO BUTTONS ================= */}

          <div className="hero-buttons">

            {
              !user && (

                <>

                  <Link to="/register">

                    <button className="primary-btn">

                      Start Learning

                    </button>

                  </Link>

                  <Link to="/login">

                    <button className="secondary-btn">

                      Login

                    </button>

                  </Link>

                </>
              )
            }

            {
              user && (

                <>

                  <button
                    className="primary-btn"
                    onClick={handleDashboard}
                  >

                    Continue Learning

                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() =>

                      handleProtectedNavigation(
                        "/upload"
                      )
                    }
                  >

                    Upload PDF

                  </button>

                </>
              )
            }

          </div>

          {/* ================= HERO STATS ================= */}

          <div className="hero-stats">

            <div className="hero-stat">

              <h2>
                AI
              </h2>

              <p>
                Smart Quiz Generation
              </p>

            </div>

            <div className="hero-stat">

              <h2>
                LMS
              </h2>

              <p>
                Classroom Management
              </p>

            </div>

            <div className="hero-stat">

              <h2>
                LIVE
              </h2>

              <p>
                Multiplayer Quiz Battles
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= PLATFORM STATS ================= */}

<section className="platform-stats">

  <div className="section-title">

    <h1>

      Trusted By Modern Learners

    </h1>

    <p>

      AIQuizMaster combines artificial intelligence,
      classroom management, quiz generation,
      analytics and tutoring into one powerful platform.

    </p>

  </div>

  <div className="stats-grid">

    <div className="stats-card">

      <h2>24/7</h2>

      <p>AI Learning Support</p>

    </div>

    <div className="stats-card">

      <h2>100%</h2>

      <p>AI Generated Quizzes</p>

    </div>

    <div className="stats-card">

      <h2>Unlimited</h2>

      <p>Study Opportunities</p>

    </div>

    <div className="stats-card">

      <h2>Smart</h2>

      <p>Learning Analytics</p>

    </div>

  </div>

</section>



{/* ================= WHY AIQUIZMASTER ================= */}

<section className="why-section">

  <div className="section-title">

    <h1>

      Why Students Love AIQuizMaster

    </h1>

    <p>

      Traditional studying can be boring and ineffective.
      AIQuizMaster transforms every PDF into a complete
      interactive learning experience.

    </p>

  </div>

  <div className="why-grid">

    <div className="why-card">

      <div className="why-icon">
        📄
      </div>

      <h2>

        Upload Any PDF

      </h2>

      <p>

        Upload lecture notes,
        textbooks,
        assignments,
        handouts,
        research materials,
        and study documents.

      </p>

    </div>

    <div className="why-card">

      <div className="why-icon">
        🤖
      </div>

      <h2>

        AI Generates Everything

      </h2>

      <p>

        Automatically generate quizzes,
        flashcards,
        summaries,
        explanations,
        and learning resources.

      </p>

    </div>

    <div className="why-card">

      <div className="why-icon">
        🧠
      </div>

      <h2>

        Learn Faster

      </h2>

      <p>

        Study smarter using AI-powered
        learning tools designed to improve
        retention and performance.

      </p>

    </div>

    <div className="why-card">

      <div className="why-icon">
        📊
      </div>

      <h2>

        Track Progress

      </h2>

      <p>

        View detailed learning analytics,
        quiz performance,
        progress reports,
        and achievements.

      </p>

    </div>

  </div>

</section>




{/* ================= STUDENT FEATURES ================= */}

<section className="student-features">

  <div className="section-title">

    <h1>

      Everything A Student Needs

    </h1>

    <p>

      One platform for studying,
      revision,
      testing,
      collaboration,
      and AI assistance.

    </p>

  </div>

  <div className="student-grid">

    <div className="student-card">

      <span>📚</span>

      <h2>

        Study Mode

      </h2>

      <p>

        Learn concepts before attempting quizzes.

      </p>

    </div>

    <div className="student-card">

      <span>📝</span>

      <h2>

        AI Quiz Generator

      </h2>

      <p>

        Create quizzes instantly from PDFs.

      </p>

    </div>

    <div className="student-card">

      <span>🧠</span>

      <h2>

        Flashcards

      </h2>

      <p>

        Revise key concepts using generated flashcards.

      </p>

    </div>

    <div className="student-card">

      <span>📄</span>

      <h2>

        AI Summaries

      </h2>

      <p>

        Understand long documents quickly.

      </p>

    </div>

    <div className="student-card">

      <span>🤖</span>

      <h2>

        AI Tutor

      </h2>

      <p>

        Ask questions and get instant explanations.

      </p>

    </div>

    <div className="student-card">

      <span>🖼️</span>

      <h2>

        Image AI Tutor

      </h2>

      <p>

        Learn visually with AI image explanations.

      </p>

    </div>

    <div className="student-card">

      <span>🏆</span>

      <h2>

        Leaderboard

      </h2>

      <p>

        Compete with other learners.

      </p>

    </div>

    <div className="student-card">

      <span>🎮</span>

      <h2>

        Multiplayer Quiz

      </h2>

      <p>

        Challenge friends in real-time quiz battles.

      </p>

    </div>

  </div>

</section>

      {/* ================= FEATURES ================= */}

      <section className="overview-section">

        <div className="section-title">

          <h1>

            Everything Needed For Smart Learning

          </h1>

          <p>

            Built for modern students and teachers
            with AI powered educational tools.

          </p>

        </div>

        <div className="overview-grid">

          <div className="overview-card">

            <div className="overview-icon">
              📄
            </div>

            <h2>
              PDF Learning
            </h2>

            <p>

              Upload study documents,
              textbooks,
              lecture notes,
              and PDFs.

            </p>

          </div>

          <div className="overview-card">

            <div className="overview-icon">
              🤖
            </div>

            <h2>
              AI Quiz System
            </h2>

            <p>

              Generate intelligent quiz questions
              instantly from PDFs.

            </p>

          </div>

          <div className="overview-card">

            <div className="overview-icon">
              🎓
            </div>

            <h2>
              Student Dashboard
            </h2>

            <p>

              Track progress,
              join classrooms,
              and monitor performance.

            </p>

          </div>

          <div className="overview-card">

            <div className="overview-icon">
              👨‍🏫
            </div>

            <h2>
              Teacher Dashboard
            </h2>

            <p>

              Create classrooms,
              assignments,
              and manage students.

            </p>

          </div>

          <div className="overview-card">

            <div className="overview-icon">
              🎮
            </div>

            <h2>
              Multiplayer Battles
            </h2>

            <p>

              Challenge friends in live realtime quiz competitions.

            </p>

          </div>

          <div className="overview-card">

            <div className="overview-icon">
              📊
            </div>

            <h2>
              Analytics
            </h2>

            <p>

              Monitor learning progress
              using smart analytics.

            </p>

          </div>

        </div>

      </section>



      {/* ================= TEACHER FEATURES ================= */}

<section className="teacher-features">

  <div className="section-title">

    <h1>

      Built For Teachers

    </h1>

    <p>

      AIQuizMaster provides powerful classroom
      management tools that help teachers
      organize learning, track progress,
      create assignments, and support students.

    </p>

  </div>

  <div className="teacher-grid">

    <div className="teacher-card">

      <div className="teacher-icon">
        👨‍🏫
      </div>

      <h2>

        Teacher Dashboard

      </h2>

      <p>

        Manage classes,
        assignments,
        quizzes,
        and student performance.

      </p>

    </div>

    <div className="teacher-card">

      <div className="teacher-icon">
        🏫
      </div>

      <h2>

        Create Classrooms

      </h2>

      <p>

        Create virtual classrooms
        and organize students easily.

      </p>

    </div>

    <div className="teacher-card">

      <div className="teacher-icon">
        🔑
      </div>

      <h2>

        Class Codes

      </h2>

      <p>

        Students can join classes
        using simple classroom codes.

      </p>

    </div>

    <div className="teacher-card">

      <div className="teacher-icon">
        📢
      </div>

      <h2>

        Post Updates

      </h2>

      <p>

        Send announcements,
        reminders,
        and learning updates.

      </p>

    </div>

    <div className="teacher-card">

      <div className="teacher-icon">
        📚
      </div>

      <h2>

        Assignments

      </h2>

      <p>

        Create assignments
        with deadlines and instructions.

      </p>

    </div>

    <div className="teacher-card">

      <div className="teacher-icon">
        ✅
      </div>

      <h2>

        Grade Students

      </h2>

      <p>

        Review submissions
        and provide feedback.

      </p>

    </div>

  </div>

</section>





{/* ================= CLASSROOM WORKFLOW ================= */}

<section className="workflow-section">

  <div className="section-title">

    <h1>

      Classroom Workflow

    </h1>

    <p>

      From classroom creation to assignment grading,
      everything happens in one platform.

    </p>

  </div>

  <div className="workflow-grid">

    <div className="workflow-card">

      <div className="workflow-number">
        1
      </div>

      <h2>

        Create Classroom

      </h2>

      <p>

        Teachers create classrooms
        and generate class codes.

      </p>

    </div>

    <div className="workflow-card">

      <div className="workflow-number">
        2
      </div>

      <h2>

        Students Join

      </h2>

      <p>

        Students join instantly
        using the classroom code.

      </p>

    </div>

    <div className="workflow-card">

      <div className="workflow-number">
        3
      </div>

      <h2>

        Create Assignment

      </h2>

      <p>

        Teachers publish assignments
        and study activities.

      </p>

    </div>

    <div className="workflow-card">

      <div className="workflow-number">
        4
      </div>

      <h2>

        Submit Work

      </h2>

      <p>

        Students complete
        and submit assignments.

      </p>

    </div>

    <div className="workflow-card">

      <div className="workflow-number">
        5
      </div>

      <h2>

        Grade & Review

      </h2>

      <p>

        Teachers evaluate performance
        and provide feedback.

      </p>

    </div>

  </div>

</section>



{/* ================= AI LEARNING ECOSYSTEM ================= */}

<section className="ecosystem-section">

  <div className="ecosystem-left">

    <span className="ecosystem-badge">

      AI LEARNING ECOSYSTEM

    </span>

    <h1>

      One Upload.
      Multiple Learning Tools.

    </h1>

    <p>

      Upload a single PDF and unlock
      a complete AI learning experience.

      AIQuizMaster transforms study materials
      into quizzes,
      summaries,
      flashcards,
      tutoring sessions,
      and performance analytics.

    </p>

  </div>

  <div className="ecosystem-right">

    <div className="ecosystem-item">

      📄 Upload PDF

    </div>

    <div className="ecosystem-item">

      🤖 Generate Quiz

    </div>

    <div className="ecosystem-item">

      🧠 Generate Flashcards

    </div>

    <div className="ecosystem-item">

      📄 AI Summary

    </div>

    <div className="ecosystem-item">

      💬 AI Tutor

    </div>

    <div className="ecosystem-item">

      📊 Analytics

    </div>

  </div>

</section>




{/* ================= AI TUTOR SHOWCASE ================= */}

<section className="tutor-showcase">

  <div className="tutor-content">

    <div className="tutor-tag">

      AI POWERED TUTORING

    </div>

    <h1>

      Meet Your Personal AI Tutor

    </h1>

    <p>

      Ask questions about your study materials,
      receive explanations,
      solve difficult concepts,
      and improve understanding instantly.

    </p>

    <div className="tutor-benefits">

      <div>
        ✓ Instant Answers
      </div>

      <div>
        ✓ Concept Explanations
      </div>

      <div>
        ✓ Homework Support
      </div>

      <div>
        ✓ Exam Preparation
      </div>

    </div>

    <button
      className="primary-btn"
      onClick={() =>
        handleProtectedNavigation(
          "/ai-tutor"
        )
      }
    >

      Open AI Tutor

    </button>

  </div>

</section>




{/* ================= IMAGE AI TUTOR ================= */}

<section className="image-ai-section">

  <div className="image-ai-left">

    <div className="image-ai-tag">

      VISUAL LEARNING

    </div>

    <h1>

      Learn Through Images

    </h1>

    <p>

      Upload educational images,
      diagrams,
      charts,
      graphs,
      screenshots,
      and visual materials.

      The AI explains everything
      step-by-step.

    </p>

    <button
      className="primary-btn"
      onClick={() =>
        handleProtectedNavigation(
          "/imagetutor"
        )
      }
    >

      Open Image Tutor

    </button>

  </div>

  <div className="image-ai-right">

    <div className="image-feature">

      📊 Charts

    </div>

    <div className="image-feature">

      🧬 Biology Diagrams

    </div>

    <div className="image-feature">

      📈 Graphs

    </div>

    <div className="image-feature">

      ⚛ Physics Illustrations

    </div>

    <div className="image-feature">

      📚 Educational Images

    </div>

  </div>

</section>


      {/* ================= HOW IT WORKS ================= */}

      <section className="how-section">

        <div className="section-title">

          <h1>

            How It Works

          </h1>

        </div>

        <div className="steps-grid">

          <div className="step-card">

            <div className="step-number">
              1
            </div>

            <h2>
              Register
            </h2>

            <p>

              Create an account
              and login.

            </p>

          </div>

          <div className="step-card">

            <div className="step-number">
              2
            </div>

            <h2>
              Select Role
            </h2>

            <p>

              Continue as a student
              or teacher.

            </p>

          </div>

          <div className="step-card">

            <div className="step-number">
              3
            </div>

            <h2>
              Upload PDFs
            </h2>

            <p>

              Upload study materials
              and generate quizzes.

            </p>

          </div>

          <div className="step-card">

            <div className="step-number">
              4
            </div>

            <h2>
              Start Learning
            </h2>

            <p>

              Practice quizzes,
              compete,
              and improve.

            </p>

          </div>

        </div>

      </section>

      {/* ================= AI SECTION ================= */}

      <section className="ai-section">

        <div className="ai-left">

          <div className="ai-tag">

            AI LEARNING SYSTEM

          </div>

          <h1>

            Your Personal AI Tutor

          </h1>

          <p>

            Ask AI questions from PDFs,
            explain difficult concepts,
            generate flashcards,
            and improve faster.

          </p>

          <button
            className="primary-btn"
            onClick={() =>

              handleProtectedNavigation(
                "/ai-tutor"
              )
            }
          >

            Open AI Tutor

          </button>

        </div>

      </section>


      {/* ================= STUDENT FEATURES ================= */}

<section className="student-features">

  <div className="section-title">

    <h1>
      Built For Students
    </h1>

    <p>

      Everything students need
      to study faster,
      remember more,
      and improve performance.

    </p>

  </div>

  <div className="student-grid">

    <div className="student-card">

      <div className="student-icon">
        📚
      </div>

      <h2>
        AI Study Mode
      </h2>

      <p>

        Learn chapter by chapter,
        review key concepts,
        and study efficiently.

      </p>

    </div>

    <div className="student-card">

      <div className="student-icon">
        📝
      </div>

      <h2>
        Practice Quizzes
      </h2>

      <p>

        Generate unlimited quiz
        questions from uploaded PDFs.

      </p>

    </div>

    <div className="student-card">

      <div className="student-icon">
        🧠
      </div>

      <h2>
        Flashcards
      </h2>

      <p>

        Automatically create
        revision flashcards from notes.

      </p>

    </div>

    <div className="student-card">

      <div className="student-icon">
        📊
      </div>

      <h2>
        Analytics
      </h2>

      <p>

        Track strengths,
        weaknesses,
        scores and progress.

      </p>

    </div>

  </div>

</section>




{/* ================= TEACHER FEATURES ================= */}

<section className="teacher-features">

  <div className="section-title">

    <h1>
      Built For Teachers
    </h1>

    <p>

      Manage classrooms,
      assignments,
      students and learning activities.

    </p>

  </div>

  <div className="teacher-grid">

    <div className="teacher-card">

      <div className="teacher-icon">
        👨‍🏫
      </div>

      <h2>
        Create Classrooms
      </h2>

      <p>

        Create virtual classrooms
        and invite students using
        class codes.

      </p>

    </div>

    <div className="teacher-card">

      <div className="teacher-icon">
        📋
      </div>

      <h2>
        Assignments
      </h2>

      <p>

        Create and distribute
        assignments with deadlines.

      </p>

    </div>

    <div className="teacher-card">

      <div className="teacher-icon">
        🏆
      </div>

      <h2>
        Grade Students
      </h2>

      <p>

        Review submissions
        and monitor student performance.

      </p>

    </div>

    <div className="teacher-card">

      <div className="teacher-icon">
        📈
      </div>

      <h2>
        Performance Insights
      </h2>

      <p>

        Understand classroom
        progress through analytics.

      </p>

    </div>

  </div>

</section>



{/* ================= PLATFORM HIGHLIGHTS ================= */}

<section className="platform-highlights">

  <div className="section-title">

    <h1>
      Why AI QuizMaster?
    </h1>

  </div>

  <div className="highlights-grid">

    <div className="highlight-card">

      <h2>
        ⚡ Fast Learning
      </h2>

      <p>

        Turn large PDFs into
        quizzes, summaries and
        flashcards within seconds.

      </p>

    </div>

    <div className="highlight-card">

      <h2>
        🤖 AI Powered
      </h2>

      <p>

        Intelligent learning tools
        help students understand
        concepts faster.

      </p>

    </div>

    <div className="highlight-card">

      <h2>
        🎮 Interactive
      </h2>

      <p>

        Multiplayer quizzes make
        studying engaging and fun.

      </p>

    </div>

    <div className="highlight-card">

      <h2>
        ☁️ Cloud Based
      </h2>

      <p>

        Access your learning
        materials from anywhere.

      </p>

    </div>

  </div>

</section>



{/* ================= TESTIMONIALS ================= */}

<section className="testimonial-section">

  <div className="section-title">

    <h1>
      What Learners Love
    </h1>

    <p>

      Helping students and teachers
      become more productive.

    </p>

  </div>

  <div className="testimonial-grid">

    <div className="testimonial-card">

      <p>

        "The AI quiz generation
        feature saves me hours
        every week."

      </p>

      <h4>
        Student
      </h4>

    </div>

    <div className="testimonial-card">

      <p>

        "Creating classrooms and
        assignments has never
        been easier."

      </p>

      <h4>
        Teacher
      </h4>

    </div>

    <div className="testimonial-card">

      <p>

        "Flashcards and summaries
        helped me prepare for exams
        much faster."

      </p>

      <h4>
        Learner
      </h4>

    </div>

  </div>

</section>




{/* ================= FAQ ================= */}

<section className="faq-section">

  <div className="section-title">

    <h1>
      Frequently Asked Questions
    </h1>

  </div>

  <div className="faq-list">

    <div className="faq-item">

      <h3>
        Is AI QuizMaster free?
      </h3>

      <p>

        Yes. Users can start
        learning for free.
        Premium plans unlock
        advanced AI features.

      </p>

    </div>

    <div className="faq-item">

      <h3>
        Can teachers create classrooms?
      </h3>

      <p>

        Yes. Teachers can create
        classrooms, assignments
        and manage students.

      </p>

    </div>

    <div className="faq-item">

      <h3>
        Can students upload PDFs?
      </h3>

      <p>

        Yes. PDFs can be transformed
        into quizzes, flashcards,
        summaries and study materials.

      </p>

    </div>

    <div className="faq-item">

      <h3>
        Is multiplayer supported?
      </h3>

      <p>

        Yes. Students can compete
        in real-time quiz battles.

      </p>

    </div>

  </div>

</section>


{/* ================= PRICING ================= */}

<section className="pricing-section">

  <div className="section-title">

    <h1>
      Choose Your Learning Plan
    </h1>

    <p>

      Start for free and upgrade
      whenever you need more power.

    </p>

  </div>

  <div className="pricing-grid">

    {/* FREE */}

    <div className="pricing-card">

      <div className="plan-tag">

        FREE

      </div>

      <h2>

        Starter

      </h2>

      <h1>

        ₦0

      </h1>

      <p>

        Perfect for new learners.

      </p>

      <ul>

        <li>
          ✅ Upload PDFs
        </li>

        <li>
          ✅ AI Quiz Generation
        </li>

        <li>
          ✅ Flashcards
        </li>

        <li>
          ✅ Summaries
        </li>

        <li>
          ✅ Join Classrooms
        </li>

        <li>
          ✅ Leaderboard Access
        </li>

      </ul>

      <Link to="/register">

        <button className="pricing-btn">

          Get Started

        </button>

      </Link>

    </div>

    {/* PRO */}

    <div className="pricing-card featured-plan">

      <div className="popular-badge">

        MOST POPULAR

      </div>

      <div className="plan-tag">

        PREMIUM

      </div>

      <h2>

        AI QuizMaster Pro

      </h2>

      <h1>

        ₦2,000

      </h1>

      <span>

        per month

      </span>

      <p>

        Unlock the complete
        AI learning experience.

      </p>

      <ul>

        <li>
          ✅ Unlimited PDF Uploads
        </li>

        <li>
          ✅ Unlimited AI Tutor
        </li>

        <li>
          ✅ AI Image Tutor
        </li>

        <li>
          ✅ Advanced Analytics
        </li>

        <li>
          ✅ Faster Quiz Generation
        </li>

        <li>
          ✅ Priority Features
        </li>

        <li>
          ✅ Premium Learning Tools
        </li>

      </ul>

      <button
        className="pricing-btn premium-btn"
        onClick={() =>
          handleProtectedNavigation(
            "/upgrade"
          )
        }
      >

        Upgrade Now

      </button>

    </div>

  </div>

</section>


{/* ================= PREMIUM FEATURES ================= */}

<section className="premium-section">

  <div className="section-title">

    <h1>

      Why Upgrade To Premium?

    </h1>

    <p>

      Premium users unlock
      the full power of AI learning.

    </p>

  </div>

  <div className="premium-grid">

    <div className="premium-card">

      <div className="premium-icon">
        🚀
      </div>

      <h2>
        Unlimited Learning
      </h2>

      <p>

        Study without limits
        using AI powered tools.

      </p>

    </div>

    <div className="premium-card">

      <div className="premium-icon">
        🤖
      </div>

      <h2>
        Unlimited AI Tutor
      </h2>

      <p>

        Ask questions and get
        instant AI explanations.

      </p>

    </div>

    <div className="premium-card">

      <div className="premium-icon">
        🧠
      </div>

      <h2>
        Advanced Revision
      </h2>

      <p>

        Generate flashcards,
        quizzes and summaries
        faster.

      </p>

    </div>

    <div className="premium-card">

      <div className="premium-icon">
        📈
      </div>

      <h2>
        Premium Analytics
      </h2>

      <p>

        Detailed learning insights
        and performance tracking.

      </p>

    </div>

  </div>

</section>



{/* ================= TRUST SECTION ================= */}

<section className="trust-section">

  <div className="section-title">

    <h1>

      Built For Serious Learning

    </h1>

  </div>

  <div className="trust-grid">

    <div className="trust-card">

      <h2>
        🔒 Secure
      </h2>

      <p>

        Protected accounts
        and cloud storage.

      </p>

    </div>

    <div className="trust-card">

      <h2>
        ☁️ Reliable
      </h2>

      <p>

        Access your study materials
        anytime and anywhere.

      </p>

    </div>

    <div className="trust-card">

      <h2>
        🎯 Effective
      </h2>

      <p>

        Designed to improve
        learning outcomes.

      </p>

    </div>

    <div className="trust-card">

      <h2>
        ⚡ Fast
      </h2>

      <p>

        AI powered responses
        in seconds.

      </p>

    </div>

  </div>

</section>

    {/* ================= FINAL CTA ================= */}

<section className="cta-section">

  <div className="cta-content">

    <h1>

      Ready To Transform The Way You Learn?

    </h1>

    <p>

      Upload PDFs,
      generate quizzes,
      study with AI tutors,
      create classrooms,
      complete assignments,
      compete in multiplayer battles,
      and track your progress —
      all in one platform.

    </p>

    <div className="cta-buttons">

      {
        !user ? (

          <>
            <Link to="/register">

              <button className="primary-btn">

                Start Free Today

              </button>

            </Link>

            <Link to="/login">

              <button className="secondary-btn">

                Login

              </button>

            </Link>
          </>

        ) : (

          <>
            <button
              className="primary-btn"
              onClick={handleDashboard}
            >

              Go To Dashboard

            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                handleProtectedNavigation(
                  "/subscription"
                )
              }
            >

              Upgrade To Premium

            </button>
          </>
        )
      }

    </div>

  </div>

</section>

      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <h2>

          AI QuizMaster

        </h2>

        <p>

          AI Powered Learning Platform
          For Teachers And Students.

        </p>

      </footer>

    </div>
  );
}