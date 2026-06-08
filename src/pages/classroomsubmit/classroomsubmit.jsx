import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../services/supabase/supabase";
import './classroomsubmit.css'

export default function ClassroomSubmissionsPage() {

  const { assignmentId } = useParams();

  const [submissions, setSubmissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadSubmissions();

  }, [assignmentId]);
async function loadSubmissions() {

  setLoading(true);

  const {
    data: submissionsData,
    error
  } = await supabase

    .from("assignment_submissions")

.select(`
  *,
  profiles(
    username,
    email,
    avatar_url
  )
`)

    .eq(
      "assignment_id",
      assignmentId
    )

    .order(
      "submitted_at",
      {
        ascending: false
      }
    );

  if (error) {

    console.log(error);

    setLoading(false);

    return;
  }

  const studentIds =
    submissionsData.map(
      item => item.student_id
    );

  const {
    data: profiles
  } = await supabase

    .from("profiles")

    .select(`
      id,
      username,
      email,
      avatar_url
    `)

    .in(
      "id",
      studentIds
    );

  const merged =
    submissionsData.map(
      submission => ({

        ...submission,

        profile:
          profiles?.find(
            profile =>
              profile.id ===
              submission.student_id
          )

      })
    );

  setSubmissions(merged);

  setLoading(false);
}

  if (loading) {

    return (
      <div className="submissions-loading">
        Loading submissions...
      </div>
    );
  }

  return (

    <div className="teacher-submissions-page">

      <div className="teacher-header">

        <h1>
          Assignment Submissions
        </h1>

        <span>
          {submissions.length} Students Submitted
        </span>

      </div>

      {submissions.length === 0 ? (

        <div className="empty-submissions">

          <h2>
            No submissions yet
          </h2>

          <p>
            Students have not submitted
            this assignment.
          </p>

        </div>

      ) : (

        <div className="submission-grid">

          {submissions.map(
            (submission) => (

              <div
                key={submission.id}
                className="submission-card"
              >

                <div className="student-header">

                  <img
                    src={
                      submission.profile
                        ?.avatar_url ||
                      "/avatar.png"
                    }
                    alt=""
                    className="student-avatar"
                  />

                  <div>

                    <h3>
                      {
                        submission.profile
                          ?.username
                      }
                    </h3>

                    <p>
                      {
                        submission.profile
                          ?.email
                      }
                    </p>

                  </div>

                </div>

                <div className="submission-body">

                  <h4>
                    Student Answer
                  </h4>

                  <p>
                    {submission.answer}
                  </p>

                </div>

                {submission.file_url && (

                  <a
                    href={
                      submission.file_url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="file-link"
                  >
                    View Uploaded File
                  </a>

                )}

                <div className="submission-meta">

                  <span>
                    Status:
                    {" "}
                    {
                      submission.status
                    }
                  </span>

                  <span>
                    Submitted:
                    {" "}
                    {
                      new Date(
                        submission.submitted_at
                      ).toLocaleString()
                    }
                  </span>

                </div>

                <div className="grade-area">

                  <div>
                    Score:
                    {" "}
                    {
                      submission.score ??
                      "Not Graded"
                    }
                  </div>

                  <Link
                    className="grade-btn"
                    to={`/teacher/grade/${submission.id}`}
                  >
                    Grade Submission
                  </Link>

                </div>

              </div>
            )
          )}

        </div>

      )}

    </div>
  );
}