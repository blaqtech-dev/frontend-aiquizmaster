import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./adminanalytics.css";

export function AdminAnalyticsPage() {

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    proUsers: 0,
    revenue: 0,
    classrooms: 0,
    quizAttempts: 0,
    pdfUploads: 0,
    avgScore: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {

    try {

      setLoading(true);

      const { data: users } =
        await supabase
          .from("profiles")
          .select("*");

      const { data: payments } =
        await supabase
          .from("payments")
          .select("*");

      const { data: classrooms } =
        await supabase
          .from("classrooms")
          .select("*");

      const { data: attempts } =
        await supabase
          .from("quiz_attempts")
          .select("*");

      const { data: pdfs } =
        await supabase
          .from("quizzes")
          .select("*");

      const revenue =
        payments?.reduce(
          (sum, item) =>
            sum + Number(item.amount || 0),
          0
        ) || 0;

      const avgScore =
        attempts?.length > 0
          ? Math.round(
              attempts.reduce(
                (sum, item) =>
                  sum + (item.percentage || 0),
                0
              ) / attempts.length
            )
          : 0;

      const proUsers =
        users?.filter(
          (u) => u.plan === "pro"
        ).length || 0;

      const totalUsers =
        users?.length || 0;

      const conversionRate =
        totalUsers > 0
          ? Math.round(
              (proUsers / totalUsers) * 100
            )
          : 0;

      setStats({
        totalUsers,
        students:
          users?.filter(
            (u) => u.role === "student"
          ).length || 0,

        teachers:
          users?.filter(
            (u) => u.role === "teacher"
          ).length || 0,

        proUsers,

        revenue,

        classrooms:
          classrooms?.length || 0,

        quizAttempts:
          attempts?.length || 0,

        pdfUploads:
          pdfs?.length || 0,

        avgScore,

        conversionRate,
      });

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="analytics-loader"></div>
        <h2>Loading Analytics...</h2>
      </div>
    );
  }

  return (

    <div className="admin-analytics-page">

      <div className="analytics-header">

        <span className="analytics-badge">
          PLATFORM ANALYTICS
        </span>

        <h1>
          AIQuizMaster Analytics
        </h1>

        <p>
          Monitor growth, revenue,
          learning performance and
          user engagement.
        </p>

      </div>

      <div className="analytics-grid">

        <div className="analytics-card">
          <h2>{stats.totalUsers}</h2>
          <p>Total Users</p>
        </div>

        <div className="analytics-card">
          <h2>{stats.students}</h2>
          <p>Students</p>
        </div>

        <div className="analytics-card">
          <h2>{stats.teachers}</h2>
          <p>Teachers</p>
        </div>

        <div className="analytics-card">
          <h2>{stats.proUsers}</h2>
          <p>Pro Users</p>
        </div>

        <div className="analytics-card revenue">
          <h2>
            ₦{stats.revenue.toLocaleString()}
          </h2>
          <p>Total Revenue</p>
        </div>

        <div className="analytics-card">
          <h2>
            {stats.conversionRate}%
          </h2>
          <p>Pro Conversion</p>
        </div>

        <div className="analytics-card">
          <h2>
            {stats.classrooms}
          </h2>
          <p>Classrooms</p>
        </div>

        <div className="analytics-card">
          <h2>
            {stats.quizAttempts}
          </h2>
          <p>Quiz Attempts</p>
        </div>

        <div className="analytics-card">
          <h2>
            {stats.pdfUploads}
          </h2>
          <p>PDF Uploads</p>
        </div>

        <div className="analytics-card">
          <h2>
            {stats.avgScore}%
          </h2>
          <p>Average Score</p>
        </div>

      </div>

      <div className="analytics-summary">

        <h2>
          Platform Health
        </h2>

        <div className="summary-grid">

          <div className="summary-card">

            <h3>User Growth</h3>

            <p>
              {stats.totalUsers}
              {" "}
              registered users.
            </p>

          </div>

          <div className="summary-card">

            <h3>Revenue</h3>

            <p>
              ₦
              {stats.revenue.toLocaleString()}
              {" "}
              generated.
            </p>

          </div>

          <div className="summary-card">

            <h3>Learning</h3>

            <p>
              Average score is
              {" "}
              {stats.avgScore}%.
            </p>

          </div>

          <div className="summary-card">

            <h3>Premium Users</h3>

            <p>
              {stats.proUsers}
              {" "}
              Pro subscribers.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}