import { useParams, Link } from "react-router-dom";

import { useEffect, useState } from "react";

import { supabase } from "../../services/supabase/supabase";

import { useAuth } from "../../context/authcontext/authcontext";

import "./classroom.css";

export function ClassroomPage() {

  const { id } = useParams();

  const { user } = useAuth();
const {profile}=useAuth()


  const [classroom, setClassroom] =
    useState(null);

  const [assignments, setAssignments] =
    useState([]);

  const [membersCount, setMembersCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

useEffect(() => {

  loadClassroom();

  const channel =

    supabase

      .channel(
        `classroom-${id}`
      )

    .on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "assignments",
  },

  (payload) => {

    console.log(
      "Assignment Realtime:",
      payload
    );

    // INSERT

    if (
      payload.eventType ===
      "INSERT"
    ) {

      if (
        payload.new.classroom_id ===
        id
      ) {

        setAssignments(prev => [

          payload.new,

          ...prev,
        ]);
      }
    }

    // DELETE

    if (
      payload.eventType ===
      "DELETE"
    ) {

      setAssignments(prev =>

        prev.filter(

          assignment =>

            assignment.id !==

            payload.old.id
        )
      );
    }

    // UPDATE

    if (
      payload.eventType ===
      "UPDATE"
    ) {

      setAssignments(prev =>

        prev.map(

          assignment =>

            assignment.id ===
            payload.new.id

              ? payload.new

              : assignment
        )
      );
    }
  }
)

      .subscribe(status => {

        console.log(
          "Assignment Channel:",
          status
        );
      });

  return () => {

    supabase.removeChannel(
      channel
    );
  };

}, [id]);

  async function loadClassroom() {

    try {

      setLoading(true);

      await Promise.all([
        getClassroom(),
        getAssignments(),
        getMembers(),
      ]);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  }

  async function getClassroom() {

    const { data, error } =
      await supabase
        .from("classrooms")
        .select("*")
        .eq("id", id)
        .single();

    if (!error) {

      setClassroom(data);
    }
  }

  async function getAssignments() {

    const { data, error } =
      await supabase
        .from("assignments")
        .select("*")
        .eq("classroom_id", id)
        .order("created_at", {
          ascending: false,
        });

    if (!error) {

      setAssignments(data || []);
    }
  }

  async function getMembers() {

    const { data, error } =
      await supabase
        .from("classroom_members")
        .select("*")
        .eq("classroom_id", id);

    if (!error) {

      setMembersCount(data?.length || 0);
    }
  }

  if (loading) {

    return (

      <div className="classroom-loading">

        <div className="classroom-loader"></div>

        <h2>
          Loading Classroom...
        </h2>

      </div>
    );
  }

  return (

    <div className="classroom-page">

      {/* HERO */}

      <section className="classroom-hero">

        <div className="classroom-hero-left">

          <div className="classroom-badge">
            DIGITAL CLASSROOM
          </div>

          <h1>
            {classroom?.title}
          </h1>

          <p>
            {
              classroom?.description
            }
          </p>

          <div className="classroom-meta">

            <div className="meta-card">

              <h3>
                {assignments.length}
              </h3>

              <span>
                Assignments
              </span>

            </div>

            <div className="meta-card">

              <h3>
                {membersCount}
              </h3>

              <span>
                Students
              </span>

            </div>

            <div className="meta-card">

              <h3>
                Active
              </h3>

              <span>
                Classroom Status
              </span>

            </div>

          </div>

        </div>

        <div className="classroom-hero-right">

          <div className="classroom-side-card">

            <h2>
              Classroom Tools
            </h2>

            <div className="side-tools">

              <Link
                to={`/classroom/${id}/forum`}
                className="tool-card"
              >

                <div className="tool-icon">
                  💬
                </div>

                <div>

                  <h3>
                    Discussion Forum
                  </h3>

                  <p>
                    Ask questions and chat
                    with classmates
                  </p>

                </div>

              </Link>

              <Link
                to="/leaderboard"
                className="tool-card"
              >

                <div className="tool-icon">
                  🏆
                </div>

                <div>

                  <h3>
                    Leaderboard
                  </h3>

                  <p>
                    Track performance
                    rankings
                  </p>

                </div>

              </Link>

              <Link
                to="/dashboard"
                className="tool-card"
              >

                <div className="tool-icon">
                  📚
                </div>

                <div>

                  <h3>
                    Main Dashboard
                  </h3>

                  <p>
                    Return to learning
                    dashboard
                  </p>

                </div>

              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* ASSIGNMENTS */}

      <section className="classroom-section">

        <div className="section-top">

          <div>

            <span className="section-mini-title">
              CLASS ACTIVITIES
            </span>

            <h2>
              Assignments
            </h2>

          </div>

        </div>

        {
          assignments.length === 0 ? (

            <div className="empty-assignments">

              <div className="empty-icon">
                📄
              </div>

              <h3>
                No Assignments Yet
              </h3>

              <p>
                This classroom does not
                have any assignments
                available yet.
              </p>

            </div>

          ) : (

            <div className="assignments-grid">

              {assignments.map((item) => (

                <div
                  key={item.id}
                  className="assignment-card"
                >

                  <div className="assignment-top">

                    <div className="assignment-icon">
                      📝
                    </div>

                    <div className="assignment-status">
                      Active
                    </div>

                  </div>

                  <h3>
                    {item.title}
                  </h3>
{item.file_url && (
  <a
    href={item.file_url}
    target="_blank"
    rel="noreferrer"
    className="assignment-file-btn"
  >
    📎 Download Attachment
  </a>
)}
                  

                  <p>
                    {item.instructions}
                  </p>

                  <div className="assignment-footer">

                    <span>
                      Due Date
                    </span>

                    <strong>
                      {
                        item.due_date
                          ? new Date(
                              item.due_date
                            ).toLocaleString()
                          : "No due date"
                      }
                    </strong>

                  </div>

<div className="assignment-actions">

  {profile?.role === "student" && (

    <Link
      className="submit-btn"
      to={`/student/assignment/${item.id}`}
    >
      Submit Assignment
    </Link>

  )}

  {profile?.role === "teacher" && (

    <Link
      className="view-btn"
      to={`/teacher/submissions/${item.id}`}
    >
      View Submissions
    </Link>

  )}

</div>
                </div>
              ))}

            </div>
          )
        }

      </section>
<div className="assignment-actions">

  

</div>
    </div>
  );
}