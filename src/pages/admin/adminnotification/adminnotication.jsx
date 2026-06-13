import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase/supabase";
import "./adminnotification.css";

export function AdminNotificationsPage() {

  const [loading, setLoading] =
    useState(true);

  const [users, setUsers] =
    useState([]);

  const [notifications, setNotifications] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [target, setTarget] =
    useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    try {

      setLoading(true);

      const {
        data: userData
      } = await supabase

        .from("profiles")
        .select("*");

      const {
        data: notificationData
      } = await supabase

        .from("notifications")
        .select("*")
        .order(
          "created_at",
          { ascending: false }
        );

      setUsers(userData || []);
      setNotifications(
        notificationData || []
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  async function sendNotification() {

    if (!title || !message) {

      alert(
        "Title and message required"
      );

      return;
    }

    let recipients = [];

    if (target === "all") {

      recipients = users;

    } else if (
      target === "student"
    ) {

      recipients =
        users.filter(
          (u) =>
            u.role === "student"
        );

    } else {

      recipients =
        users.filter(
          (u) =>
            u.role === "teacher"
        );
    }

    const inserts =
      recipients.map(
        (user) => ({
          user_id: user.id,
          title,
          message,
          type: "announcement",
          read: false,
        })
      );

    const { error } =
      await supabase

        .from("notifications")

        .insert(inserts);

    if (error) {

      console.log(error);

      alert(
        "Failed to send notification"
      );

      return;
    }

    alert(
      `Notification sent to ${recipients.length} users`
    );

    setTitle("");
    setMessage("");

    loadData();
  }

  async function deleteNotification(id) {

    const confirmDelete =
      window.confirm(
        "Delete notification?"
      );

    if (!confirmDelete) return;

    const { error } =
      await supabase

        .from("notifications")

        .delete()

        .eq("id", id);

    if (!error) {

      loadData();

      alert(
        "Notification deleted"
      );
    }
  }

  if (loading) {

    return (

      <div className="adminnotify-loading">

        <div className="adminnotify-loader"></div>

        <h2>
          Loading Notifications...
        </h2>

      </div>
    );
  }

  return (

    <div className="adminnotify-page">

      <div className="adminnotify-header">

        <span className="adminnotify-badge">
          NOTIFICATION CENTER
        </span>

        <h1>
          Admin Notifications
        </h1>

        <p>
          Broadcast announcements
          across the platform.
        </p>

      </div>

      {/* STATS */}

      <div className="adminnotify-stats">

        <div className="notify-card">

          <h2>
            {users.length}
          </h2>

          <p>
            Total Users
          </p>

        </div>

        <div className="notify-card">

          <h2>
            {
              users.filter(
                (u) =>
                  u.role === "student"
              ).length
            }
          </h2>

          <p>
            Students
          </p>

        </div>

        <div className="notify-card">

          <h2>
            {
              users.filter(
                (u) =>
                  u.role === "teacher"
              ).length
            }
          </h2>

          <p>
            Teachers
          </p>

        </div>

        <div className="notify-card">

          <h2>
            {notifications.length}
          </h2>

          <p>
            Notifications Sent
          </p>

        </div>

      </div>

      {/* SEND FORM */}

      <div className="notify-form">

        <h2>
          Send Notification
        </h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />

        <textarea
          rows="5"
          placeholder="Message..."
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
        />

        <select
          value={target}
          onChange={(e) =>
            setTarget(
              e.target.value
            )
          }
        >

          <option value="all">
            All Users
          </option>

          <option value="student">
            Students Only
          </option>

          <option value="teacher">
            Teachers Only
          </option>

        </select>

        <button
          className="send-btn"
          onClick={
            sendNotification
          }
        >

          Send Notification

        </button>

      </div>

      {/* HISTORY */}

      <div className="notify-history">

        <h2>
          Notification History
        </h2>

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Title
                </th>

                <th>
                  Message
                </th>

                <th>
                  Type
                </th>

                <th>
                  Date
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {notifications.map(
                (item) => (

                <tr key={item.id}>

                  <td>
                    {item.title}
                  </td>

                  <td>
                    {item.message}
                  </td>

                  <td>
                    {item.type}
                  </td>

                  <td>

                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}

                  </td>

                  <td>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteNotification(
                          item.id
                        )
                      }
                    >

                      Delete

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}