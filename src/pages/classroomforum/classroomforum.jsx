import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useParams,
  Link,
} from "react-router-dom";


    import { VoiceChat }
from "../../components/voicechat/voicechat";
import {
  supabase,
} from "../../services/supabase/supabase";

import {
  useAuth,
} from "../../context/authcontext/authcontext";

import {
  ZegoUIKitPrebuilt,
} from "@zegocloud/zego-uikit-prebuilt";

import "./classroomforum.css";

export function ClassroomForumPage() {

  const { id } =
    useParams();

  const { user } =
    useAuth();

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

  const [image,
    setImage] =
    useState(null);

  const [classroom,
    setClassroom] =
    useState(null);

  const [search,
    setSearch] =
    useState("");

  const [onlineUsers,
    setOnlineUsers] =
    useState([]);

  const [typingUsers,
    setTypingUsers] =
    useState([]);

 



  const bottomRef =
    useRef(null);

  // ================= LOAD =================

  useEffect(() => {

    getClassroom();

    getPosts();

    const postChannel =
      subscribePosts();

    const presenceChannel =
      subscribePresence();

    return () => {

      supabase.removeChannel(
        postChannel
      );

      supabase.removeChannel(
        presenceChannel
      );
    };

  }, [id]);

  // ================= AUTO SCROLL =================

  useEffect(() => {

    bottomRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }, [posts]);

  // ================= CLASSROOM =================

  async function getClassroom() {

    const { data, error } =
      await supabase

        .from("classrooms")

        .select("*")

        .eq("id", id)

        .single();

    if (error) {

      console.log(error);

      return;
    }

    setClassroom(data);
  }

  // ================= GET POSTS =================

  async function getPosts() {

    const { data, error } =
      await supabase

        .from(
          "discussion_posts"
        )

        .select("*")

        .eq(
          "classroom_id",
          id
        )

        .order(
          "pinned",
          {
            ascending: false,
          }
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

    setPosts(data || []);
  }

  // ================= REALTIME POSTS =================

function subscribePosts() {

  console.log(
    "Connecting realtime..."
  );

  const channel = supabase

    .channel(
      `discussion-${id}`
    )

    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "discussion_posts",
      },

      payload => {

        console.log(
          "Realtime Event:",
          payload
        );

        getPosts();
      }
    )

    .subscribe(status => {

      console.log(
        "Realtime Status:",
        status
      );
    });

  return channel;
}

  // ================= PRESENCE =================

  function subscribePresence() {

    const channel =

      supabase.channel(
        `presence-${id}`
      );

    channel

      .on(
        "presence",
        {
          event: "sync",
        },

        () => {

          const state =
            channel.presenceState();

          const users =

            Object.values(
              state
            ).flat();

          setOnlineUsers(users);
        }
      )

      .subscribe(async (status) => {

        if (
          status ===
          "SUBSCRIBED"
        ) {

          await channel.track({

            user:
              user?.email,

            username:
              user?.user_metadata
                ?.username ||

              user?.email,
          });
        }
      });

    return channel;
  }

  // ================= TYPING =================

  function handleTyping(value) {

    setMessage(value);

    if (!typingUsers.includes(user.id)) {

      setTypingUsers((prev) => [

        ...prev,

        user.id,
      ]);
    }

    setTimeout(() => {

      setTypingUsers((prev) =>

        prev.filter(
          (id) =>
            id !== user.id
        )
      );

    }, 2000);
  }

  // ================= CREATE POST =================

  async function createPost() {

    if (!message.trim())
      return;

    try {

      setLoading(true);

      let imageUrl = "";

      // ================= IMAGE =================

      if (image) {

        const fileName =

          `${Date.now()}-${image.name}`;

        const {
          error:
            uploadError,
        } =

          await supabase
            .storage

            .from(
              "discussion-images"
            )

            .upload(
              fileName,
              image
            );

        if (uploadError) {

          console.log(
            uploadError
          );

          return;
        }

        const { data } =

          supabase.storage

            .from(
              "discussion-images"
            )

            .getPublicUrl(
              fileName
            );

        imageUrl =
          data.publicUrl;
      }

      // ================= INSERT =================
const {
  data,
  error,
} = await supabase

  .from("discussion_posts")

  .insert([
    {
      classroom_id: id,
      user_id: user.id,

      username:
        user.user_metadata
          ?.username ||

        user.email,

      avatar_url: "",

      content: message,

      image_url: imageUrl,

      pinned: false,
    },
  ])

  .select()

  .single();

  if (!error && data) {

  setPosts(prev => [

    data,

    ...prev,
  ]);
}

      if (error) {

        console.log(error);

        return;
      }

      setMessage("");

      setImage(null);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  }

  // ================= DELETE =================

  async function deletePost(
    postId
  ) {

    try {
const { error } =

  await supabase

    .from("discussion_posts")

    .delete()

    .eq("id", postId);

if (!error) {

  setPosts(prev =>

    prev.filter(

      post =>
        post.id !== postId
    )
  );
}

    } catch (error) {

      console.log(error);
    }
  }

  // ================= VOICE ROOM =================

 

  // ================= FILTER =================

  const filteredPosts =

    posts.filter((post) =>

      post.content
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      post.username
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ================= LOADING =================

  if (!classroom) {

    return (

      <div className="forum-loading">

        <div className="forum-loader"></div>

        <h2>
          Loading Forum...
        </h2>

      </div>
    );
  }

  return (

    <div className="forum-page">

      {/* ================= HERO ================= */}

      <section className="forum-hero">

        <div className="forum-overlay"></div>

        <div className="forum-hero-content">

          <div className="forum-badge">

            🔴 LIVE CLASSROOM DISCUSSION

          </div>

          <h1>

            {classroom.title}
            {" "}
            Forum

          </h1>

          <p>

            Realtime classroom discussions,
            live collaboration,
            voice communication,
            AI learning,
            and community interaction.

          </p>

          <div className="forum-hero-actions">

            <Link
              to={`/classroom/${id}`}
              className="forum-hero-btn"
            >

              Back To Classroom

            </Link>

            <div className="forum-online">

              🟢 {
                onlineUsers.length
              } Online

            </div>

          </div>

        </div>

      </section>

      {/* ================= MAIN ================= */}

      <div className="forum-container">

        {/* ================= LEFT ================= */}

        <div className="forum-left">

          {/* ================= CREATE ================= */}

          <div className="forum-create">

            <div className="forum-current-user">

              <div className="forum-avatar large-avatar">

                {
                  user?.email
                    ?.charAt(0)
                    .toUpperCase()
                }

              </div>

              <div>

                <h3>

                  {
                    user?.user_metadata
                      ?.username ||

                    user?.email
                  }

                </h3>

                <span>

                  Start Discussion

                </span>

              </div>

            </div>

            <textarea

              placeholder="Ask questions, share ideas, post screenshots, explain concepts..."

              value={message}

              onChange={(e) =>

                handleTyping(
                  e.target.value
                )
              }
            />

            {
              typingUsers.length >
                0 && (

                <div className="typing-indicator">

                  ✍️ Someone is typing...

                </div>
              )
            }

            {
              image && (

                <div className="selected-image-box">

                  <span>

                    📷 {image.name}

                  </span>

                  <button
                    onClick={() =>
                      setImage(null)
                    }
                  >

                    Remove

                  </button>

                </div>
              )
            }

            <div className="forum-create-bottom">

              <label className="upload-image-btn">

                📸 Upload Image

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>

                    setImage(
                      e.target.files[0]
                    )
                  }
                />

              </label>

              <button

                className="post-discussion-btn"

                onClick={
                  createPost
                }

                disabled={loading}
              >

                {
                  loading
                    ? "Posting..."
                    : "Post Discussion"
                }

              </button>

            </div>

          </div>

          {/* ================= POSTS ================= */}

          <div className="forum-posts">

            <div className="forum-post-top">

              <h2>
                Recent Discussions
              </h2>

              <input

                type="text"

                placeholder="Search discussion..."

                value={search}

                onChange={(e) =>

                  setSearch(
                    e.target.value
                  )
                }

                className="forum-search"
              />

            </div>

            {
              filteredPosts.length ===
              0 ? (

                <div className="empty-forum">

                  <div className="empty-icon">

                    💬

                  </div>

                  <h3>

                    No Discussions Yet

                  </h3>

                </div>

              ) : (

                filteredPosts.map((post) => (

                  <div

                    key={post.id}

                    className="forum-post-card"
                  >

                    <div className="forum-user">

                      <div className="forum-avatar">

                        {
                          post.username
                            ?.charAt(0)
                            .toUpperCase()
                        }

                      </div>

                      <div className="forum-user-details">

                        <h3>

                          {
                            post.username
                          }

                        </h3>

                        <span>

                          {
                            new Date(
                              post.created_at
                            ).toLocaleString()
                          }

                        </span>

                      </div>

                    </div>

                    <p className="forum-content">

                      {
                        post.content
                      }

                    </p>

                    {
                      post.image_url && (

                        <img

                          src={
                            post.image_url
                          }

                          alt=""

                          className="forum-image"
                        />
                      )
                    }

                    {/* ================= REACTIONS ================= */}

                    <div className="reaction-bar">

                      <button>
                        👍
                      </button>

                      <button>
                        ❤️
                      </button>

                      <button>
                        🔥
                      </button>

                      <button>
                        😂
                      </button>

                    </div>

                    {/* ================= ACTIONS ================= */}

                    <div className="forum-post-actions">

                      <button>

                        💬 Reply

                      </button>

                      <button>

                        📤 Share

                      </button>

                      {
                        post.user_id ===
                        user?.id && (

                          <button

                            className="delete-post-btn"

                            onClick={() =>

                              deletePost(
                                post.id
                              )
                            }
                          >

                            🗑 Delete

                          </button>
                        )
                      }

                    </div>

                  </div>
                ))
              )
            }

            <div ref={bottomRef}></div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}

        <div className="forum-right">

          {/* ================= VOICE ROOM ================= */}

          <div className="forum-side-card">

            <h2>
              🎤 Voice Classroom
            </h2>

            <p>

              Join realtime voice discussion
              with students and teachers.

            </p>

          <div className="voice-chat-wrapper">

  <VoiceChat
    roomCode={`classroom-${id}`}
    user={user}
  />

</div>

            <div
              id="voice-room-container"
              className="voice-room-container"
            ></div>

          </div>

          {/* ================= ONLINE USERS ================= */}

          <div className="forum-side-card">

            <h2>

              🟢 Online Members

            </h2>

            <div className="online-users">

              {
                onlineUsers.map(
                  (member, index) => (

                    <div

                      key={index}

                      className="online-user"
                    >

                      <span className="online-dot"></span>

                      {
                        member.username
                      }

                    </div>
                  )
                )
              }

            </div>

          </div>

          {/* ================= STATS ================= */}

          <div className="forum-side-card">

            <h2>

              Forum Statistics

            </h2>

            <div className="forum-side-stats">

              <div className="forum-stat-box">

                <h3>

                  {posts.length}

                </h3>

                <span>

                  Discussions

                </span>

              </div>

              <div className="forum-stat-box">

                <h3>

                  {
                    onlineUsers.length
                  }

                </h3>

                <span>

                  Online

                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}