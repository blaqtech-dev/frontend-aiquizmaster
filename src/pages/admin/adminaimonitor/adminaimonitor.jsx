import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./adminaimonitor.css";

export function AdminAiMonitorPage() {

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState({
      totalUsers: 0,
      totalPdfs: 0,
      totalQuizAttempts: 0,
      totalSubjects: 0,
      totalProUsers: 0,
    });

  const [topUsers, setTopUsers] =
    useState([]);

  const [topSubjects, setTopSubjects] =
    useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    try {

      setLoading(true);

      const { data: users } =
        await supabase
          .from("profiles")
          .select("*");

      const { data: quizzes } =
        await supabase
          .from("quizzes")
          .select("*");

      const { data: attempts } =
        await supabase
          .from("quiz_attempts")
          .select("*");

      const { data: subjects } =
        await supabase
          .from("subjects")
          .select("*");

      const userUsage = {};

      quizzes?.forEach((quiz) => {

        if (!userUsage[quiz.user_id]) {

          userUsage[quiz.user_id] = {
            count: 0,
            email: "",
          };
        }

        userUsage[quiz.user_id].count += 1;
      });

      users?.forEach((user) => {

        if (
          userUsage[user.id]
        ) {

          userUsage[user.id].email =
            user.email;
        }
      });

      const rankedUsers =
        Object.values(
          userUsage
        )

          .sort(
            (a, b) =>
              b.count - a.count
          )

          .slice(0, 10);

      const subjectMap = {};

      quizzes?.forEach((quiz) => {

        const subject =
          quiz.subject ||
          quiz.subject_name ||
          "Unknown";

        subjectMap[subject] =
          (subjectMap[subject] || 0) + 1;
      });

      const rankedSubjects =
        Object.entries(
          subjectMap
        )
          .map(
            ([name, count]) => ({
              name,
              count,
            })
          )
          .sort(
            (a, b) =>
              b.count - a.count
          );

      setTopUsers(
        rankedUsers
      );

      setTopSubjects(
        rankedSubjects
      );

      setStats({

        totalUsers:
          users?.length || 0,

        totalPdfs:
          quizzes?.length || 0,

        totalQuizAttempts:
          attempts?.length || 0,

        totalSubjects:
          subjects?.length || 0,

        totalProUsers:
          users?.filter(
            (u) =>
              u.plan === "pro"
          ).length || 0,
      });

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  if (loading) {

    return (

      <div className="ai-loading">

        <div className="ai-loader"></div>

        <h2>
          Loading AI Usage...
        </h2>

      </div>
    );
  }

  return (

    <div className="ai-monitor-page">

      <div className="ai-header">

        <span className="ai-badge">
          AI USAGE MONITOR
        </span>

        <h1>
          AI Platform Activity
        </h1>

        <p>
          Track uploads,
          quizzes,
          active learners
          and platform growth.
        </p>

      </div>

      {/* STATS */}

      <div className="ai-stats-grid">

        <div className="ai-card">

          <h2>
            {stats.totalUsers}
          </h2>

          <p>
            Users
          </p>

        </div>

        <div className="ai-card">

          <h2>
            {stats.totalPdfs}
          </h2>

          <p>
            PDF Uploads
          </p>

        </div>

        <div className="ai-card">

          <h2>
            {stats.totalQuizAttempts}
          </h2>

          <p>
            Quiz Attempts
          </p>

        </div>


        <div className="ai-card">
  <h2>{topUsers.length}</h2>
  <p>Active Learners</p>
</div>

<div className="ai-card">
  <h2>{topSubjects.length}</h2>
  <p>Popular Subjects</p>
</div>

        <div className="ai-card">

          <h2>
            {stats.totalSubjects}
          </h2>

          <p>
            Subjects
          </p>

        </div>

        <div className="ai-card">

          <h2>
            {stats.totalProUsers}
          </h2>

          <p>
            Pro Users
          </p>

        </div>

      </div>

      {/* TOP USERS */}

      <div className="ai-section">

        <h2>
          Most Active PDF Users
        </h2>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Email
                </th>

                <th>
                  PDFs Uploaded
                </th>

              </tr>

            </thead>

            <tbody>

              {topUsers.map(
                (
                  user,
                  index
                ) => (

                <tr key={index}>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    {user.count}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* TOP SUBJECTS */}

      <div className="ai-section">

        <h2>
          Most Popular Subjects
        </h2>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Subject
                </th>

                <th>
                  Usage
                </th>

              </tr>

            </thead>

            <tbody>

              {topSubjects.map(
                (
                  subject,
                  index
                ) => (

                <tr key={index}>

                  <td>
                    {subject.name}
                  </td>

                  <td>
                    {subject.count}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}