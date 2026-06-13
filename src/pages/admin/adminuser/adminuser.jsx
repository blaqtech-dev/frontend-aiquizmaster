import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./adminuser.css";

export function AdminUsersPage() {

  const [users, setUsers] = useState([]);

  const [filteredUsers, setFilteredUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {

    const filtered =
      users.filter((user) =>

        user.username
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        user.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );

    setFilteredUsers(filtered);

  }, [search, users]);

  async function loadUsers() {

    try {

      setLoading(true);

      const { data, error } =
        await supabase

          .from("profiles")

          .select("*")

          .order(
            "created_at",
            { ascending: false }
          );

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  async function changeRole(
    userId,
    role
  ) {

    const confirmChange =
      window.confirm(
        `Change role to ${role}?`
      );

    if (!confirmChange) return;

    const { error } =
      await supabase

        .from("profiles")

        .update({
          role,
        })

        .eq("id", userId);

    if (!error) {

      loadUsers();

      alert(
        "Role updated successfully"
      );
    }
  }

  async function changePlan(
    userId,
    plan
  ) {

    const confirmChange =
      window.confirm(
        `Change plan to ${plan}?`
      );

    if (!confirmChange) return;

    const { error } =
      await supabase

        .from("profiles")

        .update({
          plan,
        })

        .eq("id", userId);

    if (!error) {

      loadUsers();

      alert(
        "Plan updated successfully"
      );
    }
  }

async function suspendUser(userId) {

  const confirmSuspend =
    window.confirm(
      "Suspend this user?"
    );

  if (!confirmSuspend) return;

  const { error } =
    await supabase

      .from("profiles")

      .update({
        status: "suspended",
      })

      .eq("id", userId);

  if (error) {

    alert(
      "Failed to suspend user"
    );

    return;
  }

  alert(
    "User suspended successfully"
  );

  loadUsers();
}

  if (loading) {

    return (

      <div className="admin-users-loading">

        <div className="admin-users-loader"></div>

        <h2>
          Loading Users...
        </h2>

      </div>
    );
  }

  return (

    <div className="admin-users-page">

      <div className="admin-users-header">

        <div>

          <span className="admin-users-badge">
            USER MANAGEMENT
          </span>

          <h1>
            Manage Platform Users
          </h1>

          <p>
            Update roles,
            plans and user access.
          </p>

        </div>

      </div>

      <div className="admin-search-box">

        <input
          type="text"
          placeholder="Search username or email..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

      </div>

      <div className="admin-users-stats">

        <div className="mini-card">

          <h2>
            {users.length}
          </h2>

          <p>
            Total Users
          </p>

        </div>

        <div className="mini-card">

          <h2>
            {
              users.filter(
                (u) =>
                  u.role ===
                  "student"
              ).length
            }
          </h2>

          <p>
            Students
          </p>

        </div>

        <div className="mini-card">

          <h2>
            {
              users.filter(
                (u) =>
                  u.role ===
                  "teacher"
              ).length
            }
          </h2>

          <p>
            Teachers
          </p>

        </div>

        <div className="mini-card">

          <h2>
            {
              users.filter(
                (u) =>
                  u.plan ===
                  "pro"
              ).length
            }
          </h2>

          <p>
            Pro Users
          </p>

        </div>

      </div>

      <div className="table-wrapper">

        <table>

          <thead>

            <tr>

              <th>
                Username
              </th>

              <th>
                Email
              </th>

              <th>
                Role
              </th>

              <th>
                Plan
              </th>

              <th>
                status
              </th>

              <th>
                Joined
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredUsers.map(
              (user) => (


                

                <tr
                  key={user.id}
                >

                  <td>
                    {
                      user.username
                    }
                  </td>

                  <td>
                    {
                      user.email
                    }
                  </td>

                  <td>
  {user.status || "active"}
</td>

                  <td>

                    <select

                      value={
                        user.role ||
                        ""
                      }

                      onChange={(
                        e
                      ) =>
                        changeRole(
                          user.id,
                          e.target
                            .value
                        )
                      }
                    >

                      <option value="student">
                        Student
                      </option>

                      <option value="teacher">
                        Teacher
                      </option>

                      <option value="admin">
                        Admin
                      </option>

                    </select>

                  </td>

                  <td>

                    <select

                      value={
                        user.plan ||
                        "free"
                      }

                      onChange={(
                        e
                      ) =>
                        changePlan(
                          user.id,
                          e.target
                            .value
                        )
                      }
                    >

                      <option value="free">
                        Free
                      </option>

                      <option value="pro">
                        Pro
                      </option>

                    </select>

                  </td>

                  <td>

                    {new Date(
                      user.created_at
                    ).toLocaleDateString()}

                  </td>

            <td>

  {user.role === "admin" ? (

    <span className="protected-admin">
      Protected
    </span>

  ) : (

    <button

      className="suspend-btn"

      onClick={() =>
        suspendUser(
          user.id
        )
      }
    >

      Suspend

    </button>

  )}

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