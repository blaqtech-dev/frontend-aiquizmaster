import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./adminclassroom.css";

export function AdminClassroomsPage() {

  const [loading, setLoading] =
    useState(true);

  const [classrooms, setClassrooms] =
    useState([]);

  const [filteredClassrooms,
    setFilteredClassrooms] =
    useState([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadClassrooms();
  }, []);

  useEffect(() => {

    const filtered =
      classrooms.filter(
        (room) =>

          room.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          room.subject
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          room.teacherName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

    setFilteredClassrooms(
      filtered
    );

  }, [search, classrooms]);

  async function loadClassrooms() {

    try {

      setLoading(true);

      const {
        data: rooms,
        error
      } = await supabase

        .from("classrooms")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false
          }
        );

      if (error) throw error;

      const finalData =
        await Promise.all(

          (rooms || []).map(
            async (room) => {

              // teacher

              const {
                data: teacher
              } = await supabase

                .from("profiles")

                .select(
                  "username,email"
                )

                .eq(
                  "id",
                  room.teacher_id
                )

                .maybeSingle();

              // students

              const {
                count: studentCount
              } = await supabase

                .from(
                  "classroom_members"
                )

                .select(
                  "*",
                  {
                    count: "exact",
                    head: true
                  }
                )

                .eq(
                  "classroom_id",
                  room.id
                );

              // assignments

              const {
                count: assignmentCount
              } = await supabase

                .from(
                  "assignments"
                )

                .select(
                  "*",
                  {
                    count: "exact",
                    head: true
                  }
                )

                .eq(
                  "classroom_id",
                  room.id
                );

              return {

                ...room,

                teacherName:
                  teacher?.username ||
                  "Unknown",

                teacherEmail:
                  teacher?.email ||
                  "No Email",

                students:
                  studentCount || 0,

                assignments:
                  assignmentCount || 0,

              };

            }
          )
        );

      setClassrooms(
        finalData
      );

      setFilteredClassrooms(
        finalData
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  async function deleteClassroom(
    classroomId
  ) {

    const confirmDelete =
      window.confirm(
        "Delete classroom permanently?"
      );

    if (!confirmDelete) return;

    const { error } =
      await supabase

        .from("classrooms")

        .delete()

        .eq(
          "id",
          classroomId
        );

    if (!error) {

      alert(
        "Classroom deleted"
      );

      loadClassrooms();

    }
  }

  if (loading) {

    return (

      <div className="admin-classroom-loading">

        <div className="admin-classroom-loader"></div>

        <h2>
          Loading Classrooms...
        </h2>

      </div>

    );
  }

  return (

    <div className="admin-classrooms-page">

      {/* HEADER */}

      <div className="admin-classrooms-header">

        <span className="admin-badge">
          CLASSROOM MANAGEMENT
        </span>

        <h1>
          Manage All Classrooms
        </h1>

        <p>
          Monitor teachers,
          students and assignments.
        </p>

      </div>

      {/* STATS */}

      <div className="classroom-stats-grid">

        <div className="classroom-stat-card">

          <h2>
            {classrooms.length}
          </h2>

          <p>
            Total Classrooms
          </p>

        </div>

        <div className="classroom-stat-card">

          <h2>
            {
              classrooms.reduce(
                (sum, room) =>
                  sum +
                  room.students,
                0
              )
            }
          </h2>

          <p>
            Students
          </p>

        </div>

        <div className="classroom-stat-card">

          <h2>
            {
              classrooms.reduce(
                (sum, room) =>
                  sum +
                  room.assignments,
                0
              )
            }
          </h2>

          <p>
            Assignments
          </p>

        </div>

      </div>

      {/* SEARCH */}

      <div className="admin-search-box">

        <input

          type="text"

          placeholder="
          Search classroom,
          teacher or subject...
          "

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

        />

      </div>

      {/* TABLE */}

      <div className="table-wrapper">

        <table>

          <thead>

            <tr>

              <th>
                Classroom
              </th>

              <th>
                Subject
              </th>

              <th>
                Teacher
              </th>

              <th>
                Students
              </th>

              <th>
                Assignments
              </th>

              <th>
                Code
              </th>

              <th>
                Created
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {
              filteredClassrooms.map(
                (room) => (

                  <tr
                    key={room.id}
                  >

                    <td>
                      {room.title}
                    </td>

                    <td>
                      {room.subject}
                    </td>

                    <td>

                      <div>

                        <strong>
                          {
                            room.teacherName
                          }
                        </strong>

                        <br />

                        <small>
                          {
                            room.teacherEmail
                          }
                        </small>

                      </div>

                    </td>

                    <td>
                      {room.students}
                    </td>

                    <td>
                      {room.assignments}
                    </td>

                    <td>
                      {room.class_code}
                    </td>

                    <td>

                      {
                        new Date(
                          room.created_at
                        ).toLocaleDateString()
                      }

                    </td>

                    <td>

                      <button

                        className="delete-btn"

                        onClick={() =>
                          deleteClassroom(
                            room.id
                          )
                        }

                      >

                        Delete

                      </button>

                    </td>

                  </tr>

                )
              )
            }

          </tbody>

        </table>

      </div>

    </div>

  );
}