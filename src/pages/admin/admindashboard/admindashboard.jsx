import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./admindashboard.css";

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    teachers: 0,
    proUsers: 0,
    classrooms: 0,
    quizzes: 0,
    pdfs: 0,
    revenue: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      // USERS
      const { data: users } = await supabase
        .from("profiles")
        .select("*");

      // CLASSROOMS
      const { data: classrooms } = await supabase
        .from("classrooms")
        .select("*");

      // QUIZ ATTEMPTS
      const { data: quizzes } = await supabase
        .from("quiz_attempts")
        .select("*");

      // PDFS
      const { data: pdfs } = await supabase
        .from("quizzes")
        .select("*");

      // PAYMENTS
      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      const totalRevenue =
        payments?.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        ) || 0;

      setStats({
        users: users?.length || 0,

        students:
          users?.filter(
            (u) => u.role === "student"
          ).length || 0,

        teachers:
          users?.filter(
            (u) => u.role === "teacher"
          ).length || 0,

        proUsers:
          users?.filter(
            (u) => u.plan === "pro"
          ).length || 0,

        classrooms:
          classrooms?.length || 0,

        quizzes:
          quizzes?.length || 0,

        pdfs:
          pdfs?.length || 0,

        revenue: totalRevenue,
      });

      setRecentUsers(
        users
          ?.sort(
            (a, b) =>
              new Date(b.created_at) -
              new Date(a.created_at)
          )
          .slice(0, 10) || []
      );

      setRecentPayments(
        payments?.slice(0, 10) || []
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loader"></div>
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="admin-page">

      <div className="admin-header">

        <div>
          <span className="admin-badge">
            ADMIN PANEL
          </span>

          <h1>Platform Overview</h1>

          <p>
            Monitor users, revenue,
            classrooms and learning activity.
          </p>
        </div>

      </div>

      {/* STATS */}

      <div className="admin-stats-grid">

        <div className="admin-card">
          <h2>{stats.users}</h2>
          <p>Total Users</p>
        </div>

        <div className="admin-card">
          <h2>{stats.students}</h2>
          <p>Students</p>
        </div>

        <div className="admin-card">
          <h2>{stats.teachers}</h2>
          <p>Teachers</p>
        </div>

        <div className="admin-card">
          <h2>{stats.proUsers}</h2>
          <p>Pro Users</p>
        </div>

        <div className="admin-card">
          <h2>{stats.classrooms}</h2>
          <p>Classrooms</p>
        </div>

        <div className="admin-card">
          <h2>{stats.quizzes}</h2>
          <p>Quiz Attempts</p>
        </div>

        <div className="admin-card">
          <h2>{stats.pdfs}</h2>
          <p>PDF Uploads</p>
        </div>

        <div className="admin-card revenue">
          <h2>
            ₦{stats.revenue.toLocaleString()}
          </h2>
          <p>Total Revenue</p>
        </div>

      </div>

      {/* QUICK ACTIONS */}

      <div className="admin-actions">

        <button>
          Manage Users
        </button>

        <button>
          Manage Payments
        </button>

        <button>
          Analytics
        </button>

        <button>
          Platform Settings
        </button>

      </div>

      {/* USERS */}

      <div className="admin-section">

        <h2>Recent Users</h2>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Plan</th>
              </tr>
            </thead>

            <tbody>

              {recentUsers.map((user) => (

                <tr key={user.id}>

                  <td>
                    {user.username}
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    {user.role || "none"}
                  </td>

                  <td>
                    {user.plan || "free"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* PAYMENTS */}

      <div className="admin-section">

        <h2>Recent Payments</h2>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {recentPayments.map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.reference}
                  </td>

                  <td>
                    ₦{item.amount}
                  </td>

                  <td>
                    {item.status}
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