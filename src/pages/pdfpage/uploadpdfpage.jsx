import { useState,useEffect } from "react";
import { supabase } from "../../services/supabase/supabase";

import { useAuth } from "../../context/authcontext/authcontext";
import "./upload.css";

import { useNavigate } from "react-router-dom";


export function PdfUploadPage() {

  const API = import.meta.env.VITE_API_URL;

 const {
  user,
  profile,
} = useAuth();


const isPro =
  profile?.plan === "pro";
 
const navigate = useNavigate();

  // ================= STATES =================

  const [pdfFile, setPdfFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [generating, setGenerating] =
    useState(false);

  const [pdfUrl, setPdfUrl] =
    useState("");

  const [questions, setQuestions] =
    useState([]);

  const [summary, setSummary] =
    useState("");

  const [flashcards, setFlashcards] =
    useState([]);

  const [quizStarted, setQuizStarted] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState("");

  const [quizFinished, setQuizFinished] =
    useState(false);

  const [quizId, setQuizId] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");



    const PDF_LIMIT = 15;

const [pdfCount, setPdfCount] =
  useState(0);

useEffect(() => {

  if (!user?.id) return;

  const savedCount =
    Number(
      localStorage.getItem(
        `pdfCount-${user.id}`
      )
    ) || 0;

  setPdfCount(savedCount);

}, [user]);

  // ================= UPLOAD PDF =================

  async function handleUpload() {


// ================= PRO CHECK =================


if (
  !isPro &&
  pdfCount >= PDF_LIMIT
) {

  setErrorMessage(
    "You have used all free PDF uploads. Upgrade to Pro."
  );

  setTimeout(() => {

    navigate("/upgrade");

  }, 1500);

  return;
}




    

    if (!pdfFile) {

      setErrorMessage(
        "Please select a PDF file first."
      );

      return;
    }


    const MAX_FILE_SIZE =
  50 * 1024 * 1024; // 50MB

if (
  pdfFile.size >
  MAX_FILE_SIZE
) {

  setErrorMessage(
    "PDF must be less than 50MB."
  );

  return;
}

   

    setUploading(true);

    setGenerating(false);

    setErrorMessage("");

    try {

      // ================= FILE NAME =================

      const fileName =
        `${Date.now()}-${pdfFile.name}`;

      // ================= UPLOAD PDF =================

      const { error } =
        await supabase.storage
          .from("pdfs")
          .upload(fileName, pdfFile);

      if (error) {

        console.log(error.message);

        setErrorMessage(
          "Failed to upload PDF."
        );

        return;
      }

      // ================= PUBLIC URL =================

      const { data } =
  supabase.storage
    .from("pdfs")
    .getPublicUrl(fileName);

setPdfUrl(data.publicUrl);

console.log(
  "PDF PUBLIC URL:",
  data.publicUrl
);

      // ================= EXTRACT PDF TEXT =================

     // ================= GENERATE AI =================

setGenerating(true);

const response =
await fetch(
`${API}/api/generate-quiz`,
{
method: "POST",

  headers: {
    "Content-Type":
      "application/json",
  },

  body: JSON.stringify({

    pdfUrl:
      data.publicUrl,

  }),
}

);
      const result =
        await response.json();

      console.log(result);

      // ================= HANDLE AI FAILURE =================

      if (!result.success) {

        setErrorMessage(
          "AI failed to generate content."
        );

        return;
      }

      // ================= SAFE DATA =================

      const safeQuestions =
        result.questions || [];

      const safeSummary =
        result.summary || "";

      const safeFlashcards =
        result.flashcards || [];

      // ================= SET STATES =================

      setQuestions(safeQuestions);

      setSummary(safeSummary);

      setFlashcards(safeFlashcards);

      // ================= EMPTY QUESTIONS =================

      if (safeQuestions.length === 0) {

        setErrorMessage(
          "No quiz questions generated. Try another PDF."
        );

        return;
      }

      // ================= SAVE QUIZ =================

      const {
        data: quizData,
        error: quizError,
      } = await supabase
        .from("quizzes")
       .insert({

  user_id: user.id,

  subject_name:
  pdfFile.name.replace(".pdf", ""),

  category:
    "AI Generated",

  pdf_name:
    pdfFile.name,

  pdf_url:
    data.publicUrl,

  questions:
    safeQuestions,

  summary:
    safeSummary,

  flashcards:
    safeFlashcards,

  total_questions:
    safeQuestions.length,

  score: 0,

})
        .select()

        .single();

      if (quizError) {

        console.log(
          "Supabase Error:",
          quizError.message
        );

        setErrorMessage(
          quizError.message
        );

      } else {

  setQuizId(
    quizData?.id
  );

  if (!isPro) {

    setPdfCount(prev => {

      const newCount =
        prev + 1;

      localStorage.setItem(
        `pdfCount-${user.id}`,
        newCount
      );

      return newCount;

    });

  }

}

    } catch (error) {

      console.log(error);

      setErrorMessage(
        "Something went wrong while generating AI content."
      );

    } finally {

      setUploading(false);

      setGenerating(false);
    }
  }

  // ================= HANDLE ANSWER =================

  function handleAnswer(option) {

    if (selectedAnswer)
      return;

    setSelectedAnswer(option);

    const correctAnswer =
      questions[currentQuestion]
        ?.answer;

    if (
      option === correctAnswer
    ) {

      setScore((prev) =>
        prev + 1
      );
    }

    setTimeout(() => {

      moveToNextQuestion();

    }, 1000);
  }

  // ================= NEXT QUESTION =================

  async function moveToNextQuestion() {

    setSelectedAnswer("");

    const nextQuestion =
      currentQuestion + 1;

    // ================= QUIZ FINISHED =================

    if (
      nextQuestion >=
      questions.length
    ) {

      setQuizFinished(true);

      // ================= UPDATE SCORE =================

      if (quizId) {

        const { error } =
          await supabase
            .from("quizzes")
            .update({

              score: score,

            })

            .eq(
              "id",
              quizId
            );

        if (error) {

          console.log(
            error.message
          );
        }
      }

      return;
    }

    setCurrentQuestion(
      nextQuestion
    );
  }

  // ================= START QUIZ =================

  function startQuiz() {

    setQuizStarted(true);

    setQuizFinished(false);

    setCurrentQuestion(0);

    setScore(0);

    setSelectedAnswer("");
  }

  // ================= RESET =================

  function resetQuiz() {

    setQuizStarted(false);

    setQuizFinished(false);

    setQuestions([]);

    setSummary("");

    setFlashcards([]);

    setPdfFile(null);

    setPdfUrl("");

    setCurrentQuestion(0);

    setScore(0);

    setSelectedAnswer("");

    setQuizId(null);

    setErrorMessage("");
  }

  // ================= PROGRESS =================

  const progress =
    questions.length > 0

      ? (
          (currentQuestion + 1)
          / questions.length
        ) * 100

      : 0;

  // ================= UI =================

  return (

    <div className="upload-page">

      <div className="upload-container">

        {/* ================= HEADER ================= */}

        <div className="upload-header">

          <h1 className="upload-title">
            AI PDF Learning System
          </h1>

          <p className="upload-subtitle">
            Upload your PDF and let AI
            generate quizzes,
            summaries,
            explanations,
            and flashcards.
          </p>

        </div>

        {/* ================= ERROR ================= */}

        {errorMessage && (

          <div className="error-box">

            {errorMessage}

          </div>
        )}

        {/* ================= UPLOAD ================= */}

        <div className="upload-card">

          <h2 className="section-title">
            Upload Study PDF
          </h2>

<p className="pdf-limit-text">

  Free PDF uploads left:
  {" "}
  {Math.max(
    0,
    PDF_LIMIT - pdfCount
  )}

</p>


{isPro ? (
  <div className="pro-status">
    ⭐ Pro Active • Unlimited AI Questions • Unlimited PDFs • Unlimited Image Analysis
  </div>
) : (
  <div className="free-status">
    Free PDF uploads left:
    {PDF_LIMIT - pdfCount}
  </div>
)}
          <input
            className="file-input"
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setPdfFile(
                e.target.files[0]
              )
            }
          />

          {pdfFile && (

            <div className="selected-file">

              {pdfFile.name}

            </div>
          )}

          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={
              uploading ||
              generating
            }
          >

            {
              uploading
                ? "Uploading PDF..."
                : generating
                ? "Generating AI Content..."
                : "Upload PDF"
            }

          </button>

          {(uploading || generating) && (

            <div className="loading-box">

              <div className="loading-spinner"></div>

              <span>
                AI is processing your PDF...
              </span>

            </div>
          )}

          {pdfUrl && (

            <a
              className="pdf-link"
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
            >

              Open Uploaded PDF

            </a>
          )}

        </div>

        {/* ================= SUMMARY ================= */}

        {summary && (

          <div className="summary-card">

            <h2 className="section-title">
              AI Summary
            </h2>

            <p className="summary-text">

              {summary}

            </p>

          </div>
        )}

        {/* ================= FLASHCARDS ================= */}

        {flashcards.length > 0 && (

          <div className="flashcard-card">

            <h2 className="section-title">
              Flashcards
            </h2>

            <div className="flashcard-grid">

              {flashcards.map(
                (
                  flashcard,
                  index
                ) => (

                  <div
                    key={index}
                    className="flashcard"
                  >

                    <h3>
                      {
                        flashcard.question
                      }
                    </h3>

                    <p>
                      {
                        flashcard.answer
                      }
                    </p>

                  </div>
                )
              )}

            </div>

          </div>
        )}


{/* ================= ACTION BUTTONS ================= */}

{questions.length > 0 && (

  <div className="action-buttons">

    <button
      className="action-btn tutor-btn"
      onClick={() =>
        navigate("/ai-tutor", {

          state: {

            pdfUrl,

            pdfName:
              pdfFile?.name,

            quizId,

          },
        })
      }
    >

      Open AI Tutor

    </button>

    <button
      className="action-btn flash-btn"
      onClick={() => {

        window.scrollTo({

          top:
            document.body.scrollHeight,

          behavior: "smooth",
        });

      }}
    >

      Review Flashcards

    </button>

  </div>
)}





        {/* ================= START QUIZ ================= */}

        {questions.length > 0 &&
          !quizStarted && (

          <div className="start-card">

            <h2>
              Quiz Ready 🎯
            </h2>

            <p>

              AI generated
              {` ${questions.length} `}
              questions from your PDF.

            </p>

            <button
              className="start-btn"
              onClick={startQuiz}
            >

              Start Quiz

            </button>

          </div>
        )}

        {/* ================= QUIZ ================= */}

        {quizStarted &&
          !quizFinished && (

          <div className="quiz-card">

            {/* ================= QUIZ TOP ================= */}

            <div className="quiz-header">

              <div>

                <h2>
                  Question
                  {" "}
                  {currentQuestion + 1}
                </h2>

                <p>
                  Total:
                  {" "}
                  {questions.length}
                </p>

              </div>

              <div className="score-box">

                Score:
                {" "}
                {score}

              </div>

            </div>

            {/* ================= PROGRESS ================= */}

            <div className="progress-wrapper">

              <div
                className="progress-bar"
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>

            {/* ================= QUESTION ================= */}

            <h3 className="question">

              {
                questions[
                  currentQuestion
                ]?.question
              }

            </h3>

            {/* ================= OPTIONS ================= */}

            <div className="options">

              {
                questions[
                  currentQuestion
                ]?.options?.map(
                  (
                    option,
                    index
                  ) => {

                    const correctAnswer =

                      questions[
                        currentQuestion
                      ]?.answer;

                    return (

                      <button

                        key={`${option}-${index}`}

                        className={`option-btn
                        ${
                          selectedAnswer
                            ? option ===
                              correctAnswer
                              ? "correct"

                              : option ===
                                selectedAnswer
                              ? "wrong"

                              : ""

                            : ""
                        }`}

                        onClick={() =>
                          handleAnswer(
                            option
                          )
                        }
                      >

                        {option}

                      </button>
                    );
                  }
                )
              }

            </div>

            {/* ================= EXPLANATION ================= */}

            {
              selectedAnswer && (

                <div className="explanation-box">

                  <h4>
                    Explanation
                  </h4>

                  <p>

                    {
                      questions[
                        currentQuestion
                      ]?.explanation
                    }

                  </p>

                </div>
              )
            }

          </div>
        )}

        {/* ================= FINISHED ================= */}

        {quizFinished && (

          <div className="finish-card">

            <h1>
              Quiz Completed 🎉
            </h1>

            <div className="final-score-circle">

              {score}
              /
              {questions.length}

            </div>

            <p className="final-text">

              Great job completing
              your AI-generated quiz.

            </p>

            <button
              className="restart-btn"
              onClick={resetQuiz}
            >

              Upload Another PDF

            </button>

          </div>
        )}

      </div>

    </div>
  );
}