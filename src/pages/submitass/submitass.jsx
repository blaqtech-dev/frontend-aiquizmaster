import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { supabase } from "../../services/supabase/supabase";
import { useAuth } from "../../context/authcontext/authcontext";

import "./submitass.css";

export default function SubmitAssignmentPage() {

  const { assignmentId } = useParams();

  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);

  const [submissionText, setSubmissionText] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [existingSubmission,
    setExistingSubmission] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {

    if (!assignmentId || !user)
      return;

    loadAssignment();

    loadSubmission();

  }, [assignmentId, user]);

  async function loadAssignment() {

    const { data, error } =
      await supabase

        .from("assignments")

        .select(`
          *,
          classrooms(title)
        `)

        .eq("id", assignmentId)

        .single();

    if (!error) {

      setAssignment(data);
    }

    setLoading(false);
  }

  async function loadSubmission() {

    const { data } =
      await supabase

        .from("assignment_submissions")

        .select("*")

        .eq("assignment_id", assignmentId)

        .eq("student_id", user.id)

        .maybeSingle();

    if (data) {

      setExistingSubmission(data);

      setSubmissionText(
        data.answer || ""
      );
    }
  }






  async function uploadFile() {

    if (!selectedFile)
      return null;

    const fileName =
      `${user.id}-${Date.now()}-${selectedFile.name}`;

    const { error } =
      await supabase

        .storage

        .from("assignment-files")

        .upload(
          fileName,
          selectedFile
        );

    if (error) {

      console.log(error);

      return null;
    }

    const { data } =
      supabase

        .storage

        .from("assignment-files")

        .getPublicUrl(
          fileName
        );

    return data.publicUrl;
  }


  async function submitAssignment() {

    try {

      setSubmitting(true);

 // 🔥 GET ASSIGNMENT FIRST (IMPORTANT)
    const { data: assignmentData, error: assignmentError } =
      await supabase
        .from("assignments")
        .select("title, teacher_id")
        .eq("id", assignmentId)
        .single();

    if (assignmentError) {
      alert("Assignment not found");
      return;
    }

      let fileUrl = null;

      if (selectedFile) {

        fileUrl =
          await uploadFile();
      }

      if (existingSubmission) {

        const { error } =
          await supabase

            .from(
              "assignment_submissions"
            )

            .update({

              answer:
                submissionText,

              file_url:
                fileUrl ||
                existingSubmission.file_url,

              updated_at:
                new Date(),

            })

            .eq(
              "id",
              existingSubmission.id
            );

        if (error) {

          alert(error.message);

          return;
        }



  // ✅ NOTIFICATION (UPDATE)
      await supabase.from("notifications").insert({
        user_id: assignmentData.teacher_id,
        type: "submission",
        title: "Assignment Updated",
        message: `${user.email} updated submission for "${assignmentData.title}"`,
        assignment_id: assignmentId,
        read: false,
      });



      } else {

        const { error } =
          await supabase

            .from(
              "assignment_submissions"
            )

            .insert([

              {

                assignment_id:
                  assignmentId,

                student_id:
                  user.id,

                answer:
                  submissionText,

                file_url:
                  fileUrl,

              },

            ]);

      if (error) {
  alert(error.message);
  return;
}

    



const notificationPayload = {
  user_id: assignmentData.teacher_id,
  type: "submission",
  title: "New Assignment Submission",
  message: `${user.email} submitted "${assignmentData.title}"`,
  assignment_id: assignmentId,
  read: false,
};

console.log("PAYLOAD:", notificationPayload);

const {
  data: notificationData,
  error: notificationError
} = await supabase
  .from("notifications")
  .insert(notificationPayload)
  .select();

console.log(
  "INSERT DATA:",
  notificationData
);

console.log(
  "INSERT ERROR:",
  notificationError
);
    }
      alert(
        "Assignment submitted successfully"
      );


  

      loadSubmission();

    } catch (err) {

      console.log(err);

    } finally {

      setSubmitting(false);
    }
  }



  
  if (loading) {

    return (
      <div className="submit-loading">
        Loading...
      </div>
    );
  }

  return (

    <div className="submit-page">

      <div className="submit-card">

        <div className="assignment-header">

          <h1>
            {assignment?.title}
          </h1>

          <span className="status">

            {
              existingSubmission
                ? "Submitted"
                : "Pending"
            }

          </span>

        </div>

        <div className="assignment-info">

          <p>

            <strong>
              Classroom:
            </strong>

            {" "}

            {
              assignment
              ?.classrooms
              ?.title
            }

          </p>

          <p>

            <strong>
              Due Date:
            </strong>

            {" "}

            {
              new Date(
                assignment.due_date
              ).toLocaleString()
            }

          </p>

        </div>

        <div className="assignment-instructions">

          <h3>
            Instructions
          </h3>

          

          <p>
            {
              assignment.instructions
            }
          </p>

        </div>

        <div className="submission-area">

          <h3>
            Your Answer
          </h3>

          <textarea

            value={submissionText}

            onChange={(e) =>
              setSubmissionText(
                e.target.value
              )
            }

            placeholder="
              Type your answer here...
            "

          />

          <input

            type="file"

            onChange={(e) =>
              setSelectedFile(
                e.target.files[0]
              )
            }

          />

          <button

            onClick={
              submitAssignment
            }

            disabled={submitting}

          >

            {
              submitting
                ? "Submitting..."
                : existingSubmission
                ? "Update Submission"
                : "Submit Assignment"
            }

          </button>

        </div>

        {
          existingSubmission?.score !=
          null && (

            <div className="grade-box">

              <h3>
                Grade
              </h3>

              <p>

                Score:

                {" "}

                {
                  existingSubmission.score
                }

              </p>

              <p>

                Feedback:

                {" "}

                {
                  existingSubmission.feedback ||
                  "No feedback"
                }

              </p>

            </div>

          )
        }

      </div>

    </div>
  );
}