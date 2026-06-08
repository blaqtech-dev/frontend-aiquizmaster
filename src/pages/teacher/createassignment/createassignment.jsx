import {
  useState,
  useEffect,
} from "react";

import { supabase }
from "../../../services/supabase/supabase";

import { useAuth }
from "../../../context/authcontext/authcontext";

import { requirePro } from "../../../services/checkproaccess/checkproaccess";

import { Link } from "react-router-dom";

import {
  createNotification,
} from "../../../services/notificationservive/notification";
import { useNavigate } from "react-router-dom";
import "./createassignment.css";

export function CreateAssignmentPage() {

const { user, profile } = useAuth();

const navigate = useNavigate();

const isPro =
  profile?.plan === "pro";
  // ================= STATES =================

  const [classrooms,
    setClassrooms] =
    useState([]);

  const [assignments,
    setAssignments] =
    useState([]);

  const [title,
    setTitle] =
    useState("");

  const [instructions,
    setInstructions] =
    useState("");

  const [classroomId,
    setClassroomId] =
    useState("");

  const [dueDate,
    setDueDate] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);


    const [file, setFile] =
  useState(null);


  const [message,
    setMessage] =
    useState("");

  const [loadingAssignments,
    setLoadingAssignments] =
    useState(true);

  // ================= LOAD =================

useEffect(() => {

  if (!user) return;

  getRooms();

  getAssignments();

  const channel =

    supabase

      .channel(
        "assignments-realtime"
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assignments",
        },
        () => {
          getAssignments();
        }
      )

      .subscribe();

  return () => {

    supabase.removeChannel(
      channel
    );
  };

}, [user]);

  // ================= GET CLASSROOMS =================

  async function getRooms() {

    try {

      const { data, error } =
        await supabase

          .from("classrooms")

          .select("*")

          .eq(
            "teacher_id",
            user.id
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

      setClassrooms(
        data || []
      );

    } catch (error) {

      console.log(error);
    }
  }

  // ================= GET ASSIGNMENTS =================

  async function getAssignments() {

    try {

      setLoadingAssignments(
        true
      );

      const { data, error } =
        await supabase

          .from("assignments")

          .select(`
            *,
            classrooms(
              title
            )
          `)

          .eq(
            "teacher_id",
            user.id
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

      setAssignments(
        data || []
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoadingAssignments(
        false
      );
    }
  }

  // ================= CREATE ASSIGNMENT =================

  async function createAssignment() {


    if (
  !requirePro(
    isPro,
    navigate,
    "Assignment creation requires Pro."
  )
) {
  return;
}

    if (
      !title ||
      !instructions ||
      !classroomId ||
      !dueDate
    ) {

      setMessage(
        "Please fill all fields"
      );

      return;
    }
try {

  let fileUrl = null;

  let fileName = null;

  if (file) {

    fileName =
      `${Date.now()}-${file.name}`;

    const {

      error: uploadError

    } = await supabase.storage

      .from(
        "assignment-files"
      )

      .upload(
        fileName,
        file
      );

    if (uploadError) {

      setMessage(
        "File upload failed"
      );

      return;
    }

    const {

      data

    } = supabase.storage

      .from(
        "assignment-files"
      )

      .getPublicUrl(
        fileName
      );

    fileUrl =
      data.publicUrl;
  }

      setLoading(true);

      setMessage("");

      // ================= CREATE ASSIGNMENT =================

      const {
        data,
        error,
      } = await supabase

        .from("assignments")

        .insert([

          {
            teacher_id:
              user.id,

            classroom_id:
              classroomId,

            title,

            instructions,

            due_date:
              dueDate,

              file_url:
    fileUrl,

  file_name:
    fileName,
              
          },
        ])

        .select();

      if (error) {

        console.log(error);

        setMessage(
          "Failed to create assignment"
        );

        return;
      }

      // ================= GET CLASSROOM INFO =================

      const { data: classroomData } =
        await supabase

          .from("classrooms")

          .select("title")

          .eq(
            "id",
            classroomId
          )

          .single();

      // ================= GET CLASSROOM MEMBERS =================

       const {
  data: students,
  error: studentError,
} = await supabase

  .from("classroom_members")

  .select("student_id")

  .eq(
    "classroom_id",
    classroomId
  );

      if (studentError) {

        console.log(studentError);
      }

      // ================= SEND NOTIFICATIONS =================

      if (
        students &&
        students.length > 0
      ) 
    await Promise.all(

students.map(student =>

  createNotification({

    userId:
      student.student_id,

    classroomId,

    title:
      "📚 New Assignment",

    message:
      `${title} was posted in ${classroomData?.title}`,

    type:
      "assignment",
  })
)


);

      // ================= RESET =================

      setTitle("");

      setInstructions("");

      setClassroomId("");

      setDueDate("");

      setMessage(
        "Assignment Created Successfully"
      );
setFile(null);
      // ================= REFRESH =================

      getAssignments();

    } catch (error) {

      console.log(error);

      setMessage(
        "Something went wrong"
      );

    } finally {

      setLoading(false);
    }
  }

  // ================= DELETE =================
async function deleteAssignment(id) {

  const confirmDelete =
    window.confirm(
      "Delete this assignment?"
    );

  if (!confirmDelete) return;

  try {

    const { error } =
      await supabase

        .from("assignments")

        .delete()

        .eq("id", id);

    if (error) {
      console.log(error);
      return;
    }

    setAssignments(prev =>
      prev.filter(
        assignment =>
          assignment.id !== id
      )
    );

  } catch (error) {

    console.log(error);

  }
}

  return (

    <div className="create-assignment-page">

      <div className="assignment-container">

        {/* ================= HERO ================= */}

        <div className="assignment-top">

          <div>

            <div className="assignment-badge">

              TEACHER PANEL

            </div>

            <h1>
              Create Assignments
            </h1>

            <p>
              Create classroom tasks,
              homework,
              projects,
              and learning activities
              for your students.
            </p>

          </div>

          <div className="assignment-stats">

            <div className="assignment-stat-card">

              <h2>
                {assignments.length}
              </h2>

              <span>
                Assignments
              </span>

            </div>




            <div className="assignment-stat-card">

              <h2>
                {classrooms.length}
              </h2>

              <span>
                Classrooms
              </span>

            </div>

          </div>

        </div>

        {/* ================= FORM ================= */}

        <div className="assignment-form">

          <h2>
            New Assignment
          </h2>

          <div className="form-grid">

            <div className="form-group">

              <label>
                Assignment Title
              </label>

              <input
                type="text"
                placeholder="Enter assignment title"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Select Classroom
              </label>

              <select
                value={classroomId}
                onChange={(e) =>
                  setClassroomId(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Classroom
                </option>

                {
                  classrooms.map(
                    (room) => (

                      <option
                        key={room.id}
                        value={room.id}
                      >

                        {room.title}

                      </option>
                    )
                  )
                }

              </select>

            </div>

          </div>

          <div className="form-group">

            <label>
              Instructions
            </label>

            <div className="form-group">

  <label>

    Assignment File

  </label>

  <input
    type="file"
    onChange={(e)=>

      setFile(
        e.target.files[0]
      )
    }
  />

</div>


            <textarea
              placeholder="Write assignment instructions..."
              value={instructions}
              onChange={(e) =>
                setInstructions(
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Due Date
            </label>

            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) =>
                setDueDate(
                  e.target.value
                )
              }
            />

          </div>

          <button
            onClick={
              createAssignment
            }
            disabled={loading}
            className="create-btn"
          >

            {
              loading
                ? "Creating..."
                : "Create Assignment"
            }

          </button>

          {
            message && (

              <div className="message-box">

                {message}

              </div>
            )
          }

        </div>

        {/* ================= LIST ================= */}

        <div className="assignment-list">

          <div className="assignment-list-top">

            <h2>
              Your Assignments
            </h2>

            <span>
              {assignments.length}
              {" "}
              total
            </span>

          </div>

          {
            loadingAssignments ? (

              <div className="empty-assignment">

                Loading assignments...

              </div>

            ) : assignments.length > 0 ? (

              <div className="assignment-grid">

                {
                  assignments.map(
                    (assignment) => (

                      <div
                        key={assignment.id}
                        className="assignment-card"
                      >

                        <div className="assignment-card-top">

                          <div className="assignment-icon">

                            📝

                          </div>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteAssignment(
                                assignment.id
                              )
                            }
                          >

                            Delete

                          </button>

                        </div>

                        <h3>
                          {
                            assignment.title
                          }
                        </h3>

                        <p>
                          {
                            assignment.instructions
                          }
                        </p>

                        <div className="assignment-meta">

                          <span>

                            Classroom:
                            {" "}
                            {
                              assignment
                              ?.classrooms
                              ?.title
                            }

                          </span>

                          <span>

                            Due:
                            {" "}
                            {
                              new Date(
                                assignment.due_date
                              ).toLocaleString()
                            }

                          </span>




                          {
  assignment.file_url && (

    <a

      href={
        assignment.file_url
      }

      target="_blank"

      rel="noreferrer"

      className="assignment-file"

    >

      📎 View File

    </a>

  )
}

                        </div>
  <div className="assignment-actions">

    <Link
      to={`/teacher/submissions/${assignment.id}`}
      className="view-submissions-btn"
    >
      View Submissions
    </Link>

  </div>
                      </div>
                    )
                  )
                }

              </div>

            ) : (

              <div className="empty-assignment">

                <h3>
                  No assignments yet
                </h3>

                <p>
                  Start creating assignments
                  for your students.
                </p>

              </div>
            )
          }

        </div>


      </div>

    </div>
  );
}