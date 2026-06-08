import { useEffect, useState } from "react";

import { supabase }
from "../../services/supabase/supabase";

import { useAuth }
from "../../context/authcontext/authcontext";

import {
  Link,
  useNavigate
} from "react-router-dom";



import "./studentdashboard.css";

export function StudentDashboard() {

  const { user } =
    useAuth();

  const navigate =
    useNavigate();

  const [classrooms,
    setClassrooms] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);


    const [completionRate,
  setCompletionRate] =
  useState(0);


  const [totalAssignments,
    setTotalAssignments] =
    useState(0);

const [plan, setPlan] = useState("free");

  const [completedAssignments,
    setCompletedAssignments] =
    useState(0);

    const [recentActivity, setRecentActivity] = useState([]);

  const [averageScore,
    setAverageScore] =
    useState(0);

    const [gradedCount,
  setGradedCount] =
  useState(0);

  useEffect(() => {

    if (user) {
      getDashboardData();
    }

  }, [user]);







  async function getDashboardData() {


async function getRecentActivity() {

  // quizzes
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // pdf uploads (from quizzes table since you store pdf there)
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const activity = [];

  // format quiz attempts
  attempts?.forEach((item) => {
    activity.push({
      type: "quiz",
      text: `Completed quiz with ${item.percentage || 0}% score`,
      time: item.created_at
    });
  });

  // format uploads
  quizzes?.forEach((item) => {
    activity.push({
      type: "upload",
      text: `Uploaded PDF: ${item.pdf_name}`,
      time: item.created_at
    });
  });

  // sort newest first
  activity.sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );

  setRecentActivity(activity.slice(0, 6));
}



function buildRecentActivity(attemptData, classroomData) {

  const activities = [];

  // ================= QUIZ ACTIVITY =================
  attemptData?.slice(-5).forEach((item) => {
    activities.push({
      type: "quiz",
      text: `Completed a quiz (${item.percentage}%)`,
      time: item.created_at || new Date(),
    });
  });

  // ================= CLASSROOM ACTIVITY =================
  classroomData?.slice(-3).forEach((item) => {
    activities.push({
      type: "classroom",
      text: `Joined ${item.classrooms?.title}`,
      time: item.created_at,
    });
  });

  // sort newest first
  activities.sort((a, b) =>
    new Date(b.time) - new Date(a.time)
  );

  setRecentActivity(activities.slice(0, 6));
}





    try {

      setLoading(true);

      /* =========================
         GET JOINED CLASSROOMS
      ========================= */

      const { data: profileData } = await supabase
  .from("profiles")
  .select("plan")
  .eq("id", user.id)
  .maybeSingle();

setPlan(profileData?.plan || "free");

      const {
        data: classroomData,
        error: classroomError
      } =
        await supabase

          .from("classroom_members")

          .select(`
            classroom_id,
            classrooms(
              id,
              title,
              description,
              subject,
              class_code,
              created_at
            )
          `)

          .eq("student_id", user.id);

      if (classroomError) {

        console.log(classroomError);
      }

      setClassrooms(
        classroomData || []
      );

      /* =========================
         GET ASSIGNMENTS
      ========================= */

      const classroomIds =
        classroomData?.map(
          (item) => item.classroom_id
        ) || [];

      if (classroomIds.length > 0) {

        const {
          data: assignmentData
        } =
          await supabase

            .from("assignments")

            .select("*")

            .in(
              "classroom_id",
              classroomIds
            );

        setTotalAssignments(
          assignmentData?.length || 0
        );


        const completionRate =
  totalAssignments > 0
    ? Math.round(
        (completedAssignments /
          totalAssignments) *
          100
      )
    : 0;

setCompletionRate(
  completionRate
);




        const {
  data: gradedAssignments
} = await supabase

  .from("assignment_submissions")

  .select("id")

  .eq("student_id", user.id)

  .eq("status", "graded");

setGradedCount(
  gradedAssignments?.length || 0
);

      }






      /* =========================
         GET QUIZ ATTEMPTS
      ========================= */

      const {
        data: attemptData
      } =
        await supabase

          .from("quiz_attempts")

          .select("*")

          .eq("user_id", user.id);

      setCompletedAssignments(
        attemptData?.length || 0
      );

      buildRecentActivity(attemptData, classroomData);

      const total =
        attemptData?.reduce(
          (acc, item) =>
            acc + (
              item.percentage || 0
            ),
          0
        ) || 0;

      const avg =
        attemptData?.length > 0
          ? Math.round(
              total /
              attemptData.length
            )
          : 0;

      setAverageScore(avg);
      await getRecentActivity();

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  }

  if (loading) {

    return (

      <div className="student-loading">

        <div className="student-loader"></div>

        <h2>
          Loading Student Dashboard...
        </h2>

      </div>
    );
  }

  return (

    <div className="student-dashboard-page">

      {/* ================= HEADER ================= */}

      <div className="student-header">

        <div>

          <div className="student-badge">
            STUDENT PORTAL
          </div>

          <h1>
            Welcome Back 👋
          </h1>

         

          <p>
            Continue learning,
            join classrooms,
            complete assignments,
            and track your academic progress.
          </p>

        </div>

        <div className="student-header-buttons">

          <Link to="/subjects">

            <button className="student-btn primary-btn">

              Explore Subjects

            </button>

          </Link>

          <Link to="/dashboard">

            <button className="student-btn secondary-btn">

              Main Dashboard

            </button>

          </Link>

        </div>

      </div>

      {/* ================= QUICK ACTIONS ================= */}

      <section className="student-section">

        <div className="section-title-row">

          <h2>
            Quick Actions
          </h2>

        </div>

        <div className="student-actions-grid">

          <Link
            to="/join-classroom"
            className="student-action-card"
          >

            <div className="student-action-icon">
              🏫
            </div>

            <h3>
              Join Classroom
            </h3>

            <p>
              Enter classroom code
            </p>

          </Link>

          <Link
            to="/subjects"
            className="student-action-card"
          >

            <div className="student-action-icon">
              📚
            </div>

            <h3>
              Start Learning
            </h3>

            <p>
              Practice AI quizzes
            </p>

          </Link>

          <Link
            to="/upload"
            className="student-action-card"
          >

            <div className="student-action-icon">
              📄
            </div>

            <h3>
              Upload PDF
            </h3>

            <p>
              Generate quiz instantly
            </p>

          </Link>



<Link
  to="/ai-tutor"
  className="student-action-card"
>

   <div className="student-action-icon">
🤖 
</div>
<h3>AI Tutor</h3>
<p>Ask questions about PDFs and quizzes</p>


</Link>

<Link
  to="/imagetutor"
  className="student-action-card"
>
 <div className="student-action-icon">🖼 </div>
<h3>Image Tutor</h3>
<p>Analyze notes and homework</p>


</Link>


<Link
  to="/quizstorage"
  className="student-action-card"
>



   <div className="student-action-icon">🧠 </div>
   <h3>Quiz Storage</h3>
<p>Review past quizzes</p>

</Link>


<Link
  to="/assignment"
  className="student-action-card"
>



   <div className="student-action-icon">🧠 </div>
   <h3>All Assignment</h3>
<p>Assignment Update</p>

</Link>






          <Link
            to="/leaderboard"
            className="student-action-card"
          >

            <div className="student-action-icon">
              🏆
            </div>

            <h3>
              Leaderboard
            </h3>

            <p>
              Compete with students
            </p>

          </Link>

        </div>


        {/* ================= UPGRADE CARD ================= */}

{plan !== "pro" && (
  <div className="upgrade-card">

    <div className="upgrade-left">

      <h2>🚀 Upgrade to PRO</h2>

      <p>
        Unlock unlimited PDFs, faster AI processing,
        priority tutor responses and premium features.
      </p>

      <ul>
        <li>✔ Unlimited PDF uploads</li>
        <li>✔ Faster AI tutor responses</li>
        <li>✔ Priority quiz generation</li>
        <li>✔ Advanced analytics</li>
      </ul>

      <button
        className="upgrade-btn"
        onClick={() => navigate("/upgrade")}
      >
        Upgrade Now
      </button>

    </div>

    <div className="upgrade-right">
      💎
    </div>

  </div>
)}

      </section>

      {/* ================= STATS ================= */}

      <div className="student-stats-grid">

        <div className="student-stat-card">

          <h2>
            {classrooms.length}
          </h2>

          <p>
            Joined Classrooms
          </p>

        </div>

        <div className="student-stat-card">

          <h2>
            {totalAssignments}
          </h2>

          <p>
            Total Assignments
          </p>

        </div>

        <div className="student-stat-card">

          <h2>
            {completedAssignments}
          </h2>

          <p>
            Quiz Attempts
          </p>

        </div>

        <div className="student-stat-card">

          <h2>
            {averageScore}%
          </h2>

          <p>
            Average Score
          </p>

        </div>


    <div className="student-stat-card">

  <h2>
    {gradedCount}/{totalAssignments}
  </h2>

  <p>
    Graded Assignments
  </p>

</div>

      </div>


      {/* ================= RECENT ACTIVITY ================= */}




<section className="student-section">

  <div className="section-title-row">
    <h2>Recent Activity</h2>
  </div>

  <div className="activity-list">

    {recentActivity.length === 0 ? (
      <p className="empty-text">No recent activity yet</p>
    ) : (
      recentActivity.map((item, index) => (
        <div key={index} className={`activity-card ${item.type}`}>

          <div className="activity-dot"></div>

          <div>
            <p>{item.text}</p>
            <span>
              {new Date(item.time).toLocaleString()}
            </span>
          </div>

        </div>
      ))
    )}

  </div>

</section>

      {/* ================= CLASSROOM SECTION ================= */}

      <section className="student-section">

        <div className="section-title-row">

          <h2>
            My Classrooms
          </h2>

          <span>
            {classrooms.length} Joined
          </span>

        </div>

        {
          classrooms.length === 0 ? (

            <div className="empty-classroom-box">

              <h3>
                No Classroom Joined Yet
              </h3>

              <p>
                Join a classroom using
                a classroom code from your teacher.
              </p>

              <Link to="/join-classroom">

                <button className="student-btn primary-btn">

                  Join Classroom

                </button>

              </Link>

            </div>

          ) : (

            <div className="student-classroom-grid">

              {
                classrooms.map((item) => (

                  <Link
                    to={`/classroom/${item.classroom_id}`}
                    key={item.classroom_id}
                    className="student-room-card"
                  >

                    <div className="room-top">

                      <div className="room-icon">
                        🎓
                      </div>

                      <div className="room-subject">

                        {
                          item.classrooms?.subject ||
                          "Subject"
                        }

                      </div>

                    </div>

                    <h2>

                      {
                        item.classrooms?.title
                      }

                    </h2>




                    <p>

                      {
                        item.classrooms?.description ||
                        "No classroom description available."
                      }

                    </p>

                    <div className="student-room-code">

                      Code:
                      {" "}
                      {
                        item.classrooms?.class_code
                      }

                    </div>

                    <div className="room-footer">

                      <span>
                        Open Classroom
                      </span>

                      <div className="arrow">
                        →
                      </div>

                    </div>

                  </Link>

                ))
              }

            </div>
          )
        }

      </section>

      {/* ================= LEARNING ANALYTICS ================= */}

      <section className="student-section">

        <div className="section-title-row">

          <h2>
            Learning Progress
          </h2>

        </div>

        <div className="student-analytics-grid">

          <div className="analytics-card">

            <h3>
              Academic Performance
            </h3>

            <div className="progress-bar">

             <div
  className="progress-fill purple"
  style={{
    width: `${Math.max(averageScore, 5)}%`
  }}
></div>

            </div>

            <span>
              {averageScore}% Average
            </span>

          </div>

          <div className="analytics-card">

            <h3>
              Classroom Activity
            </h3>

            <div className="progress-bar">

              <div
                className="progress-fill blue"
                style={{
                 width: `${Math.min(
  (classrooms.length / 5) * 100,
  100
)}%`
                }}
              ></div>

            </div>

            <span>
              {classrooms.length} Active Classrooms
            </span>

          </div>


<div className="analytics-card">

  <h3>Grading Progress</h3>

  <div className="progress-bar">

    <div
      className="progress-fill orange"
      style={{
        width: `${
          totalAssignments > 0
            ? (gradedCount /
                totalAssignments) *
              100
            : 0
        }%`
      }}
    />

  </div>

  <span>
    {gradedCount}/{totalAssignments} Graded
  </span>

</div>





          <div className="analytics-card">

            <h3>
              Assignment Completion
            </h3>

            <div className="progress-bar">

              <div
                className="progress-fill green"
                style={{
                  width: `${completionRate}%`
                }}
              ></div>

            </div>

            <span>
           <span>
  {completionRate}% Completed
</span>
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}