import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Upload,
  Send,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

import {
  useAuth
}
from "../../context/authcontext/authcontext";
import { useNavigate } from "react-router-dom";
import "./imagetutor.css";
import {
  getUsage,
  incrementUsage,
}
from "../../services/usage/usageservice.js";
export function ImageAiTutorPage() {

const API = import.meta.env.VITE_API_URL;


    const navigate=useNavigate()
    const {
  profile,user
} = useAuth();

const isPro =
  profile?.plan === "pro";

  // ================= STATES =================

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    preview,
    setPreview,
  ] = useState("");

  const [
    question,
    setQuestion,
  ] = useState("");




  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    imageAnalysis,
    setImageAnalysis,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState([]);

  const chatEndRef =
    useRef(null);


   const FREE_IMAGE_LIMIT = 10;


   const [imageCount, setImageCount] =
  useState(0);

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
  // ================= AUTO SCROLL =================

  useEffect(() => {

    chatEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });

  }, [messages, loading]);

  // ================= IMAGE SELECT =================

  function handleImage(e) {

    const file =
      e.target.files[0];

    if (!file) return;

    // ================= RESET =================

    setMessages([]);

    setImageAnalysis("");

    setQuestion("");

    setSelectedImage(file);

    setPreview(
      URL.createObjectURL(file)
    );
  }

  // ================= ANALYZE IMAGE =================

  async function analyzeImage() {


  if (
  !isPro &&
  imageCount >= FREE_IMAGE_LIMIT
) {
 alert(
  "You have used all free AI questions. Upgrade to continue."
);

navigate("/upgrade");
  return;
}




    if (
      !selectedImage ||
      loading
    ) {

      return;
    }

    setLoading(true);

    try {

      const formData =
        new FormData();

      formData.append(
        "image",
        selectedImage
      );

      formData.append(
        "question",
        question ||
          "Explain this image in detail"
      );

      const response =
        await fetch(
         `${API}/api/image-ai`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      const aiAnswer =
        data.answer ||
        "No response";


   if (!isPro) {

  await incrementUsage(
    user.id,
    "image_count"
  );

  setImageCount(prev =>
    prev + 1
  );

}


      // ================= SAVE ANALYSIS =================

      setImageAnalysis(
        aiAnswer
      );

      // ================= CHAT START =================

      setMessages([
        {
          role: "assistant",
          content:
            aiAnswer,
        },
      ]);

      setQuestion("");

    } catch (error) {

      console.log(error);

      setMessages([
        {
          role: "assistant",
          content:
            "AI failed to analyze image.",
        },
      ]);

    } finally {

      setLoading(false);
    }
  }

  // ================= FOLLOW-UP CHAT =================

  async function askImageQuestion() {

    if (
      !question.trim() ||
      !imageAnalysis ||
      loading
    ) {

      return;
    }

    const userMessage = {

      role: "user",

      content: question,
    };

    const updatedMessages = [

      ...messages,

      userMessage,
    ];

    setMessages(updatedMessages);

    const currentQuestion =
      question;

    setQuestion("");

    setLoading(true);

    try {

      const response =
  await fetch(
    `${API}/api/image-chat`,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              question:
                currentQuestion,

              imageAnalysis,

              history:
                updatedMessages,
            }),
          }
        );

      const data =
        await response.json();

      const aiMessage = {

        role: "assistant",

        content:
          data.answer ||
          "No response",
      };


    
      setMessages([

        ...updatedMessages,

        aiMessage,
      ]);

    } catch (error) {

      console.log(error);

      setMessages([

        ...updatedMessages,

        {
          role: "assistant",

          content:
            "AI chat failed.",
        },
      ]);

    } finally {

      setLoading(false);
    }
  }

  // ================= ENTER KEY =================

  function handleKeyDown(e) {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      if (
        imageAnalysis
      ) {

        askImageQuestion();

      } else {

        analyzeImage();
      }
    }
  }

  // ================= CLEAR CHAT =================

  function clearChat() {

    setMessages([]);

    setImageAnalysis("");

    setQuestion("");

    setPreview("");

    setSelectedImage(null);
  }

  return (

    <div className="image-ai-page">

      <div className="image-ai-container">

        {/* ================= HEADER ================= */}

        <div className="image-ai-header">

          <h1>
            Image AI Tutor
          </h1>

          <p>
            Upload study images
            and chat with AI
          </p>

        </div>

        {/* ================= IMAGE UPLOAD ================= */}

        <label className="upload-box">

         <input
  type="file"
  accept="image/*"
  hidden
  onChange={handleImage}
/>

          <ImageIcon
            size={45}
          />

          <span>
            Upload or Snap
            Image
          </span>
          

        </label>
 <span>1 min max  to generate</span>
        {/* ================= PREVIEW ================= */}

        {preview && (

          <div className="preview-wrapper">

            <img
              src={preview}
              alt="preview"
              className="preview-image"
            />

          </div>
        )}

{isPro ? (
  <p className="pro-badge">
    ⭐ Unlimited Image Analysis
  </p>
) : (
  <p>
    Free analyses left:
    {" "}
    {Math.max(
      0,
      FREE_IMAGE_LIMIT - imageCount
    )}
     
  </p>

)}
        {/* ================= CHAT BOX ================= */}

        <div className="image-chat-box">

          {messages.length === 0 && (

            <div className="empty-chat">

              <h2>
                AI Image Tutor
              </h2>

              <p>
                Upload any study
                material image and
                ask AI questions.
              </p>

            </div>
          )}

          {messages.map(
            (
              message,
              index
            ) => (

              <div
                key={index}
                className={`image-message ${message.role}`}
              >

                <p>
                  {
                    message.content
                  }
                </p>

              </div>
            )
          )}

          {loading && (

            <div className="image-message assistant">

              <p>
                AI is thinking...
              </p>

            </div>
          )}

          <div
            ref={chatEndRef}
          ></div>

        </div>

        {/* ================= INPUT ================= */}

        <div className="image-input-area">

          <textarea

            placeholder={
              imageAnalysis
                ? "Ask follow-up questions..."
                : "Ask AI about this image..."
            }

            value={question}

            onChange={(e) =>
              setQuestion(
                e.target.value
              )
            }

            onKeyDown={
              handleKeyDown
            }
          />

          <div className="image-actions">

            {/* ================= SEND ================= */}

            <button

              className="send-btn"

              onClick={() => {

                if (
                  imageAnalysis
                ) {

                  askImageQuestion();

                } else {

                  analyzeImage();
                }
              }}

              disabled={loading}
            >

              {loading ? (
                "..."
              ) : (
                <Send
                  size={20}
                />
              )}

            </button>

            {/* ================= CLEAR ================= */}

            <button

              className="clear-btn"

              onClick={
                clearChat
              }
            >

              <Trash2
                size={20}
              />

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}