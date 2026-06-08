import { useState, useEffect } from "react";

import { supabase } from "../../services/supabase/supabase";

import { v4 as uuidv4 } from "uuid";

import { useAuth } from "../../context/authcontext/authcontext";
import { requirePro } from "../../services/checkproaccess/checkproaccess.jsx";
import {
  createRoom,
  joinRoom,
  getRoomPlayers,
  updatePlayerScore,
} from "../../services/multiplayerservice/multiplayerservice";
import { useNavigate } from "react-router-dom";

import { VoiceChat } from "../../components/voicechat/voicechat.jsx";
import {
  createGame,
  startGame,
  nextQuestion,
  getGame,
} from "../../services/gameservice/gameservice";

import { saveQuizAttempt } from "../../services/historyservice/historyservice.js";

import {
  sendMessage,
  getMessages,
} from "../../services/chatservice/chatservice.js";

import "./multiplayer.css";

export function MultiplayerPage() {

 const { user, profile } = useAuth();

const navigate = useNavigate();

const isPro =
  profile?.plan === "pro";

  // ================= STATES =================

  const [roomCode, setRoomCode] =
    useState("");

  const [players, setPlayers] =
    useState([]);

  const [joinedRoom, setJoinedRoom] =
    useState("");

  const [gameStarted, setGameStarted] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answered, setAnswered] =
    useState(false);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

    const [answeredPlayers, setAnsweredPlayers] =
  useState([]);

const [questionLocked, setQuestionLocked] =
  useState(false);

  const [timer, setTimer] =
    useState(15);

  const [isHost, setIsHost] =
    useState(false);

  const [gameEnded, setGameEnded] =
    useState(false);

  const [winner, setWinner] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [questions, setQuestions] =
    useState([]);

  const [allQuizzes, setAllQuizzes] =
    useState([]);

  const [selectedQuiz, setSelectedQuiz] =
    useState(null);

  const [selectedQuizTitle, setSelectedQuizTitle] =
    useState("");

  // ================= CHAT =================

  const [messages, setMessages] =
    useState([]);

  const [chatInput, setChatInput] =
    useState("");

  // ================= LOAD QUIZZES =================

  async function loadAllQuizzes() {

    try {

     const { data, error } =
  await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", user.id)
    .not("questions", "is", null);

      if (error) {

        console.log(error);

        return;
      }

      const uniqueQuizzes = [];

      const seenTitles = new Set();

      (data || []).forEach((quiz) => {

        const fixedTitle =
          quiz.title?.trim() ||
          quiz.pdf_name?.trim() ||
          quiz.file_name?.trim() ||
          `Quiz ${quiz.id}`;

        if (
          !seenTitles.has(
            fixedTitle.toLowerCase()
          )
        ) {

          seenTitles.add(
            fixedTitle.toLowerCase()
          );

          uniqueQuizzes.push({
            ...quiz,
            title: fixedTitle,
          });
        }
      });

      setAllQuizzes(uniqueQuizzes);

    } catch (err) {

      console.log(err);
    }
  }




  async function getCurrentProfile() {

  const { data } =
    await supabase
      .from("profiles")
      .select(`
        username,
        avatar_url
      `)
      .eq("id", user.id)
      .single();

  return data;
}

  // ================= LOAD QUESTIONS =================

  async function loadQuizQuestions(
    quizId
  ) {

    try {

      const { data, error } =
        await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .single();

      if (error) {

        console.log(error);

        return;
      }

      setQuestions(
        data.questions || []
      );

      setSelectedQuizTitle(
        data.title || "Quiz"
      );

    } catch (err) {

      console.log(err);
    }
  }

  // ================= PAGE LOAD =================

useEffect(() => {

  if (user?.id) {

    loadAllQuizzes();
  }

}, [user]);

  // ================= CREATE ROOM =================

  async function handleCreateRoom() {


      if (
  !requirePro(
    isPro,
    navigate,
    "Multiplayer quizzes are Pro only."
  )
) {
  return;
}

    try {

      setLoading(true);

      setError("");

      if (!selectedQuiz) {

        setError(
          "Select a quiz first"
        );

        return;
      }

      const code =
        uuidv4()
          .slice(0, 6)
          .toUpperCase();

      await createRoom(
        code,
        user.id
      );

      await createGame(
        code,
        selectedQuiz.id,
        selectedQuiz.title
      );

     const profile =
  await getCurrentProfile();

await joinRoom(
  code,
  user.id,
  profile?.username ||
  user.email ||
  "Host",
  profile?.avatar_url || null
);

      await loadQuizQuestions(
        selectedQuiz.id
      );

      setJoinedRoom(code);

      setIsHost(true);

    } catch (err) {

      console.log(err);

      setError(
        "Unable to create room"
      );

    } finally {

      setLoading(false);
    }
  }

  // ================= JOIN ROOM =================

  async function handleJoinRoom() {


  

    try {

      setLoading(true);

      setError("");

    const profile =
  await getCurrentProfile();

await joinRoom(
  roomCode.toUpperCase(),
  user.id,
  profile?.username ||
  user.email ||
  "Player",
  profile?.avatar_url || null
);

      setJoinedRoom(
        roomCode.toUpperCase()
      );

      setIsHost(false);

    } catch (err) {

      console.log(err);

      setError(
        "Unable to join room"
      );

    } finally {

      setLoading(false);
    }
  }

  // ================= START GAME =================

 async function handleStartGame() {

  if (questions.length === 0) {

    setError(
      "No quiz questions found"
    );

    return;
  }

  await startGame(joinedRoom);

  await supabase
    .from("game_state")
    .update({

      game_started: true,

      current_question: 0,

      game_ended: false,

    })
    .eq(
      "room_code",
      joinedRoom
    );
}

  // ================= ANSWER =================

async function handleAnswer(option) {

  // prevent spam click
  if (
    answered ||
    gameEnded ||
    questionLocked
  ) return;

  setQuestionLocked(true);

  setAnswered(true);

  setSelectedAnswer(option);

  const correct =
    questions[currentQuestion]?.answer;

  // add current user locally
  setAnsweredPlayers((prev) => [
    ...prev,
    user.id,
  ]);

  // save answer in database
  await supabase
    .from("room_players")
    .update({
      selected_answer: option,
    })
    .eq("room_code", joinedRoom)
    .eq("user_id", user.id);

  // correct answer
  if (option === correct) {

    const me =
      players.find(
        (p) =>
          p.user_id === user.id
      );

    const newScore =
      (me?.score || 0) + 1;

    await updatePlayerScore(
      joinedRoom,
      user.id,
      newScore
    );
  }

  // unlock after short delay
  setTimeout(() => {

    setQuestionLocked(false);

  }, 800);
}

  // ================= NEXT QUESTION =================

 async function moveNextQuestion() {

  const next =
    currentQuestion + 1;

  if (
    next >= questions.length
  ) {

    await finishGame();

    return;
  }

  // clear player selected answers
  await supabase
    .from("room_players")
    .update({
      selected_answer: null,
    })
    .eq(
      "room_code",
      joinedRoom
    );

  await supabase
    .from("game_state")
    .update({

      current_question: next,

    })
    .eq(
      "room_code",
      joinedRoom
    );

  setAnswered(false);

  setSelectedAnswer("");

  setAnsweredPlayers([]);

  setTimer(15);
}
  // ================= FINISH =================

 async function finishGame() {

  const sorted =
    [...players].sort(
      (a, b) =>
        b.score - a.score
    );

  const highestScore =
    sorted[0]?.score || 0;

  const winners =
    sorted.filter(
      (player) =>
        player.score === highestScore
    );

  // ================= DRAW =================

  if (winners.length > 1) {

    setWinner({
      username: "Draw Match",
    });

  } else {

    setWinner(winners[0]);
  }

  setGameEnded(true);

  // ================= SAVE SCORES =================

  for (const player of players) {

    await saveQuizAttempt({

      user_id: player.user_id,

      username:
        player.username,

      subject:
        selectedQuizTitle,

      score:
        player.score || 0,

      multiplayer: true,
    });
  }

  // ================= UPDATE GAME STATE =================

  await supabase
    .from("game_state")
    .update({

      game_ended: true,

      winner_name:
        winners.length > 1
          ? "Draw Match"
          : winners[0]?.username,
    })
    .eq(
      "room_code",
      joinedRoom
    );
}




useEffect(() => {

  setAnswered(false);

  setSelectedAnswer("");

  setAnsweredPlayers([]);

  setQuestionLocked(false);

}, [currentQuestion]);
  // ================= TIMER =================

  useEffect(() => {

    if (
      !gameStarted ||
      gameEnded
    )
      return;

    const interval =
      setInterval(() => {

        setTimer((prev) => {

          if (prev <= 1) {

            if (isHost) {

              moveNextQuestion();
            }

            return 15;
          }

          return prev - 1;
        });

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [
    gameStarted,
    currentQuestion,
    gameEnded,
    isHost,
  ]);

  // ================= PLAYERS =================

  useEffect(() => {

    if (!joinedRoom)
      return;

    async function loadPlayers() {

      const { data } =
        await getRoomPlayers(
          joinedRoom
        );

      if (data) {

      setPlayers(data || []);

const answeredIds =
  (data || [])
    .filter(
      (p) =>
        p.selected_answer
    )
    .map(
      (p) => p.user_id
    );

setAnsweredPlayers(answeredIds);
      }
    }

    loadPlayers();

    const channel =
      supabase
        .channel(
          `players-${joinedRoom}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "room_players",
            filter:
              `room_code=eq.${joinedRoom}`,
          },
          () => {

            loadPlayers();
          }
        )
        .subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );
    };

  }, [joinedRoom]);


  // ================= GAME REALTIME =================

useEffect(() => {

  if (!joinedRoom) return;

  async function loadGameState() {

    try {

      const { data, error } =
        await getGame(joinedRoom);

      if (error || !data) {

        console.log(error);

        return;
      }

      // ================= GAME STARTED =================

      setGameStarted(
        data.game_started || false
      );

      setCurrentQuestion(
        data.current_question || 0
      );

      setGameEnded(
        data.game_ended || false
      );

      // ================= LOAD QUIZ =================

      if (data.quiz_id) {

        const {
          data: quizData,
          error: quizError,
        } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", data.quiz_id)
          .single();

        if (!quizError && quizData) {

          setQuestions(
            quizData.questions || []
          );

          setSelectedQuizTitle(
            quizData.title || "Quiz"
          );

          setSelectedQuiz(quizData);
        }
      }

      // ================= WINNER =================

      if (data.game_ended) {

        const topPlayer =
          players.find(
            (p) =>
              p.username ===
              data.winner_name
          );

        setWinner(topPlayer);
      }

    } catch (err) {

      console.log(err);
    }
  }

  loadGameState();

  const channel =
    supabase
      .channel(
        `game-state-${joinedRoom}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_state",
          filter:
            `room_code=eq.${joinedRoom}`,
        },
        () => {

          loadGameState();
        }
      )
      .subscribe();

  return () => {

    supabase.removeChannel(channel);
  };

}, [joinedRoom, players]);

  // ================= CHAT =================

  useEffect(() => {

    if (!joinedRoom)
      return;

    async function loadMessages() {

      const { data } =
        await getMessages(
          joinedRoom
        );

      if (data) {

        setMessages(data);
      }
    }

    loadMessages();

    const channel =
      supabase
        .channel(
          `chat-${joinedRoom}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "room_messages",
            filter:
              `room_code=eq.${joinedRoom}`,
          },
          () => {

            loadMessages();
          }
        )
        .subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );
    };

  }, [joinedRoom]);

  async function handleSendMessage() {

    if (!chatInput.trim())
      return;

    await sendMessage(

      joinedRoom,

      user.id,

      user.user_metadata
        ?.username ||

        user.email ||

        "Player",

      chatInput
    );

    setChatInput("");
  }



  const [showResults, setShowResults] =
  useState(false);

  const currentQuiz =
    questions?.[
      currentQuestion
    ];

  return (

    <div className="mp-wrapper">

      <div className="multiplayer-layout">

        {/* ================= MAIN ================= */}

        <div className="mp-container">

          {/* HEADER */}

          <header className="mp-header">

            <div className="mp-badge">

              LIVE MULTIPLAYER

            </div>

            <h1>

              Multiplayer Quiz Battle

            </h1>

            <p>

              Battle friends live with AI generated quizzes

            </p>

          </header>

          {error && (

            <div className="mp-error">

              {error}

            </div>
          )}

          {/* LOBBY */}

          {!joinedRoom && (

            <div className="mp-card">

              <div className="mp-card-top">

                <h2>

                  Create Or Join Room

                </h2>

              </div>

              <div className="pdf-grid">

                {allQuizzes.map((quiz) => (

                  <div
                    key={quiz.id}
                    className={`pdf-card ${
                      selectedQuiz?.id === quiz.id
                        ? "active"
                        : ""
                    }`}
                    onClick={async () => {

                      setSelectedQuiz(quiz);

                      await loadQuizQuestions(
                        quiz.id
                      );
                    }}
                  >

                    <div className="pdf-icon">

                      📘

                    </div>

                    <h4>

                      {quiz.title}

                    </h4>

                  </div>
                ))}
              </div>

              <button
                className="btn primary"
                onClick={
                  handleCreateRoom
                }
              >

                Create Room

              </button>

              <div className="divider">

                OR

              </div>

              <div className="join-box">

                <input
                  type="text"
                  placeholder="Enter Room Code"
                  value={roomCode}
                  onChange={(e) =>
                    setRoomCode(
                      e.target.value
                    )
                  }
                />

                <button
                  className="btn secondary"
                  onClick={
                    handleJoinRoom
                  }
                >

                  Join

                </button>

              </div>

            </div>
          )}

          {/* ROOM */}

          {joinedRoom &&
            !gameStarted && (

            <div className="mp-room">

              <div className="room-top">

                <h2>

                  Room:
                  {" "}
                  {joinedRoom}

                </h2>

                <div className="player-count">

                  {players.length}
                  {" "}
                  Players

                </div>

              </div>

              {isHost && (

                <button
                  className="btn primary full"
                  onClick={
                    handleStartGame
                  }
                >

                  Start Match

                </button>
              )}

              <div className="players">

                {players.map((p) => (

                  <div
                    key={p.id}
                    className="player"
                  >

                    <div className="player-left">

                     <div className="player-rank">

  {p.avatar_url ? (

    <img
      src={p.avatar_url}
      alt={p.username}
      className="player-avatar"
    />

  ) : (

    "👤"

  )}

</div>

                      <div>

                        <h4>

                          {p.username}

                        </h4>

                      </div>

                    </div>

                    <div className="player-score">

                      {p.score || 0}

                    </div>

                  </div>
                ))}

              </div>

            </div>
          )}








          {/* GAME */}

          {gameStarted &&
            !gameEnded &&
            currentQuiz && (

            <div className="mp-game">

              <div className="game-top">

                <div className="question-count">

                  Question
                  {" "}
                  {currentQuestion + 1}
                  {" "}
                  /
                  {" "}
                  {questions.length}

                </div>

                <div className="timer">

                  ⏱ {timer}s

                </div>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      ((currentQuestion + 1) /
                        questions.length) *
                      100
                    }%`,
                  }}
                />

              </div>

              <h2 className="question">

                {currentQuiz.question}

              </h2>

              <div className="options">

                {currentQuiz.options?.map(
                  (opt, index) => (

                 <button
  key={index}
  type="button"
  className={`option-btn
  ${
    answered
      ? opt === currentQuiz.answer
        ? "correct"
        : opt === selectedAnswer
        ? "wrong"
        : ""
      : ""
  }`}
  disabled={answered}
  onClick={(e) => {

    e.preventDefault();

    e.stopPropagation();

    handleAnswer(opt);
  }}
>
  {opt}
</button>
                ))}

              </div>

            </div>
          )}




<div className="answered-count">

  {answeredPlayers.length}
  {" "}
  /
  {" "}
  {players.length}
  {" "}
  answered

</div>



          {/* END */}

         {gameEnded && (

  <div className="mp-card end-card">

    <div className="winner-box">

      <div className="winner-icon">

        🏆

      </div>

      <h2>

        Winner:
        {" "}
        {winner?.username}

      </h2>

    </div>

    <div className="final-board">

      {[...players]
        .sort(
          (a, b) =>
            b.score - a.score
        )
        .map((player, index) => (

        <div
          key={player.id}
          className="final-player"
        >

          <div className="final-rank">

            #{index + 1}

          </div>

          <div className="final-name">

            {player.username}

          </div>

          <div className="final-score">

            {player.score || 0}

          </div>

        </div>
      ))}

    </div>

  </div>
)}

        </div>

        {/* ================= CHAT ================= */}

        {joinedRoom && (
          <>
<div className='right-sidebar'>


           <VoiceChat
      roomCode={joinedRoom}
      user={user}
    />

          <div className="chat-sidebar">

            <div className="chat-header">

              <div className="chat-header-left">

                <div className="chat-live-dot"></div>

                <span>

                  Room Chat

                </span>

              </div>

              <span className="chat-room-code">

                {joinedRoom}

              </span>

            </div>

            <div className="chat-messages">

              {messages.length === 0 ? (

                <div className="empty-chat">

                  <h3>

                    No Messages Yet

                  </h3>

                </div>

              ) : (

                messages.map((msg) => (

                  <div
                    key={msg.id}
                    className={`chat-message ${
                      msg.user_id === user?.id
                        ? "my-message"
                        : ""
                    }`}
                  >

                    <span className="chat-user">

                      {msg.username}

                    </span>

                    <p>

                      {msg.message}

                    </p>

                  </div>
                ))
              )}

            </div>

            <div className="chat-input-box">

              <input
  type="text"
  placeholder="Type message..."
  value={chatInput}
  onChange={(e) =>
    setChatInput(e.target.value)
  }
  onKeyDown={(e) => {

    if (e.key === "Enter") {

      handleSendMessage();
    }
  }}
/>

              <button
                onClick={
                  handleSendMessage
                }
              >

                Send

              </button>

            </div>
</div>
          </div>
          </>
        )}

      </div>

    </div>
  );
}