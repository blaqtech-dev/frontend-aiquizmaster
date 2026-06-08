import { useState, useEffect }
from "react";

import {
  useNavigate,
  Link
} from "react-router-dom";
import { supabase } from "../../services/supabase/supabase";

import { useAuth } from "../../context/authcontext/authcontext";

import "./joinclassroom.css";

export function JoinClassroomPage() {

  const { user } =
    useAuth();

  const navigate =
    useNavigate();

  const [classCode,
    setClassCode] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [errorMessage,
    setErrorMessage] =
    useState("");

  const [successMessage,
    setSuccessMessage] =
    useState("");

  const [joinedClasses,
    setJoinedClasses] =
    useState([]);

  useEffect(() => {

    if (user) {

      loadJoinedClassrooms();
    }

  }, [user]);

  // ================= LOAD JOINED CLASSROOMS =================

  async function loadJoinedClassrooms() {

    const {
      data,
      error
    } = await supabase

      .from("classroom_members")

      .select(`
        *,
        classrooms (
          id,
          title,
          subject,
          description,
          class_code
        )
      `)

      .eq(
        "student_id",
        user.id
      );

    if (!error && data) {

      setJoinedClasses(data);
    }
  }

  // ================= JOIN CLASSROOM =================

  async function joinClassroom() {

    if (!classCode) {

      setErrorMessage(
        "Please enter classroom code."
      );

      return;
    }

    try {

      setLoading(true);

      setErrorMessage("");

      setSuccessMessage("");

      // ================= FIND CLASSROOM =================

      const {
        data: classroom,
        error: classroomError
      } = await supabase

        .from("classrooms")

        .select("*")

        .eq(
          "class_code",
          classCode.toUpperCase()
        )

        .single();

      if (
        classroomError ||
        !classroom
      ) {

        setErrorMessage(
          "Invalid classroom code."
        );

        setLoading(false);

        return;
      }

      // ================= CHECK IF ALREADY JOINED =================




      const {
        data: existingMember
      } = await supabase

        .from("classroom_members")

        .select("*")

        .eq(
          "classroom_id",
          classroom.id
        )

        .eq(
          "student_id",
          user.id
        )

        .maybeSingle();

      if (existingMember) {

        setErrorMessage(
          "You already joined this classroom."
        );

        setLoading(false);

        return;
      }


      await supabase .from("classroom_members") 
      .insert([ { classroom_id: classroom.id, user_id: user.id, username:
         user.user_metadata?.username || user.email, }, ]);

      // ================= INSERT MEMBER =================

      const {
        error: joinError
      } = await supabase

        .from("classroom_members")

        .insert([
          {
            classroom_id:
              classroom.id,

            student_id:
              user.id,
          },
        ]);

      if (joinError) {

        console.log(joinError);

        setErrorMessage(
          "Failed to join classroom."
        );

      } else {

        setSuccessMessage(
          "Successfully joined classroom."
        );

        setClassCode("");

        loadJoinedClassrooms();
      }

    } catch (err) {

      console.log(err);

      setErrorMessage(
        "Something went wrong."
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <div className="join-classroom-page">

      {/* ================= HEADER ================= */}

      <div className="join-header">

        <div className="join-badge">

          STUDENT PORTAL

        </div>

        <h1>

          Join Classroom

        </h1>

        <p>

          Enter classroom code shared
          by your teacher to join
          learning sessions,
          assignments and quizzes.

        </p>

      </div>

      {/* ================= CARD ================= */}

      <div className="join-card">

        <div className="join-top">

          <h2>
            Classroom Access
          </h2>

          <Link
            to="/student-dashboard"
            className="back-link"
          >

            ← Back Dashboard

          </Link>

        </div>

        {/* ERROR */}

        {
          errorMessage && (

            <div className="error-box">

              {errorMessage}

            </div>
          )
        }

        {/* SUCCESS */}

        {
          successMessage && (

            <div className="success-box">

              {successMessage}

            </div>
          )
        }

        {/* INPUT */}

        <div className="form-group">

          <label>

            Classroom Code

          </label>

          <input
            type="text"
            placeholder="Enter classroom code"
            value={classCode}
            onChange={(e) =>

              setClassCode(
                e.target.value
              )
            }
          />

        </div>

        {/* BUTTON */}

        <button
          className="join-btn"
          onClick={joinClassroom}
          disabled={loading}
        >

          {
            loading
              ? "Joining..."
              : "Join Classroom"
          }

        </button>

      </div>

      {/* ================= JOINED CLASSROOMS ================= */}

      <div className="joined-section">

        <div className="joined-top">

          <h2>

            Joined Classrooms

          </h2>

        </div>

        {
          joinedClasses.length === 0 ? (

            <div className="empty-classroom">

              <h3>

                No Classroom Joined

              </h3>

              <p>

                Join classrooms using
                classroom codes provided
                by your teacher.

              </p>

            </div>

          ) : (

            <div className="joined-grid">

              {
                joinedClasses.map((item) => (

                  <div
                    key={item.id}
                    className="joined-card"
                  >

                    <div className="joined-badge">

                      Classroom

                    </div>

                    <h3>

                      {
                        item.classrooms?.title
                      }

                    </h3>

                    <p>

                      {
                        item.classrooms?.description
                      }

                    </p>

                    <div className="joined-info">

                      <span>

                        Subject:
                        {" "}

                        {
                          item.classrooms?.subject
                        }

                      </span>

                      <span>

                        Code:
                        {" "}

                        {
                          item.classrooms?.class_code
                        }

                      </span>

                    </div>

                    <button
                      className="open-btn"
                      onClick={() =>

                        navigate(
                          `/classroom/${item.classrooms.id}`
                        )
                      }
                    >

                      Open Classroom

                    </button>

                  </div>
                ))
              }

            </div>
          )
        }

      </div>

    </div>
  );
}