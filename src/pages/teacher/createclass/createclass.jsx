import { useState }
from "react";

import {
  useNavigate,
  Link
} from "react-router-dom";
import { requirePro } from "../../../services/checkproaccess/checkproaccess";

import { supabase }
from "../../../services/supabase/supabase";


import { useAuth }
from "../../../context/authcontext/authcontext";

import "./createclass.css";

export function CreateClassroomPage() {

 const { user, profile } = useAuth();

const navigate = useNavigate();

const isPro =
  profile?.plan === "pro";

  const [title,
    setTitle] =
    useState("");

  const [description,
    setDescription] =
    useState("");

  const [subject,
    setSubject] =
    useState("");

  const [classCode,
    setClassCode] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [errorMessage,
    setErrorMessage] =
    useState("");

  function generateClassCode() {

    const code =
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    setClassCode(code);
  }

  async function createClassroom() {

    if (
  !requirePro(
    isPro,
    navigate,
    "Classroom creation requires Pro."
  )
) {
  return;
}

    if (
      !title ||
      !description ||
      !subject
    ) {

      setErrorMessage(
        "Please fill all fields."
      );

      return;
    }

    try {

      setLoading(true);

      setErrorMessage("");

      const finalCode =
        classCode ||
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

 const {
  data,
  error,
} = await supabase
  .from("classrooms")
  .insert([
    {
      title,
      description,
      subject,
      class_code: finalCode,
      teacher_id: user.id,
    },
  ]);

console.log("DATA:", data);
console.log("ERROR:", error);

      if (error) {

        console.log(error);

        setErrorMessage(
          "Failed to create classroom."
        );

      } else {

        navigate(
          "/teacher-dashboard"
        );
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

    <div className="create-classroom-page">

      {/* ================= HEADER ================= */}

      <div className="create-classroom-header">

        <div className="create-badge">
          TEACHER PORTAL
        </div>

        <h1>
          Create New Classroom
        </h1>

        <p>
          Build a learning environment
          for your students,
          organize subjects,
          share assignments,
          and manage academic activities easily.
        </p>

      </div>

      {/* ================= FORM ================= */}

      <div className="create-classroom-card">

        <div className="form-top">

          <h2>
            Classroom Details
          </h2>

          <Link
            to="/teacher-dashboard"
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

        {/* TITLE */}

        <div className="form-group">

          <label>
            Classroom Title
          </label>

          <input
            type="text"
            placeholder="Enter classroom title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

        </div>

        {/* SUBJECT */}

        <div className="form-group">

          <label>
            Subject
          </label>

          <input
            type="text"
            placeholder="Example: Mathematics"
            value={subject}
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
          />

        </div>

        {/* DESCRIPTION */}

        <div className="form-group">

          <label>
            Description
          </label>

          <textarea
            placeholder="Describe this classroom..."
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          ></textarea>

        </div>

        {/* CLASS CODE */}

        <div className="form-group">

          <label>
            Classroom Join Code
          </label>

          <div className="code-row">

            <input
              type="text"
              placeholder="Generate classroom code"
              value={classCode}
              onChange={(e) =>
                setClassCode(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              className="generate-btn"
              onClick={
                generateClassCode
              }
            >
              Generate
            </button>

          </div>

        </div>

        {/* ACTION BUTTON */}

        <button
          className="create-btn"
          onClick={
            createClassroom
          }
          disabled={loading}
        >

          {
            loading
              ? "Creating..."
              : "Create Classroom"
          }

        </button>

      </div>

    </div>
  );
}