import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/supabase";
import { useAuth } from "../../context/authcontext/authcontext";
import './assignment.css'
export default function MyAssignmentsPage() {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyAssignments();
  }, [user]);

  async function loadMyAssignments() {
    setLoading(true);

    // 1. get student's submissions
    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(`
        id,
        answer,
        score,
        feedback,
        status,
        submitted_at,
        assignment_id,
        assignments (
          title,
          due_date
        )
      `)
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setAssignments(data || []);
    setLoading(false);
  }

  if (loading) {
    return <div>Loading your assignments...</div>;
  }

  return (
 
  <div className="my-assignments-page">

  <h1>📚 My Assignments</h1>

  {assignments.length === 0 ? (

    <div className="empty-assignments">
      <h2>No Assignments Yet</h2>
      <p>
        Submit assignments from your classroom
        and they will appear here.
      </p>
    </div>

  ) : (

    <div className="assignments-grid">

      {assignments.map((item) => (

        <div
          key={item.id}
          className="assignment-card"
        >

          <h2>
            {item.assignments?.title}
          </h2>

          <div
            className={`status-badge ${
              item.status === "graded"
                ? "status-graded"
                : "status-pending"
            }`}
          >
            {item.status}
          </div>

          <div className="score-box">

            <h3>Score</h3>

            <div className="score-value">

              {item.score !== null
                ? `${item.score}%`
                : "--"}

            </div>

          </div>

          <div className="feedback-box">

            <h4>Teacher Feedback</h4>

            <p>
              {item.feedback ||
                "No feedback yet"}
            </p>

          </div>

          <div className="assignment-date">

            Submitted:
            {" "}
            {new Date(
              item.submitted_at
            ).toLocaleString()}

          </div>

        </div>

      ))}

    </div>

  )}

</div>
  );
}