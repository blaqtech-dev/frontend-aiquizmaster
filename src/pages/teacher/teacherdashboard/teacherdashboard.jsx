import { useEffect, useState } from "react";

import { supabase }
from "../../../services/supabase/supabase";

import { useAuth }
from "../../../context/authcontext/authcontext";

import { Link, useNavigate }
from "react-router-dom";

import "./teacherdashboard.css";

export function TeacherDashboard() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [classrooms, setClassrooms] =
    useState([]);

    const [averageGrade,
  setAverageGrade] =
  useState(0);

    const [submissionCount, setSubmissionCount] =
  useState(0);

  const [stats, setStats] =
    useState({
      totalClassrooms: 0,
      totalStudents: 0,
      totalAssignments: 0,
    });

  const [loading, setLoading] =
    useState(true);

    const [pendingGrading,
  setPendingGrading] =
  useState(0);

  useEffect(() => {

    if (user) {
      loadDashboard();
    }

  }, [user]);

  async function loadDashboard() {

    try {

      setLoading(true);

      /* ================= CLASSROOMS ================= */

      const { data: classroomData } =
        await supabase

          .from("classrooms")

          .select("*")

          .eq("teacher_id", user.id)

          .order("created_at", {
            ascending: false,
          });

      setClassrooms(classroomData || []);

      /* ================= ASSIGNMENTS ================= */

      const { data: assignmentData } =
        await supabase

          .from("assignments")

          .select("*")

          .eq("teacher_id", user.id);

      /* ================= STUDENTS ================= */

      let totalStudents = 0;

      if (classroomData?.length > 0) {

        const classroomIds =
          classroomData.map(
            (item) => item.id
          );

        const { data: membersData } =
          await supabase

            .from("classroom_members")

            .select("*")

            .in(
              "classroom_id",
              classroomIds
            );

        totalStudents =
          membersData?.length || 0;
      }

      setStats({
        totalClassrooms:
          classroomData?.length || 0,

        totalStudents,

        totalAssignments:
          assignmentData?.length || 0,
      });




   const assignmentIds =
  assignmentData?.map(
    item => item.id
  ) || [];

let submissions = [];

if (assignmentIds.length > 0) {

  const {
    data: submissionData,
    error: submissionError,
  } = await supabase

    .from("assignment_submissions")

    .select(`
      id,
      score,
      assignment_id
    `)

    .in(
      "assignment_id",
      assignmentIds
    );

  if (!submissionError) {

    submissions =
      submissionData || [];

    setSubmissionCount(
      submissions.length
    );
  }
}

const pending =
  submissions.filter(
    item => item.score == null
  );

setPendingGrading(
  pending.length
);

const graded =
  submissions.filter(
    item => item.score != null
  );

const avg =
  graded.length > 0

    ? Math.round(

        graded.reduce(
          (sum, item) =>
            sum + item.score,
          0
        ) /

        graded.length

      )

    : 0;

setAverageGrade(avg);


    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  }

  if (loading) {

    return (

      <div className="teacher-loading">

        <div className="teacher-loader"></div>

        <h2>
          Loading Dashboard...
        </h2>

      </div>
    );
  }

  return (

    <div className="teacher-dashboard-page">

      {/* ================= HEADER ================= */}

      <div className="teacher-header">

        <div>

          <p className="teacher-small-text">
            TEACHER PANEL
          </p>

          <h1>
            Welcome Back 👋
          </h1>

          <span>
            Manage classrooms,
            assignments and students
          </span>

        </div>

        <div className="teacher-header-buttons">

          <Link to="/create-classroom">

            <button className="teacher-btn primary-btn">

              + Create Classroom

            </button>

          </Link>

          <Link to="/create-assignment">

            <button className="teacher-btn secondary-btn">

              + Create Assignment

            </button>

          </Link>


          <Link to="/dashboard">
          
                      <button className="student-btn secondary-btn">
          
                        Main Dashboard
          
                      </button>
          
                    </Link>

        </div>

      </div>

      {/* ================= STATS ================= */}

      <section className="teacher-stats-grid">

        <div className="teacher-stat-card">

          <div className="teacher-stat-icon">
            🏫
          </div>

          <div>

            <h2>
              {stats.totalClassrooms}
            </h2>

            <p>
              Total Classrooms
            </p>

          </div>

        </div>

        <div className="teacher-stat-card">

          <div className="teacher-stat-icon">
            🎓
          </div>

          <div>

            <h2>
              {stats.totalStudents}
            </h2>

            <p>
              Students
            </p>

          </div>

        </div>

        <div className="teacher-stat-card">

          <div className="teacher-stat-icon">
            📝
          </div>

          <div>

            <h2>
              {stats.totalAssignments}
            </h2>

            <p>
              Assignments
            </p>

          </div>

        </div>

      </section>

      {/* ================= QUICK ACTIONS ================= */}

      <section className="teacher-section">

        <div className="teacher-section-top">

          <h2>
            Quick Actions
          </h2>

        </div>

        <div className="teacher-actions-grid">

          <Link
            to="/create-classroom"
            className="teacher-action-card"
          >

            <div className="teacher-action-icon">
              🏫
            </div>

            <h3>
              Create Classroom
            </h3>

            <p>
              Start a new learning space
            </p>

          </Link>


<Link
  to="/ai-tutor"
  className="teacher-action-card"
>

   <div className="teacher-action-icon">
🤖 
</div>
<h3>AI Tutor</h3>
<p>Ask questions about PDFs and quizzes</p>


</Link>

<Link
  to="/imagetutor"
  className="teacher-action-card"
>
 <div className="teacher-action-icon">🖼 </div>
<h3>Image Tutor</h3>
<p>Analyze notes and homework</p>


</Link>



<Link
  to="/global-feed"
  className="teacher-action-card"
>

  <div className="teacher-action-icon">
    📢
  </div>

  <h3>
    Announcements
  </h3>

  <p>
    Send updates to students
  </p>

</Link>

  <Link
            to="/upload"
            className="teacher-action-card"
          >

            <div className="teacher-action-icon">
              📄
            </div>

            <h3>
              Upload PDF
            </h3>

            <p>
              Generate AI quizzes
            </p>

          </Link>


          <Link
  to="/scan-notes"
  className="teacher-action-card"
>

  <div className="teacher-action-icon">
    🤖
  </div>

  <h3>
    AI Image Notes
  </h3>

  <p>
    Scan, summarize & chat
  </p>

</Link>



          <Link
  to="/profile"
  className="teacher-action-card"
>
  <div className="teacher-action-icon">
    👤
  </div>

  <h3>
    Profile
  </h3>

  <p>
    Manage your account
  </p>
</Link>



<Link
  to="/multiplayer"
  className="teacher-action-card"
>
  <div className="teacher-action-icon">
    🎮
  </div>

  <h3>
    Multiplayer
  </h3>

  <p>
    Challenge friends live
  </p>
</Link>

<Link
  to="/leaderboard"
  className="teacher-action-card"
>
  <div className="teacher-action-icon">
    🏆
  </div>

  <h3>
    Leaderboard
  </h3>

  <p>
    View top rankings
  </p>
</Link>


<Link
  to="/subjects"
  className="teacher-action-card"
>
  <div className="teacher-action-icon">
    📚
  </div>

  <h3>
    Subjects
  </h3>

  <p>
    Browse all subjects
  </p>
</Link>


  

          <Link
            to="/create-assignment"
            className="teacher-action-card"
          >

            <div className="teacher-action-icon">
              📚
            </div>

            <h3>
              Create Assignment
            </h3>

            <p>
              Give students tasks
            </p>

          </Link>


          <div className="teacher-stat-card">

  <div className="teacher-stat-icon">
    📥
  </div>

  <div>

    <h2>
      {submissionCount}
    </h2>

    <p>
      Submissions
    </p>

  </div>

</div>


<div className="teacher-stat-card">

  <div className="teacher-stat-icon">
    ⏳
  </div>

  <div>

    <h2>
      {pendingGrading}
    </h2>

    <p>
      Pending Grading
    </p>

  </div>

</div>


<Link
  to="/teacher-submissions"
  className="teacher-action-card"
>

  <div className="teacher-action-icon">
    📥
  </div>

  <h3>
    Grade Work
  </h3>

  <p>
    Review submissions
  </p>

</Link>




<div className="teacher-stat-card">

  <div className="teacher-stat-icon">
    📊
  </div>

  <div>

    <h2>
      {averageGrade}%
    </h2>

    <p>
      Average Grade
    </p>

  </div>

</div>

        

        </div>

      </section>

      {/* ================= CLASSROOMS ================= */}

      <section className="teacher-section">

        <div className="teacher-section-top">

          <h2>
            My Classrooms
          </h2>

        </div>

        {
          classrooms.length === 0 ? (

            <div className="teacher-empty">

              <h3>
                No Classroom Yet
              </h3>

              <p>
                Create your first classroom
                to begin teaching students.
              </p>

              <Link to="/create-classroom">

                <button className="teacher-btn primary-btn">

                  Create Classroom

                </button>

              </Link>

            </div>

          ) : (

            <div className="teacher-classroom-grid">

              {classrooms.map((room) => (

                <div
                  className="teacher-room-card"
                  key={room.id}
                >

                  <div className="teacher-room-top">

                    <div className="teacher-room-badge">

                      Classroom

                    </div>

                  </div>

                  <h3>
                    {room.title}
                  </h3>

                  <p>
                    {
                      room.description ||
                      "No description added yet."
                    }
                  </p>

                  <div className="teacher-room-info">

                    <span>
                      Subject:
                      {" "}
                      {
                        room.subject ||
                        "General"
                      }
                    </span>

                    <span>
                      Code:
                      {" "}
                      {
                        room.class_code
                      }
                    </span>

                  </div>

                  <div className="teacher-room-buttons">

                    <button
                      onClick={() =>
                        navigate(
                          `/classroom/${room.id}`
                        )
                      }
                      className="teacher-btn action-btn"
                    >

                      Open Classroom

                    </button>

                  </div>

                </div>
              ))}

            </div>
          )
        }

      </section>

    </div>
  );
}