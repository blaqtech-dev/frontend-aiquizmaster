import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./adminreports.css";

export function AdminReportsPage() {

  const [loading, setLoading] =
    useState(true);

  const [topStudents, setTopStudents] =
    useState([]);

  const [topTeachers, setTopTeachers] =
    useState([]);

  const [topUploads, setTopUploads] =
    useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {

    try {

      setLoading(true);

      // ==========================
      // QUIZ ATTEMPTS
      // ==========================

      const { data: attempts } =
        await supabase
          .from("quiz_attempts")
          .select("*");

      // ==========================
      // USERS
      // ==========================

      const { data: users } =
        await supabase
          .from("profiles")
          .select("*");

      // ==========================
      // PDFS
      // ==========================

      const { data: pdfs } =
        await supabase
          .from("quizzes")
          .select("*");

      // ==========================
      // TOP STUDENTS
      // ==========================

      const studentScores = {};

      attempts?.forEach((item) => {

        if (!studentScores[item.user_id]) {

          studentScores[item.user_id] = {
            total: 0,
            count: 0,
          };
        }

        studentScores[item.user_id].total +=
          item.percentage || 0;

        studentScores[item.user_id].count++;
      });

      const rankedStudents =
        Object.entries(studentScores)
          .map(([userId, score]) => {

            const profile =
              users?.find(
                (u) => u.id === userId
              );

            return {
              userId,
              username:
                profile?.username ||
                "Unknown",
              average:
                Math.round(
                  score.total /
                    score.count
                ) || 0,
            };
          })
          .sort(
            (a, b) =>
              b.average - a.average
          )
          .slice(0, 10);

      setTopStudents(
        rankedStudents
      );

      // ==========================
      // TOP TEACHERS
      // ==========================

      const teacherMap = {};

      users
        ?.filter(
          (u) =>
            u.role === "teacher"
        )
        .forEach((teacher) => {

          teacherMap[
            teacher.id
          ] = {
            username:
              teacher.username,
            classrooms: 0,
          };
        });

      const {
        data: classrooms,
      } = await supabase
        .from("classrooms")
        .select("*");

      classrooms?.forEach(
        (room) => {

          if (
            teacherMap[
              room.teacher_id
            ]
          ) {

            teacherMap[
              room.teacher_id
            ].classrooms++;
          }
        }
      );

      const rankedTeachers =
        Object.values(
          teacherMap
        )
          .sort(
            (a, b) =>
              b.classrooms -
              a.classrooms
          )
          .slice(0, 10);

      setTopTeachers(
        rankedTeachers
      );

      // ==========================
      // PDF UPLOADS
      // ==========================

      const uploadMap = {};

      pdfs?.forEach((pdf) => {

        if (
          !uploadMap[pdf.user_id]
        ) {

          uploadMap[pdf.user_id] = 0;
        }

        uploadMap[pdf.user_id]++;
      });

      const rankedUploads =
        Object.entries(uploadMap)
          .map(
            ([userId, count]) => {

              const profile =
                users?.find(
                  (u) =>
                    u.id === userId
                );

              return {
                username:
                  profile?.username ||
                  "Unknown",
                count,
              };
            }
          )
          .sort(
            (a, b) =>
              b.count - a.count
          )
          .slice(0, 10);

      setTopUploads(
        rankedUploads
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  if (loading) {

    return (
      <div className="reports-loading">
        <div className="reports-loader"></div>
        <h2>
          Loading Reports...
        </h2>
      </div>
    );
  }

  return (

    <div className="admin-reports-page">

      <div className="reports-header">

        <span className="reports-badge">
          PLATFORM REPORTS
        </span>

        <h1>
          Reports & Rankings
        </h1>

        <p>
          Monitor student
          performance, teacher
          activity and platform
          engagement.
        </p>

      </div>

      {/* TOP STUDENTS */}

      <div className="report-card">

        <h2>
          🏆 Top Students
        </h2>

        <table>

          <thead>

            <tr>
              <th>Name</th>
              <th>
                Average Score
              </th>
            </tr>

          </thead>

          <tbody>

            {topStudents.map(
              (
                student,
                index
              ) => (

                <tr
                  key={index}
                >

                  <td>
                    {
                      student.username
                    }
                  </td>

                  <td>
                    {
                      student.average
                    }
                    %
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      {/* TEACHERS */}

      <div className="report-card">

        <h2>
          👨‍🏫 Most Active Teachers
        </h2>

        <table>

          <thead>

            <tr>
              <th>Name</th>
              <th>
                Classrooms
              </th>
            </tr>

          </thead>

          <tbody>

            {topTeachers.map(
              (
                teacher,
                index
              ) => (

                <tr
                  key={index}
                >

                  <td>
                    {
                      teacher.username
                    }
                  </td>

                  <td>
                    {
                      teacher.classrooms
                    }
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      {/* PDF UPLOADS */}

      <div className="report-card">

        <h2>
          📄 Top Uploaders
        </h2>

        <table>

          <thead>

            <tr>
              <th>Name</th>
              <th>
                Uploads
              </th>
            </tr>

          </thead>

          <tbody>

            {topUploads.map(
              (
                user,
                index
              ) => (

                <tr
                  key={index}
                >

                  <td>
                    {
                      user.username
                    }
                  </td>

                  <td>
                    {
                      user.count
                    }
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}