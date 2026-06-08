import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase }
from "../../services/supabase/supabase";

import { useAuth }
from "../../context/authcontext/authcontext";

import "./teachersubmissions.css";

export default function TeacherSubmissionsPage() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [submissions, setSubmissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    if (user) {

      loadSubmissions();
    }

  }, [user]);

  async function loadSubmissions() {

    try {

      setLoading(true);

      // Teacher assignments

      const { data: assignments } =
        await supabase

          .from("assignments")

          .select(`
            id,
            title
          `)

          .eq(
            "teacher_id",
            user.id
          );

      const assignmentIds =
        assignments?.map(
          item => item.id
        ) || [];

      if (
        assignmentIds.length === 0
      ) {

        setSubmissions([]);

        return;
      }

      const { data, error } =
        await supabase

          .from(
            "assignment_submissions"
          )

          .select(`
            *,
            profiles(
              id,
              username,
              email,
              avatar_url
            )
          `)

          .in(
            "assignment_id",
            assignmentIds
          )

          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (error) {

        console.log(error);

        return;
      }

      const mergedData =
        data.map(submission => {

          const assignment =
            assignments.find(
              item =>
                item.id ===
                submission.assignment_id
            );

          return {

            ...submission,

            assignmentTitle:
              assignment?.title ||
              "Assignment",
          };
        });

      setSubmissions(
        mergedData
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  }

  if (loading) {

    return (

      <div className="teacher-submissions-loading">

        Loading submissions...

      </div>
    );
  }

  return (

    <div className="teacher-submissions-page">

      <div className="teacher-submissions-header">

        <h1>
          Student Submissions
        </h1>

        <p>
          Review and grade submitted assignments
        </p>

      </div>

      {
        submissions.length === 0 ? (

          <div className="empty-submissions">

            <h3>
              No submissions yet
            </h3>

          </div>

        ) : (

          <div className="submission-grid">

            {
              submissions.map(
                submission => (

                  <div
                    key={submission.id}
                    className="submission-card"
                  >

                    <div className="submission-top">

                      <img

                        src={
                          submission
                            ?.profiles
                            ?.avatar_url ||

                          "https://ui-avatars.com/api/?name=Student"
                        }

                        alt=""
                      />

                      <div>

                        <h3>

                          {
                            submission
                              ?.profiles
                              ?.username ||

                            submission
                              ?.profiles
                              ?.email ||

                            "Student"
                          }

                        </h3>

                        <p>

                          {
                            submission.assignmentTitle
                          }

                        </p>

                      </div>

                    </div>

                    <div className="submission-body">

                      <p>

                        Submitted:

                        {" "}

                        {
                          new Date(
                            submission.created_at
                          ).toLocaleString()
                        }

                      </p>

                     <div>
  {submission.score == null ? (
    <span className="status-pending">
      Pending Grading
    </span>
  ) : (
    <span className="status-graded">
      Graded
    </span>
  )}
</div>

                      {
                        submission.score !=
                        null && (

                          <div className="submission-score">
  Score: {submission.score}%
</div>
                        )
                      }

                    </div>

                    <button

                      className="grade-btn"

                      onClick={() =>

                        navigate(

                          `/teacher/grade/${submission.id}`

                        )
                      }
                    >

                      {
                        submission.score ==
                        null

                          ? "Grade"

                          : "View Grade"
                      }

                    </button>

                  </div>
                )
              )
            }

          </div>
        )
      }

    </div>
  );
}