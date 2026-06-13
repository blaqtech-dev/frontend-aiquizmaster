import { useNavigate }
from "react-router-dom";

import { useState }
from "react";

import { supabase }
from "../../services/supabase/supabase";

import { useAuth }
from "../../context/authcontext/authcontext";

import "./selectrole.css";

export function SelectRolePage() {

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const [loading,
    setLoading] =
    useState(false);

  const [error,
    setError] =
    useState("");

  // ================= SELECT ROLE =================

  async function selectRole(role) {

    try {

      setLoading(true);

      setError("");

      // ================= CHECK USER =================

      if (!user) {

        setError(
          "User not found. Login again."
        );

        return;
      }

      console.log(
        "Current User:",
        user
      );

      // ================= INSERT ROLE =================

      const { data, error } =
        await supabase

          .from("profiles")

          .upsert([
            {
              id: user.id,
              email: user.email,
              role: role,
            },
          ])

          .select();

      console.log(
        "Supabase Response:",
        data
      );

      console.log(
        "Supabase Error:",
        error
      );

      // ================= ERROR =================

      if (error) {

        setError(
          error.message
        );

        return;
      }

      // ================= SUCCESS =================

      // ================= CREATE COUNTS RECORD =================

await supabase

  .from("counts")

  .upsert({
    user_id: user.id,
    pdf_count: 0,
    question_count: 0,
    image_count: 0,
  });



window.dispatchEvent(
  new Event("profile-updated")
);

navigate(
  role === "teacher"
    ? "/teacher-dashboard"
    : "/student-dashboard",
  { replace: true }
);

    } catch (err) {

      console.log(err);

      setError(
        "Something went wrong."
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <div className="role-page">

      <div className="role-card">

        <div className="role-top">

          <div className="role-badge">

            AI LEARNING PLATFORM

          </div>

          <h1>

            Choose Your Role

          </h1>

          <p>

            Select how you want to use the platform.
            Teachers can create classrooms and assignments,
            while students can join classrooms and learn using AI.

          </p>

        </div>

        {/* ================= ERROR ================= */}

        {
          error && (

            <div className="role-error">

              {error}

            </div>
          )
        }

        {/* ================= ROLE GRID ================= */}

        <div className="role-grid">

          {/* ================= STUDENT ================= */}

          <div className="role-option">

            <div className="role-icon">

              🎓

            </div>

            <h2>

              Student

            </h2>

            <p>

              Join classrooms,
              solve quizzes,
              upload PDFs,
              and improve your academic progress.

            </p>

            <div className="role-features">

              <span>
                Join Classrooms
              </span>

              <span>
                AI Quizzes
              </span>

              <span>
                Progress Tracking
              </span>

              <span>
                Multiplayer
              </span>

            </div>

            <button
              className="role-btn"
              disabled={loading}
             onClick={() => {
  console.log("Student Clicked");
  alert("Student Clicked");
  selectRole("student");
}}
            >

              {
                loading
                  ? "Loading..."
                  : "Continue As Student"
              }

            </button>

          </div>

          {/* ================= TEACHER ================= */}

          <div className="role-option">

            <div className="role-icon">

              👨‍🏫

            </div>

            <h2>

              Teacher

            </h2>

            <p>

              Create classrooms,
              upload assignments,
              manage students,
              and monitor academic performance.

            </p>

            <div className="role-features">

              <span>
                Create Classrooms
              </span>

              <span>
                Assignments
              </span>

              <span>
                Student Management
              </span>

              <span>
                Analytics
              </span>

            </div>

            <button
              className="role-btn"
              disabled={loading}
              onClick={() => {
  console.log("Teacher Clicked");
  alert("Teacher Clicked");
  selectRole("teacher");
}}
            >

              {
                loading
                  ? "Loading..."
                  : "Continue As Teacher"
              }

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}