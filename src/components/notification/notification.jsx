import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  Bell,
  Volume2,
  VolumeX,
  CheckCheck,
  Trash2,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase }
from "../../services/supabase/supabase";

import "./notification.css";

export function NotificationBell({
  user,
}) {

  const navigate =
    useNavigate();

  // ================= STATES =================

  const [notifications,
    setNotifications] =
    useState([]);

  const [open,
    setOpen] =
    useState(false);

  const [loading,
    setLoading] =
    useState(true);

  const [soundEnabled,
    setSoundEnabled] =
    useState(true);

  const dropdownRef =
    useRef(null);

  // ================= LOAD =================

  useEffect(() => {

    if (!user?.id)
      return;

    getNotifications();

    const channel =
      subscribeNotifications();

    // ================= CLOSE DROPDOWN =================

    function handleClickOutside(
      event
    ) {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {

        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      supabase.removeChannel(
        channel
      );
    };

  }, [user?.id]);

  // ================= GET NOTIFICATIONS =================


  

  async function getNotifications() {

    try {

      setLoading(true);

      const {
        data,
        error,
      } = await supabase

        .from("notifications")

        .select("*")

        .eq(
          "user_id",
          user.id
        )

        .order(
          "created_at",
          {
            ascending: false,
          }
        )

        .limit(50);

      if (error) {

        console.log(
          "Notification fetch error:",
          error
        );

        return;
      }

      setNotifications(
        data || []
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  }

  // ================= PLAY SOUND =================

  function playNotificationSound() {

    try {

      const audio =
        new Audio(
          "/notification.mp3"
        );

      audio.volume = 1;

      audio.play().catch(
        (error) => {

          console.log(
            "Sound blocked:",
            error
          );
        }
      );

    } catch (error) {

      console.log(
        "Audio error:",
        error
      );
    }
  }

  // ================= REALTIME =================

function subscribeNotifications() {

  const channel = supabase

    .channel(
      `notifications-${user.id}`
    )

    .on(
      "postgres_changes",

      {
     event: "INSERT",

        schema: "public",

        table: "notifications",

        filter:
          `user_id=eq.${user.id}`,
      },

      (payload) => {

        console.log(
          "🔥 NOTIFICATION EVENT:",
          payload
        );

        // INSERT

        if (
          payload.eventType ===
          "INSERT"
        ) {

         if (payload.eventType === "INSERT") {

  setNotifications(prev => {

    const exists = prev.some(
      item => item.id === payload.new.id
    );

    if (exists) return prev;

    return [payload.new, ...prev];
  });

  if (soundEnabled) {
    playNotificationSound();
  }
}
        }

        // UPDATE

        if (
          payload.eventType ===
          "UPDATE"
        ) {

          setNotifications(
            (prev) =>

              prev.map(
                item =>

                  item.id ===
                  payload.new.id

                    ? payload.new

                    : item
              )
          );
        }

        // DELETE

        if (
          payload.eventType ===
          "DELETE"
        ) {

          setNotifications(
            (prev) =>

              prev.filter(
                item =>

                  item.id !==
                  payload.old.id
              )
          );
        }
      }
    )

    .subscribe(
      (status) => {

        console.log(
          "📡 Notification status:",
          status
        );
      }
    );

  return channel;
}

  // ================= ENABLE BROWSER NOTIFICATION =================

  async function enableBrowserNotifications() {

    if (
      "Notification" in
      window
    ) {

      if (
        Notification.permission !==
        "granted"
      ) {

        await Notification.requestPermission();
      }
    }
  }

  // ================= MARK READ =================

  async function markAsRead(
    id
  ) {

    try {

      await supabase

        .from(
          "notifications"
        )

        .update({
          read: true,
        })

        .eq("id", id);

      setNotifications(
        (prev) =>

          prev.map(
            (notification) =>

              notification.id ===
              id

                ? {
                    ...notification,
                    read: true,
                  }

                : notification
          )
      );

    } catch (error) {

      console.log(error);
    }
  }

  // ================= MARK ALL READ =================

  async function markAllAsRead() {

    try {

      await supabase

        .from(
          "notifications"
        )

        .update({
          read: true,
        })

        .eq(
          "user_id",
          user.id
        )

        .eq(
          "read",
          false
        );

      setNotifications(
        (prev) =>

          prev.map(
            (notification) => ({
              ...notification,
              read: true,
            })
          )
      );

    } catch (error) {

      console.log(error);
    }
  }

  // ================= DELETE =================

async function deleteNotification(
  id
) {

  try {

    const { error } =
      await supabase

        .from(
          "notifications"
        )

        .delete()

        .eq("id", id);

    if (error) {

      console.log(error);

      return;
    }

    setNotifications(
      (prev) =>

        prev.filter(
          item =>
            item.id !== id
        )
    );

  } catch (error) {

    console.log(error);
  }
}

  // ================= TYPE ICON =================

  function getTypeIcon(type) {

    switch (type) {

      case "assignment":
        return "📚";

      case "announcement":
        return "📢";

      case "classroom":
        return "🏫";

        case "submission":
  return "📥";

case "grade":
  return "📝";

      case "quiz":
        return "🧠";

      case "chat":
        return "💬";

      default:
        return "🔔";
    }
  }

  // ================= NAVIGATION =================

  async function handleNotificationClick(
    notification
  ) {

    if (
      !notification.read
    ) {

      await markAsRead(
        notification.id
      );
    }

    setOpen(false);

  switch (
  notification.type
) {

  case "assignment":

    navigate(

      `/classroom/${notification.classroom_id}`

    );

    break;

    case "grade":

  navigate("/assignment");

  break;


  case "submission":

  navigate(
    `/teacher/submissions/${notification.assignment_id}`
  );

  break;

  case "announcement":

    navigate(
      "/global-feed"
    );

    break;

  case "classroom":

    navigate(
      `/classroom/${notification.classroom_id}`
    );

    break;

  default:

    navigate(
      "/global-feed"
    );
}
  }

  // ================= UNREAD =================

  const unreadCount =

    notifications.filter(
      (item) => !item.read
    ).length;

  return (

    <div
      className="notification-wrapper"
      ref={dropdownRef}
    >

      {/* ================= BELL ================= */}

      <button

        className="notification-btn"

        onClick={() => {

          setOpen(!open);

          enableBrowserNotifications();
        }}
      >

        <Bell size={22} />

        {
          unreadCount > 0 && (

            <span className="notification-count">

              {
                unreadCount > 9

                  ? "9+"

                  : unreadCount
              }

            </span>
          )
        }

      </button>

    

      {/* ================= DROPDOWN ================= */}

      {




        open && (

            <>
            <div
      className="notification-overlay"
      onClick={() => setOpen(false)}
    />

          <div className="notification-dropdown">

            {/* ================= TOP ================= */}

            <div className="notification-top">

              <div>

                <h2>
                  Notifications
                </h2>

                <p>
                  Real-time updates
                </p>

              </div>

              <div className="notification-top-actions">

                <button

                  className="sound-toggle-btn"

                  onClick={() =>

                    setSoundEnabled(
                      !soundEnabled
                    )
                  }
                >

                  {
                    soundEnabled ? (

                      <Volume2 size={16} />

                    ) : (

                      <VolumeX size={16} />

                    )
                  }

                </button>

                {
                  unreadCount > 0 && (

                    <button

                      className="mark-read-btn"

                      onClick={
                        markAllAsRead
                      }
                    >

                      <CheckCheck size={15} />

                      Read All

                    </button>
                  )
                }

              </div>

            </div>

            {/* ================= BODY ================= */}

            <div className="notification-body">

              {
                loading ? (

                  <div className="notification-loading">

                    Loading notifications...

                  </div>

                ) : notifications.length === 0 ? (

                  <div className="empty-notifications">

                    <div className="empty-bell">

                      🔔

                    </div>

                    <h3>
                      No Notifications
                    </h3>

                    <p>
                      Classroom updates and assignments
                      will appear here.
                    </p>

                  </div>

                ) : (

                  notifications.map(
                    (
                      notification
                    ) => (

                      <div

                        key={
                          notification.id
                        }

                        className={`notification-item ${
                          notification.read

                            ? ""

                            : "unread-notification"
                        }`}
                      >

                        {/* ================= LEFT ================= */}

                        <div className="notification-icon">

                          {
                            getTypeIcon(
                              notification.type
                            )
                          }

                        </div>

                        {/* ================= CONTENT ================= */}

                        <div

                          className="notification-content"

                          onClick={() =>

                            handleNotificationClick(
                              notification
                            )
                          }
                        >

                          <h4>

                            {
                              notification.title
                            }

                          </h4>

                          <p>

                            {
                              notification.message
                            }

                          </p>

                          <span>

                            {
                              new Date(
                                notification.created_at
                              ).toLocaleString()
                            }

                          </span>

                        </div>

                        {/* ================= DELETE ================= */}

                        <button

                          className="delete-notification-btn"

                          onClick={() =>

                            deleteNotification(
                              notification.id
                            )
                          }
                        >

                          <Trash2 size={16} />

                        </button>

                      </div>
                    )
                  )
                )
              }

            </div>

            {/* ================= FOOTER ================= */}


          </div>
          </>
        )
      }

    </div>
  );
}