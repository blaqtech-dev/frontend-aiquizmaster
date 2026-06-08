import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useAuth }
from "../../context/authcontext/authcontext";

import { supabase }
from "../../services/supabase/supabase";

import "./profile.css";

import { getUserAnalytics } from "../../services/analyticsservice/analyticsservice.js";

export function ProfilePage() {

  const { user } =
    useAuth();

  // ================= STATES =================

const [attempts, setAttempts] =
  useState([]);
  const [loading, setLoading] =
    useState(true);

  const [avatarFile, setAvatarFile] =
    useState(null);

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [saving, setSaving] =
    useState(false);


 


    const [analytics, setAnalytics] =
  useState({

    totalQuizzes: 0,

    highestScore: 0,

    accuracy: 0,

    totalSubjects: 0,

    pdfCount: 0,
  });



  // ================= LOAD PROFILE =================

  useEffect(() => {

    async function fetchProfile() {

    if (!user) {

  setLoading(false);

  return;
}

const analyticsData =
  await getUserAnalytics(
    user.id
  );

setAnalytics(
  analyticsData
);



  const {
  data: attemptData,
} = await supabase

  .from("quiz_attempts")

  .select("*")

  .eq("user_id", user.id)

  .order(
    "created_at",
    {
      ascending: false,
    }
  );

if (attemptData) {

  setAttempts(
    attemptData
  );
}
      // ================= GET SCORES =================


      // ================= GET PROFILE =================

  const {
  data: profileData,
  error: profileError,
} = await supabase

  .from("profiles")

  .select("*")

  .eq("id", user.id)

  .maybeSingle();

if (profileError) {

  console.log(
    profileError.message
  );
}

if (profileData) {

  setAvatarUrl(
    profileData.avatar_url || ""
  );

  setUsername(
    profileData.username || ""
  );

  setBio(
    profileData.bio || ""
  );
}

      

      setLoading(false);
    }

    fetchProfile();

  }, [user]);







  // ================= UPLOAD AVATAR =================

  async function handleAvatarUpload() {

    if (!avatarFile)
      return;

    setSaving(true);

    const fileName =
      `${Date.now()}-${avatarFile.name}`;

    const { error } =
      await supabase.storage

        .from("avatars")

        .upload(
          fileName,
          avatarFile
        );

    if (error) {

      console.log(
        error.message
      );

      setSaving(false);

      return;
    }

    
    // ================= GET PUBLIC URL =================

    const { data } =
      supabase.storage

        .from("avatars")

        .getPublicUrl(
          fileName
        );

    const imageUrl =
      data.publicUrl;

    setAvatarUrl(
      imageUrl
    );

    // ================= UPDATE PROFILE =================

    await supabase

      .from("profiles")

      .upsert({

        id: user.id,

        username,

        bio,

        avatar_url:
          imageUrl,

        email:
          user.email,
      });

    setSaving(false);

    
   
  }

  // ================= SAVE PROFILE =================

  async function saveProfile() {

    setSaving(true);

    const { error } =
      await supabase

        .from("profiles")

        .upsert({

          id: user.id,

          username,

          bio,

          avatar_url:
            avatarUrl,

          email:
            user.email,
        });

    if (error) {

      console.log(
        error.message
      );
    }

     window.dispatchEvent(
  new Event("profile-updated")
    )

    setSaving(false);
  }

  // ================= TOTAL SCORE =================

 

  // ================= TOTAL QUIZZES =================

 

  // ================= BEST SUBJECT =================

 

  // ================= BEST SCORE =================

const totalScore =
  attempts.reduce(
    (sum, item) =>
      sum + (item.score || 0),
    0
  );

  // ================= PLAYER LEVEL =================

  const level =

    totalScore >= 500
      ? "Master"

      : totalScore >= 250
      ? "Advanced"

      : totalScore >= 100
      ? "Intermediate"

      : "Beginner";

  // ================= ACCURACY =================


  // ================= STREAK =================

  const streak =

analytics.totalQuizzes >= 20
      ? 15

      : analytics.totalQuizzes >= 10
      ? 7

      : analytics.totalQuizzes >= 5
      ? 3

      : 1;

  // ================= JOIN DATE =================

  const joinedDate =

    user?.created_at

      ? new Date(
          user.created_at
        ).toLocaleDateString()

      : "Unknown";

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="profile-loading">

        <h1>
          Loading Profile...
        </h1>

      </div>
    );
  }

  return (

    <div className="profile-page">

      {/* ================= PROFILE TOP ================= */}

      <div className="profile-header">

        <div className="avatar-section">

          {
            avatarUrl ? (

              <img
                src={avatarUrl}
                alt="avatar"
                className="profile-avatar-image"
              />

            ) : (

              <div className="profile-avatar">

                {
                  user?.email
                    ?.charAt(0)
                    .toUpperCase()
                }

              </div>
            )
          }

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>

              setAvatarFile(
                e.target.files[0]
              )
            }
          />

          <button
            className="save-avatar-btn"
            onClick={
              handleAvatarUpload
            }
          >

            Upload Picture

          </button>

        </div>

        <div className="profile-user">

          <div className="profile-top-row">

            <h1>

              {
                username ||
                "Quiz Player"
              }

            </h1>

            <div className="level-badge">

              {level}

            </div>

          </div>

          <p>
            {user?.email}
          </p>

          <span className="joined-date">

            Joined {joinedDate}

          </span>

        </div>

      </div>

      {/* ================= EDIT PROFILE ================= */}

      <div className="edit-profile-card">

        <h2>
          Edit Profile
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="profile-input"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
        />

        <textarea
          placeholder="Write your bio..."
          className="profile-textarea"
          value={bio}
          onChange={(e) =>
            setBio(
              e.target.value
            )
          }
        />

        <button
          className="save-profile-btn"
          onClick={saveProfile}
        >

          {
            saving
              ? "Saving..."
              : "Save Profile"
          }

        </button>

      </div>

      {/* ================= QUICK ACTIONS ================= */}

      <div className="quick-actions">

        <Link to="/subjects">

          <button className="action-btn">

            📚 Start Quiz

          </button>

        </Link>

        <Link to="/upload">

          <button className="action-btn">

            📄 Upload PDF

          </button>

        </Link>

        <Link to="/leaderboard">

          <button className="action-btn">

            🏆 Leaderboard

          </button>

        </Link>

      </div>

      {/* ================= STATS ================= */}

      <div className="profile-stats">

        <div className="stat-card">
<h2>
  {analytics.totalQuizzes}
</h2>

          <p>
            Quizzes Played
          </p>

        </div>

        <div className="stat-card">

          <h2>
            {totalScore}
          </h2>

          <p>
            Total Points
          </p>

        </div>

       <div className="stat-card">

  <h2>
    {analytics.pdfCount}
  </h2>

  <p>
    PDFs Uploaded
  </p>

</div>

        <div className="stat-card">

         <h2>
  {analytics.highestScore}%
</h2>

          <p>
            Highest Score
          </p>

        </div>



        <div className="stat-card">

  <h2>
    {analytics.totalSubjects}
  </h2>

  <p>
    Subjects Studied
  </p>

</div>



        <div className="stat-card">

         <h2>
  {analytics.accuracy}%
</h2>
          <p>
            Accuracy
          </p>

        </div>

        <div className="stat-card">

          <h2>
            {streak}
          </h2>

          <p>
            Day Streak 🔥
          </p>

        </div>

      </div>

      {/* ================= PERFORMANCE ================= */}

      <div className="performance-section">

        <div className="performance-top">

          <h2>
            Learning Progress
          </h2>

          <span>

            {level} Player

          </span>

        </div>

        <div className="progress-wrapper">

          <div
            className="progress-fill"
            style={{
            width:
`${analytics.accuracy}%`,
            }}
          />

        </div>

      </div>

      {/* ================= BIO ================= */}

      <div className="bio-card">

        <h2>
          Bio
        </h2>

        <p>

          {
            bio ||
            "No bio added yet."
          }

        </p>

      </div>

      {/* ================= ACHIEVEMENTS ================= */}

      <div className="achievement-section">

        <h2>
          Achievements
        </h2>

        <div className="achievement-grid">

          <div className="achievement-card">
            🥉 Beginner Learner
          </div>

          <div className="achievement-card">
            🔥 Daily Streak
          </div>

          <div className="achievement-card">
            🧠 Quiz Master
          </div>

          <div className="achievement-card">
            📄 PDF Explorer
          </div>

        </div>

      </div>

      {/* ================= HISTORY ================= */}

      <div className="history-section">

        <div className="history-top">

          <h2>
            Quiz History
          </h2>

          <Link to="/subjects">

            <button className="play-btn">

              Play Quiz

            </button>

          </Link>

        </div>

        {
          attempts.length > 0 ? (

            <div className="history-list">

              {
                attempts.map((item) => (

                  <div
                    key={item.id}
                    className="history-card"
                  >

                    <div>

                      <h3>
                        {item.subject}
                      </h3>

                      <p>


                        Completed Quiz

                      </p>

                      <p>

  {item.multiplayer
    ? "Multiplayer Quiz"
    : "Single Player Quiz"}

</p>

                    </div>

                    <div className="history-right">

                      <div className="history-mode">

                        {
                          item.mode ||
                          "single"
                        }

                      </div>

                    <div className="history-score">

  {item.percentage}%

</div>

                    </div>

                  </div>
                ))
              }

            </div>

          ) : (

            <div className="empty-history">

              <h2>

                No Quiz Played Yet

              </h2>

              <p>

                Start solving quizzes
                and improve your
                learning journey.

              </p>

            </div>
          )
        }

      </div>

    </div>
  );
}