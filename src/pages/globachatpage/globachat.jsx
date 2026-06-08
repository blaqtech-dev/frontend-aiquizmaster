
import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../../services/supabase/supabase";

import {
  useAuth,
} from "../../context/authcontext/authcontext";
import { requirePro } from "../../services/checkproaccess/checkproaccess";
import "./globalchat.css";
import { useNavigate } from "react-router-dom";

export function GlobalChatPage() {

  const { user,profile } =
    useAuth();

    const navigate = useNavigate();



const isPro =
  profile?.plan === "pro";

  // ================= STATES =================

  const [posts,
    setPosts] =
    useState([]);

  const [message,
    setMessage] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [feedLoading,
    setFeedLoading] =
    useState(true);

  const [filter,
    setFilter] =
    useState("all");

  const [postType,
    setPostType] =
    useState("general");

  const [classCode,
    setClassCode] =
    useState("");

  const [search,
    setSearch] =
    useState("");

  // ================= LOAD =================

  useEffect(() => {

    fetchPosts();

    const channel =

      supabase

        .channel(
          "global-feed-room"
        )

        // ================= INSERT =================

        .on(
          "postgres_changes",

          {
            event: "INSERT",

            schema: "public",

            table:
              "global_posts",
          },

          (payload) => {

            setPosts((prev) => {

              const exists =
                prev.some(
                  (item) =>
                    item.id ===
                    payload.new.id
                );

              if (exists)
                return prev;

              return [

                payload.new,

                ...prev,
              ];
            });
          }
        )

        // ================= DELETE =================

        .on(
          "postgres_changes",

          {
            event: "DELETE",

            schema: "public",

            table:
              "global_posts",
          },

          (payload) => {

            setPosts((prev) =>

              prev.filter(
                (item) =>

                  item.id !==
                  payload.old.id
              )
            );
          }
        )

        .subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );
    };

  }, []);

  // ================= FETCH =================

  async function fetchPosts() {

    try {

      setFeedLoading(true);

      const {
        data,
        error,
      } = await supabase

        .from("global_posts")

        .select("*")

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

      setPosts(data || []);

    } catch (error) {

      console.log(error);

    } finally {

      setFeedLoading(false);
    }
  }

  // ================= SEND =================
async function sendPost() {


    if (
  !requirePro(
    isPro,
    navigate,
    "Posting to the Global Feed requires Pro."
  )
) {
  return;
}

  if (!message.trim()) return;

  try {

    setLoading(true);

    const username =
      user?.user_metadata?.username ||
      user?.email?.split("@")[0] ||
      "User";

    // 1. GET ROLE
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "student";

    // 2. INSERT POST
    const { data: post, error } = await supabase
      .from("global_posts")
      .insert([
        {
          user_id: user.id,
          username,
          role,
          content: message,
          type: postType,
          class_code: classCode || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(error);
      return;
    }

    // 3. GET USERS (FOR NOTIFICATIONS)
    const { data: users } = await supabase
      .from("profiles")
      .select("id");

    if (users && users.length > 0) {

      const notifications = users
        .filter(u => u.id !== user.id)
        .map(u => ({
          user_id: u.id,
          title:
            postType === "announcement"
              ? "📢 New Announcement"
              : postType === "class_code"
              ? "🏫 New Classroom Code"
              : "💬 New Post",

          message: `${username}: ${message.slice(0, 60)}`,
          type: postType,
          read: false,
          classroom_id: null,
        }));

      await supabase.from("notifications").insert(notifications);
    }

    setMessage("");
    setClassCode("");
    setPostType("general");

  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
}



// ================= GET ALL USERS =================



  // ================= DELETE =================

  async function deletePost(
    id
  ) {

    const confirmDelete =
      window.confirm(
        "Delete this post?"
      );

    if (!confirmDelete)
      return;

    try {

      await supabase

        .from(
          "global_posts"
        )

        .delete()

        .eq("id", id);

    } catch (error) {

      console.log(error);
    }
  }

  // ================= FILTER =================

  const filteredPosts =
    posts.filter((post) => {

      const matchesType =

        filter === "all" ||

        post.type === filter;

      const matchesSearch =

        post.content
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        post.username
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        post.class_code
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        matchesType &&
        matchesSearch
      );
    });

  // ================= BADGE =================

  function getBadge(type) {

    switch (type) {

      case "announcement":
        return "📢 Announcement";

      case "class_code":
        return "🏫 Classroom";

      default:
        return "💬 Discussion";
    }
  }

  // ================= ROLE =================

  function getRole(role) {

    if (
      role === "teacher"
    ) {

      return "👨‍🏫 Teacher";
    }

    return "🎓 Student";
  }

  return (

    <div className="global-chat-page">

      {/* ================= HERO ================= */}

      <div className="global-hero">

        <div className="hero-overlay"></div>

        <div className="global-hero-content">

          <div className="global-badge">

            COMMUNITY FEED

          </div>

          <h1>

            AI Learning Community

          </h1>

          <p>

            Share announcements,
            class updates,
            assignments,
            discussions,
            and classroom codes.

          </p>

        </div>

      </div>

      {/* ================= CREATE ================= */}

      <div className="global-create-card">

        <div className="create-top">

          <div className="create-avatar">

            {
              user?.email
                ?.charAt(0)
                .toUpperCase()
            }

          </div>

          <div>

            <h3>
              Create Post
            </h3>

            <p>
              Share updates with the community
            </p>

          </div>

        </div>

        {/* ================= TYPE ================= */}

        <div className="post-type-buttons">

          <button

            className={
              postType ===
              "general"

                ? "active-post-type"

                : ""
            }

            onClick={() =>
              setPostType(
                "general"
              )
            }
          >

            💬 General

          </button>

          <button

            className={
              postType ===
              "announcement"

                ? "active-post-type"

                : ""
            }

            onClick={() =>
              setPostType(
                "announcement"
              )
            }
          >

            📢 Announcement

          </button>

          <button

            className={
              postType ===
              "class_code"

                ? "active-post-type"

                : ""
            }

            onClick={() =>
              setPostType(
                "class_code"
              )
            }
          >

            🏫 Class Code

          </button>

        </div>

        {/* ================= CLASS CODE ================= */}

        {
          postType ===
            "class_code" && (

            <input

              type="text"

              className="class-code-input"

              placeholder="Enter classroom code"

              value={classCode}

              onChange={(e) =>
                setClassCode(
                  e.target.value
                )
              }
            />
          )
        }

        {/* ================= TEXTAREA ================= */}

        <textarea

          placeholder="Share update, classroom announcement, assignment, discussion..."

          value={message}

          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
        />

        <button

          className="post-btn"

          onClick={sendPost}

          disabled={loading}
        >

          {
            loading

              ? "Posting..."

              : "Post Update"
          }

        </button>

      </div>

      {/* ================= TOOLS ================= */}

      <div className="global-tools">

        <input

          type="text"

          placeholder="Search feed..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <div className="feed-filters">

          <button

            className={
              filter === "all"

                ? "active-filter"

                : ""
            }

            onClick={() =>
              setFilter("all")
            }
          >

            All

          </button>

          <button

            className={
              filter ===
              "announcement"

                ? "active-filter"

                : ""
            }

            onClick={() =>
              setFilter(
                "announcement"
              )
            }
          >

            Announcements

          </button>

          <button

            className={
              filter ===
              "class_code"

                ? "active-filter"

                : ""
            }

            onClick={() =>
              setFilter(
                "class_code"
              )
            }
          >

            Classroom Codes

          </button>

        </div>

      </div>

      {/* ================= POSTS ================= */}

      <div className="global-posts">

        {
          feedLoading ? (

            <div className="empty-feed">

              <h2>
                Loading Feed...
              </h2>

            </div>

          ) : filteredPosts.length > 0 ? (

            filteredPosts.map(
              (post) => (

                <div

                  key={post.id}

                  className="global-card"
                >

                  {/* ================= TOP ================= */}

                  <div className="global-user">

                    <div className="avatar">

                      {
                        post.username
                          ?.charAt(0)
                          .toUpperCase()
                      }

                    </div>

                    <div className="global-user-info">

                      <div className="name-row">

                        <h4>

                          {
                            post.username
                          }

                        </h4>

                        <span className="role-badge">

                          {
                            getRole(
                              post.role
                            )
                          }

                        </span>

                      </div>

                      <small>

                        {
                          new Date(
                            post.created_at
                          ).toLocaleString()
                        }

                      </small>

                    </div>

                    <div className="type-badge">

                      {
                        getBadge(
                          post.type
                        )
                      }

                    </div>

                  </div>

                  {/* ================= CONTENT ================= */}

                  <p className="global-content">

                    {
                      post.content
                    }

                  </p>

                  {/* ================= CLASS CODE ================= */}

                  {
                    post.class_code && (

                      <div className="shared-class-code">

                        <span>

                          Classroom Code

                        </span>

                        <h3>

                          {
                            post.class_code
                          }

                        </h3>

                      </div>
                    )
                  }

                  {/* ================= ACTIONS ================= */}

                  {
                    user?.id ===
                      post.user_id && (

                      <div className="post-actions">

                        <button

                          className="delete-post-btn"

                          onClick={() =>
                            deletePost(
                              post.id
                            )
                          }
                        >

                          Delete

                        </button>

                      </div>
                    )
                  }

                </div>
              )
            )

          ) : (

            <div className="empty-feed">

              <div className="empty-icon">

                🌍

              </div>

              <h2>

                No Posts Yet

              </h2>

              <p>

                Start discussions with teachers and students.

              </p>

            </div>
          )
        }

      </div>

    </div>
  );
}

