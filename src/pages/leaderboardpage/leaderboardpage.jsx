import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  supabase,
} from "../../services/supabase/supabase";

import "./leaderboard.css";

function Leaderboard() {

  // ================= STATES =================

  const [players, setPlayers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [activeFilter, setActiveFilter] =
    useState("global");

  const [search, setSearch] =
    useState("");

  // ================= FETCH LEADERBOARD =================

 useEffect(() => {

  async function fetchLeaderboard() {

    try {

      setLoading(true);

      // ================= GET ATTEMPTS =================

      const {
        data,
        error,
      } = await supabase

        .from("quiz_attempts")

        .select("*");

      if (error) {

        console.log(error);

        return;
      }

      // ================= GROUP PLAYERS =================

      const groupedPlayers = {};

      (data || []).forEach((attempt) => {

        const username =
          attempt.username ||
          "Anonymous";

        if (!groupedPlayers[username]) {

          groupedPlayers[username] = {

            id: username,

            username,

            total_quizzes: 0,

            total_score: 0,

            average_score: 0,

            highest_score: 0,

            wins: 0,

            current_streak: 0,

            best_streak: 0,

            rank_score: 0,
          };
        }

        const player =
          groupedPlayers[username];

        player.total_quizzes += 1;

        player.total_score +=
          attempt.percentage || 0;

        // ================= HIGHEST =================

        if (
          (attempt.percentage || 0) >
          player.highest_score
        ) {

          player.highest_score =
            attempt.percentage || 0;
        }

        // ================= WINS =================

        if (
          (attempt.percentage || 0) >= 70
        ) {

          player.wins += 1;

          player.current_streak += 1;

          if (
            player.current_streak >
            player.best_streak
          ) {

            player.best_streak =
              player.current_streak;
          }

        } else {

          player.current_streak = 0;
        }
      });

      // ================= FINALIZE =================

      const leaderboard =
        Object.values(groupedPlayers)

          .map((player) => {

            player.average_score =
              Math.round(
                player.total_score /
                player.total_quizzes
              );

            // ================= RANK SCORE =================

            player.rank_score =

              player.average_score * 10 +

              player.wins * 5 +

              player.best_streak * 2;

            return player;
          })

          .sort(
            (a, b) =>
              b.rank_score -
              a.rank_score
          );

      setPlayers(leaderboard);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  }

  fetchLeaderboard();

}, []);

  // ================= FILTERED PLAYERS =================

  const filteredPlayers =
    players.filter((player) =>

      player.username
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ================= TOP PLAYER =================

  const topPlayer =
    filteredPlayers[0];

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="leaderboard-loading">

        <div className="leaderboard-loader"></div>

        <h2>
          Loading Leaderboard...
        </h2>

      </div>
    );
  }

  // ================= EMPTY =================

  if (filteredPlayers.length === 0) {

    return (

      <div className="leaderboard-page">

        <div className="leaderboard-container">

          <div className="leaderboard-header">

            <div className="leaderboard-badge">

              GLOBAL RANKING

            </div>

            <h1>
              Leaderboard
            </h1>

            <p>

              No players have appeared yet.

            </p>

          </div>

          <div className="leaderboard-empty">

            <h2>
              No Leaderboard Data
            </h2>

            <p>

              Complete quizzes to appear on the leaderboard.

            </p>

            <Link to="/subjects">

              <button className="play-btn">

                Start Playing

              </button>

            </Link>

          </div>

        </div>

      </div>
    );
  }

  return (

    <div className="leaderboard-page">

      {/* ================= BACKGROUND ================= */}

      <div className="leaderboard-overlay"></div>

      <div className="leaderboard-container">

        {/* ================= HERO ================= */}

        <div className="leaderboard-header">

          <div className="leaderboard-badge">

            GLOBAL RANKINGS

          </div>

          <h1>

            AI Quiz Leaderboard

          </h1>

          <p>

            Compete with students around the world and climb the rankings.

          </p>

        </div>

        {/* ================= TOP STATS ================= */}

        <div className="leaderboard-stats">

          <div className="leaderboard-stat-card">

            <h2>
              {players.length}
            </h2>

            <p>
              Total Players
            </p>

          </div>

          <div className="leaderboard-stat-card">

            <h2>
              {
                topPlayer?.username.slice(0,10) ||
                "-"
              }
            </h2>

            <p>
              #1 Ranked
            </p>

          </div>

          <div className="leaderboard-stat-card">

            <h2>
              {
                topPlayer?.best_streak ||
                0
              }
            </h2>

            <p>
              Highest Streak
            </p>

          </div>

          <div className="leaderboard-stat-card">

            <h2>
              {
                topPlayer?.rank_score
                  ?.toFixed(0) || 0
              }
            </h2>

            <p>
              Highest Rank Score
            </p>

          </div>

        </div>

        {/* ================= SEARCH ================= */}

        <div className="leaderboard-search">

          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* ================= FILTERS ================= */}

        <div className="leaderboard-filters">

          {[
            "global",
            "weekly",
            "multiplayer",
            "streak",
          ].map((filter) => (

            <button
              key={filter}
              className={
                activeFilter === filter

                  ? "leaderboard-filter active-filter"

                  : "leaderboard-filter"
              }

              onClick={() =>
                setActiveFilter(filter)
              }
            >

              {filter}

            </button>
          ))}

        </div>

        {/* ================= TOP 3 ================= */}

        <div className="top-three-section">

          {filteredPlayers
            .slice(0, 3)
            .map((player, index) => (

              <div
                key={player.id}
                className={`top-three-card top-${index + 1}`}
              >

                <div className="top-rank">

                  #{index + 1}

                </div>

                <div className="top-avatar">

                  {
                    player.username
                      ?.charAt(0)
                      .toUpperCase()
                  }

                </div>

                <h2>

                  {player.username}

                </h2>

                <p>

                  Avg:
                  {" "}
                  {player.average_score}%

                </p>

                <div className="top-score">

                  {
                    player.rank_score
                      ?.toFixed(0)
                  }

                </div>

                <span>

                  {player.total_quizzes}
                  {" "}
                  quizzes played

                </span>

              </div>
            ))}

        </div>

        {/* ================= LEADERBOARD LIST ================= */}

        <div className="leaderboard-list">

          {filteredPlayers.map(
            (player, index) => (

              <div
                key={player.id}
                className="leaderboard-card"
              >

                {/* LEFT */}

                <div className="leaderboard-left">

                  <div className="leaderboard-rank">

                    #{index + 1}

                  </div>

                  <div className="leaderboard-avatar">

                    {
                      player.username
                        ?.charAt(0)
                        .toUpperCase()
                    }

                  </div>

                  <div className="leaderboard-user-info">

                    <h2>

                      {player.username}

                    </h2>

                    <p>

                      {player.total_quizzes}
                      {" "}
                      quizzes played

                    </p>

                  </div>

                </div>

                {/* CENTER */}

                <div className="leaderboard-center">

                  <div className="leaderboard-mini-stat">

                    <span>
                      Average
                    </span>

                    <h3>

                      {
                        player.average_score
                      }%

                    </h3>

                  </div>

                  <div className="leaderboard-mini-stat">

                    <span>
                      Wins
                    </span>

                    <h3>

                      {player.wins}

                    </h3>

                  </div>

                  <div className="leaderboard-mini-stat">

                    <span>
                      Streak
                    </span>

                    <h3>

                      {
                        player.current_streak
                      }

                    </h3>

                  </div>

                </div>

                {/* RIGHT */}

                <div className="leaderboard-right">

                  <div className="rank-score-box">

                    <span>
                      Rank Score
                    </span>

                    <h2>

                      {
                        player.rank_score
                          ?.toFixed(0)
                      }

                    </h2>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}

export default Leaderboard;