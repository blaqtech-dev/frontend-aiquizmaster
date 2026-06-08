
import {
  useParams,
  Link,
  useLocation,
} from "react-router-dom";

import {
  useState,
  useEffect,
  useMemo,
} from "react";

import {
  useAuth,
} from "../../context/authcontext/authcontext";

import {
  supabase,
} from "../../services/supabase/supabase";

import "./quiz.css";

export function QuizPage() {

  const { subject } =
    useParams();

  const decodedSubject =
    decodeURIComponent(subject);

  const location =
    useLocation();

  const { user } =
    useAuth();

  // ================= PASSED DATA =================

  const passedQuestions =
    location.state?.questions || [];

  const quizSettings =
    location.state?.settings || {};

  // ================= STATES =================

  const [quizQuestions, setQuizQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const [selectedOption, setSelectedOption] =
    useState(null);

  const [showAnswer, setShowAnswer] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(20);

  // ================= LOAD QUESTIONS =================

  useEffect(() => {

    async function loadQuiz() {

      try {

        setLoading(true);

        // ================= USE PASSED QUESTIONS =================

        if (
          passedQuestions.length > 0
        ) {

          const shuffled =
            [...passedQuestions].sort(
              () => Math.random() - 0.5
            );

          setQuizQuestions(shuffled);

          return;
        }

        // ================= FALLBACK =================

        const {
          data,
          error,
        } = await supabase

          .from("questions")

          .select("*")

          .eq(
            "subject",
            decodedSubject
          );

        if (error) {

          console.log(error);

          return;
        }

        const cleaned =
          (data || []).map((q) => ({

            ...q,

            difficulty:
              (
                q?.difficulty ||
                "easy"
              )
                .toString()
                .trim()
                .toLowerCase(),

            options:
              Array.isArray(q?.options)
                ? q.options
                : [],
          }));

        setQuizQuestions(cleaned);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    }

    loadQuiz();

  }, [
    passedQuestions,
    decodedSubject,
  ]);

  // ================= CURRENT QUESTION =================

  const currentQuiz =
    quizQuestions[currentQuestion];

  // ================= PROGRESS =================

  const progress =
    ((currentQuestion + 1)

    / quizQuestions.length) * 100;

  // ================= TIMER =================

  useEffect(() => {

    if (
      finished ||
      loading ||
      quizQuestions.length === 0
    ) return;

    if (showAnswer) return;

    if (timeLeft <= 0) {

      nextQuestion();

      return;
    }

    const timer =
      setInterval(() => {

        setTimeLeft(
          (prev) => prev - 1
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, [
    timeLeft,
    finished,
    loading,
    showAnswer,
    quizQuestions.length,
  ]);

  // ================= NEXT QUESTION =================

  function nextQuestion() {

    const next =
      currentQuestion + 1;

    if (
      next >= quizQuestions.length
    ) {

      setFinished(true);

      return;
    }

    setCurrentQuestion(next);

    setSelectedOption(null);

    setShowAnswer(false);

    setTimeLeft(20);
  }

  // ================= HANDLE ANSWER =================

  function handleAnswer(option) {

    if (showAnswer) return;

    setSelectedOption(option);

    setShowAnswer(true);

    if (
      option === currentQuiz.answer
    ) {

      setScore(
        (prev) => prev + 1
      );
    }

    setTimeout(() => {

      nextQuestion();

    }, 1200);
  }

  // ================= SAVE ATTEMPT =================

  useEffect(() => {

    async function saveAttempt() {

      if (
        !finished ||
        !user ||
        quizQuestions.length === 0
      ) return;

      const percentage =
        Math.round(

          (score /
            quizQuestions.length) * 100
        );

      const { error } =
        await supabase

          .from("quiz_attempts")

          .insert([
            {

              user_id:
                user.id,

              username:
                user.email,

              subject:
                decodedSubject,

              score,

              total_questions:
                quizQuestions.length,

              percentage,

              multiplayer: false,
            },
          ]);

      if (error) {

        console.log(error);
      }
    }

    saveAttempt();

  }, [
    finished,
    user,
    score,
    quizQuestions,
    decodedSubject,
  ]);

  // ================= RESTART =================

  function restartQuiz() {

    setCurrentQuestion(0);

    setScore(0);

    setFinished(false);

    setSelectedOption(null);

    setShowAnswer(false);

    setTimeLeft(20);

    const reshuffled =
      [...quizQuestions].sort(
        () => Math.random() - 0.5
      );

    setQuizQuestions(reshuffled);
  }

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="quiz-loading">

        <div className="quiz-loader"></div>

        <h1>
          Loading Quiz...
        </h1>

      </div>
    );
  }

  // ================= EMPTY =================

  if (quizQuestions.length === 0) {

    return (

      <div className="quiz-error">

        <div className="quiz-error-card">

          <h1>
            No Questions Found
          </h1>

          <p>
            Try another quiz setup.
          </p>

          <Link
            to={`/subject/${subject}/setup`}
          >

            <button className="back-btn">

              Back To Setup

            </button>

          </Link>

        </div>

      </div>
    );
  }

  // ================= FINISHED =================

  if (finished) {

    const percentage =
      Math.round(

        (score /
          quizQuestions.length) * 100
      );

    return (

      <div className="quiz-finished">

        <div className="finished-card">

          <h1>
            Quiz Completed 🎉
          </h1>

          <h2>
            {decodedSubject}
          </h2>

          <div className="final-score">

            <span>
              {score}
            </span>

            <p>
              out of {quizQuestions.length}
            </p>

          </div>

          <div className="percentage">

            {percentage}%

          </div>

          <div className="result-message">

            {
              percentage >= 80

                ? "Excellent Performance 🚀"

                : percentage >= 50

                ? "Good Job 👏"

                : "Keep Practicing 💪"
            }

          </div>

          <div className="finished-buttons">

            <button
              className="retry-btn"
              onClick={restartQuiz}
            >

              Restart Quiz

            </button>

            <Link
              to={`/subject/${subject}`}
            >

              <button className="back-btn">

                Subject Page

              </button>

            </Link>

            <Link
              to={`/subject/${subject}/analytics`}
            >

              <button className="analytics-btn">

                Analytics

              </button>

            </Link>

          </div>

        </div>

      </div>
    );
  }

  // ================= PAGE =================

  return (

    <div className="quiz-page">

      <div className="quiz-card">

        {/* ================= TOP ================= */}

        <div className="quiz-top">

          <div>

            <h1>
              {decodedSubject}
            </h1>

            <p>
              AI Smart Quiz
            </p>

          </div>

          <span>

            Question {currentQuestion + 1}

            /

            {quizQuestions.length}

          </span>

        </div>

        {/* ================= PROGRESS ================= */}

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        {/* ================= INFO ================= */}

        <div className="quiz-info-row">

          <div className="timer-box">

            ⏳ {timeLeft}s

          </div>

          <div className="score-box">

            Score: {score}

          </div>

        </div>

        {/* ================= QUESTION ================= */}

        <h2 className="quiz-question">

          {currentQuiz.question}

        </h2>

        {/* ================= OPTIONS ================= */}

        <div className="quiz-options">

          {currentQuiz.options.map((option) => (

            <button
              key={option}
              className={`quiz-option-btn

              ${
                showAnswer &&
                option === currentQuiz.answer

                  ? "correct-answer"

                  : ""
              }

              ${
                showAnswer &&
                option === selectedOption &&
                option !== currentQuiz.answer

                  ? "wrong-answer"

                  : ""
              }
              `}
              onClick={() =>
                handleAnswer(option)
              }
            >

              {option}

            </button>
          ))}

        </div>

        {/* ================= EXPLANATION ================= */}

        {
          showAnswer && (

            <div className="answer-explanation">

              <h3>
                Explanation
              </h3>

              <p>

                {
                  currentQuiz.explanation ||

                  "No explanation available."
                }

              </p>

            </div>
          )
        }

      </div>

    </div>
  );
}

