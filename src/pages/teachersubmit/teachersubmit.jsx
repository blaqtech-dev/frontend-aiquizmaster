import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../services/supabase/supabase";
import 'teachersubmit.css'

export default function ClassroomSubmissionsPage() {

  const { assignmentId } = useParams();

  const [submissions, setSubmissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {

    setLoading(true);

    const { data, error } =
      await supabase

        .from("assignment_submissions")

        .select("*")

        .eq(
          "assignment_id",
          assignmentId
        )

        .order(
          "submitted_at",
          {
            ascending: false,
          }
        );

    if (error) {
      console.log(error);
    }

    setSubmissions(data || []);

    setLoading(false);
  }

  if (loading) {

    return (
      <div>
        Loading submissions...
      </div>
    );
  }

  return (

    <div className="submissions-page">

      <h1>
        Assignment Submissions
      </h1>

      {submissions.length === 0 ? (

        <h3>
          No submissions yet
        </h3>

      ) : (

        submissions.map(
          submission => (

            <div
              key={submission.id}
              className="submission-card"
            >

              <h3>
                Student ID:
                {" "}
                {submission.student_id}
              </h3>

              <p>
                {submission.answer}
              </p>

              <p>
                Status:
                {" "}
                {submission.status}
              </p>

              <p>
                Submitted:
                {" "}
                {new Date(
                  submission.submitted_at
                ).toLocaleString()}
              </p>

              {submission.file_url && (

                <a
                  href={submission.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Uploaded File
                </a>

              )}

              <br />

              <Link
                to={`/teacher/grade/${submission.id}`}
              >
                Grade Submission
              </Link>

            </div>
          )
        )
      )}

    </div>
  );
}