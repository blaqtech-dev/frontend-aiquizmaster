import {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  Upload,
  Send,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  BookOpen,
} from "lucide-react";

import "./imagescan.css";


import { useAuth }
from "../../context/authcontext/authcontext";

import {
  getUsage,
  incrementUsage,
}
from "../../services/usage/usageservice";

import {
  useNavigate
}
from "react-router-dom";

export function ImageScanPage() {

  const API =
   import.meta.env.VITE_API_URL;


   const {
  profile,
  user
} = useAuth();

const navigate =
  useNavigate();

const isPro =
  profile?.plan === "pro";

const FREE_IMAGE_LIMIT = 5;

const [
  imageCount,
  setImageCount
] = useState(0);



  const [title, setTitle] =
    useState("");

  const [images, setImages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [summary, setSummary] =
    useState("");

    const [noteText, setNoteText] =
  useState("");

  const [messages, setMessages] =
    useState([]);

  const [question, setQuestion] =
    useState("");

    const [isThinking, setIsThinking] =
  useState(false);

  const chatEndRef =
    useRef(null);

  useEffect(() => {

    chatEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }, [messages]);

  // ==========================
  // IMAGE SELECT
  // ==========================



  useEffect(() => {

  async function loadUsage() {

    if (!user?.id) return;

    const usage =
      await getUsage(user.id);

    setImageCount(
      usage?.image_count || 0
    );
  }

  loadUsage();

}, [user]);

  function handleImages(e) {

    const files =
      Array.from(e.target.files);

    const newImages =
      files.map((file) => ({
        file,
        preview:
          URL.createObjectURL(file),
      }));

    setImages(prev => [
      ...prev,
      ...newImages,
    ]);
  }

  // ==========================
  // DELETE
  // ==========================

  function deleteImage(index) {

    setImages(prev =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  }

  // ==========================
  // MOVE UP
  // ==========================

  function moveUp(index) {

    if (index === 0) return;

    const arr = [...images];

    [
      arr[index],
      arr[index - 1],
    ] = [
      arr[index - 1],
      arr[index],
    ];

    setImages(arr);
  }

  // ==========================
  // MOVE DOWN
  // ==========================

  function moveDown(index) {

    if (
      index ===
      images.length - 1
    )
      return;

    const arr = [...images];

    [
      arr[index],
      arr[index + 1],
    ] = [
      arr[index + 1],
      arr[index],
    ];

    setImages(arr);
  }

  // ==========================
  // ANALYZE NOTES
  // ==========================

  async function analyzeNotes() {

    if (
  !isPro &&
  imageCount >= FREE_IMAGE_LIMIT
) {

  alert(
    "You have used all free image scans. Upgrade to continue."
  );

  navigate("/upgrade");

  return;
}




    if (!title.trim()) {

      alert(
        "Enter a note title"
      );

      return;
    }

    if (images.length === 0) {

      alert(
        "Upload at least one page"
      );

      return;
    }

    try {

      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title
      );

      images.forEach(
        (img) => {

          formData.append(
            "images",
            img.file
          );
        }
      );

      const response =
        await fetch(
          `${API}/api/scan-notes`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!data.success) {

        throw new Error(
          data.error
        );
      }

     setSummary(
  data.summary
);

setNoteText(
  data.noteText
);

setMessages([
  {
    role:"assistant",
    content:data.summary,
  },
]);

if (!isPro) {

  await incrementUsage(
    user.id,
    "image_count"
  );

  setImageCount(prev =>
    prev + 1
  );
}

    } catch (error) {

      console.log(error);

      alert(
        "Failed to analyze notes"
      );

    } finally {

      setLoading(false);
    }
  }

  // ==========================
  // CHAT
  // ==========================

  async function askQuestion() {

    if (
      !question.trim() ||
      !summary
    )
      return;

    const userMessage = {

      role: "user",

      content: question,
    };

    const updatedMessages = [

      ...messages,

      userMessage,
    ];

    setMessages(
      updatedMessages
    );

    const currentQuestion =
      question;

    setQuestion("");
    setIsThinking(true);

    try {

        console.log(
  "NOTE TEXT SENT:",
  noteText
);

      const response =
        await fetch(
          `${API}/api/scan-notes-chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

  question:
    currentQuestion,

  noteText,

  history:
    updatedMessages,
}),
          }
        );

      const data =
        await response.json();

      setMessages([

        ...updatedMessages,

        {
          role:
            "assistant",

          content:
            data.answer,
        },
      ]);
setIsThinking(false);
    } catch (error) {

      console.log(error);
        setIsThinking(false);
    }
  }

  // ==========================
  // CLEAR
  // ==========================

 function clearAll() {

  setImages([]);

  setTitle("");

  setSummary("");

  setNoteText("");

  setMessages([]);

  setQuestion("");
}

  return (

    <div className="scan-page">

      <div className="scan-container">

        <div className="scan-header">

          <BookOpen size={40} />

          <h1>
            Smart Scan Notes
          </h1>

          <p>
  Upload multiple note
  pages and let AI
  summarize and teach
  them.
</p>

{
  isPro ? (

    <p className="pro-badge">
      ⭐ Pro Active
    </p>

  ) : (

    <p className="free-limit">

      Free scans left:

      {" "}

      {
        Math.max(
          0,
          FREE_IMAGE_LIMIT -
          imageCount
        )
      }

    </p>

  )
}

        </div>

        {/* TITLE */}

        <input
          className="title-input"
          placeholder="Note title..."
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />

        {/* UPLOAD */}

        <label className="upload-box">

          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={
              handleImages
            }
          />

          <Upload size={45} />

          <span>
            Select Note Pages
          </span>

        </label>

        {/* IMAGES */}

        {images.length > 0 && (

          <div className="images-grid">

            {images.map(
              (
                img,
                index
              ) => (

                <div
                  key={index}
                  className="image-card"
                >

                  <img
                    src={
                      img.preview
                    }
                    alt=""
                  />

                  <div className="image-actions">

                    <button
                      onClick={() =>
                        moveUp(
                          index
                        )
                      }
                    >
                      <ArrowUp
                        size={16}
                      />
                    </button>

                    <button
                      onClick={() =>
                        moveDown(
                          index
                        )
                      }
                    >
                      <ArrowDown
                        size={16}
                      />
                    </button>

                    <button
                      onClick={() =>
                        deleteImage(
                          index
                        )
                      }
                    >
                      <Trash2
                        size={16}
                      />
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

        {/* ANALYZE */}

        <button
          className="analyze-btn"
          disabled={loading}
          onClick={
            analyzeNotes
          }
        >

          {loading
            ? "Analyzing..."
            : "Analyze Notes"}

        </button>

        {/* CHAT */}

        {summary && (

          <>
            <div className="chat-box">

              {messages.map(
                (
                  msg,
                  index
                ) => (

                  <div
                    key={index}
                    className={`chat-message ${msg.role}`}
                  >

                    <p>
                      {
                        msg.content
                      }
                    </p>

                  </div>
                )
              )}

 {isThinking && (

  <div
    className="chat-message assistant"
  >

    <p className="chat-thinking">
      Thinking...
    </p>

  </div>

)}

              <div
                ref={
                  chatEndRef
                }
              />

            </div>

            <div className="chat-input">

              <textarea
                placeholder="Ask anything about these notes..."
                value={
                  question
                }
                onChange={(
                  e
                ) =>
                  setQuestion(
                    e.target
                      .value
                  )
                }
              />

              <button
                onClick={
                  askQuestion
                }
              >

                <Send
                  size={18}
                />

              </button>

            </div>

            <button
              className="clear-btn"
              onClick={
                clearAll
              }
            >
              Start New Note
            </button>
          </>
        )}

      </div>

    </div>
  );
}