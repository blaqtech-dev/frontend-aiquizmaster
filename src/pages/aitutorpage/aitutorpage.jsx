import {
  useEffect,
  useRef,
  useState,
} from "react";


import {
  Send,
  Mic,
  MicOff,
  Trash2,
} from "lucide-react";

import {
  useAuth
}
from "../../context/authcontext/authcontext";
import { useLocation,useNavigate } from "react-router-dom";

import "./aitutor.css";

export function AiTutorPage() {

    const API = import.meta.env.VITE_API_URL;


const {
  profile,user
} = useAuth();

const isPro =
  profile?.plan === "pro";




  const location = useLocation();
const [isSpeaking, setIsSpeaking] = useState(false);
  // ================= PDF DATA =================

  const initialPdfUrl =
    location.state?.pdfUrl ||
    localStorage.getItem("currentPdfUrl") ||
    "";

  const initialPdfName =
    location.state?.pdfName ||
    localStorage.getItem("currentPdfName") ||
    "PDF";

  const [pdfUrl] =
    useState(initialPdfUrl);

  const [pdfName] =
    useState(initialPdfName);


    const chatStorageKey =
  `aiTutorMessages-${pdfName}`;

  // ================= CHAT STATES =================

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ================= VOICE STATES =================

  const [isListening, setIsListening] =
    useState(false);

  const [voiceSupported] =
    useState(
      !!(
        window.SpeechRecognition ||
        window.webkitSpeechRecognition
      )
    );

  const recognitionRef =
    useRef(null);

  const chatEndRef =
    useRef(null);

    const navigate=useNavigate()


       const FREE_QUESTION_LIMIT = 15;
    const [questionCount, setQuestionCount] =
  useState(0);


useEffect(() => {
  if (!user?.id) return;

  const savedCount =
    Number(
      localStorage.getItem(
        `questionCount-${user.id}`
      )
    ) || 0;

  setQuestionCount(savedCount);

}, [user]);
  // ================= SAVE CURRENT PDF =================

  useEffect(() => {

    if (pdfUrl) {

      localStorage.setItem(
        "currentPdfUrl",
        pdfUrl
      );

      localStorage.setItem(
        "currentPdfName",
        pdfName
      );
    }

  }, [pdfUrl, pdfName]);

  // ================= LOAD MEMORY =================

// ================= LOAD PDF CHAT MEMORY =================

useEffect(() => {

  const savedMessages =
    localStorage.getItem(
      chatStorageKey
    );

  if (savedMessages) {

    setMessages(
      JSON.parse(savedMessages)
    );

  } else {

    // clear messages for new pdf

    setMessages([]);
  }

}, [chatStorageKey]);

  // ================= SAVE MEMORY =================

 // ================= SAVE PDF CHAT MEMORY =================

useEffect(() => {

  localStorage.setItem(

    chatStorageKey,

    JSON.stringify(messages)
  );

}, [messages, chatStorageKey]);

  // ================= AUTO SCROLL =================

  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages, loading]);

  // ================= QUICK PROMPTS =================

  const quickPrompts = [

    "Explain this PDF simply ",

    "Summarize the important concepts of this pdf",

    "Give me difficult questions  of this pdf",

    "Teach me like a beginner",


    "Explain the hardest topic of this pdf",

    "Create practice questions of this pdf",

    "What should I study first  base on the pdf?",
  ];

  // ================= SPEAK AI =================

  function speakText(text) {
  // stop any previous speech first
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;

  speech.onstart = () => {
    setIsSpeaking(true);
  };

  speech.onend = () => {
    setIsSpeaking(false);
  };

  speech.onerror = () => {
    setIsSpeaking(false);
  };

  window.speechSynthesis.speak(speech);
}


function pauseSpeech() {
  window.speechSynthesis.pause();
}

function resumeSpeech() {
  window.speechSynthesis.resume();
}

function stopSpeech() {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
}
  // ================= START VOICE =================

  function startVoiceRecognition() {

    if (!voiceSupported)
      return;

    const SpeechRecognition =

      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognitionRef.current =
      recognition;

    recognition.start();

    setIsListening(true);

    recognition.onresult = (
      event
    ) => {

      const transcript =

        event.results[0][0]
          .transcript;

      setQuestion(transcript);

      askQuestion(transcript);
    };

    recognition.onerror = () => {

      setIsListening(false);
    };

    recognition.onend = () => {

      setIsListening(false);
    };
  }

  // ================= STOP VOICE =================

  function stopVoiceRecognition() {

    recognitionRef.current?.stop();

    setIsListening(false);
  }

  // ================= ASK AI =================

  async function askQuestion(
    customQuestion = null
  ) {


  if (
  !isPro &&
  questionCount >= FREE_QUESTION_LIMIT
) {
 alert(
  "You have used all free AI questions. Upgrade to continue."
);

navigate("/upgrade");
  return;
}





      if (loading) return;

    const finalQuestion =
      customQuestion || question;

    if (
      !finalQuestion.trim() ||
      !pdfUrl
    ) {

      return;
    }

    const userMessage = {

      role: "user",

      content: finalQuestion,
    };

    const updatedMessages = [

      ...messages,

      userMessage,
    ];

    setMessages(updatedMessages);

    setQuestion("");

    setLoading(true);

    try {

      const response =
        await fetch(
           `${API}/api/ai-tutor`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              question:
                finalQuestion,

              pdfUrl,

              history:
                updatedMessages,
            }),
          }
        );

      const result =
        await response.json();

      const aiText =

        result.answer ||
        "AI could not respond.";

      const aiMessage = {

        role: "assistant",

        content: aiText,
      };


    if (!isPro) {

  setQuestionCount(prev => {

    const newCount =
      prev + 1;

    localStorage.setItem(
      `questionCount-${user.id}`,
      newCount
    );

    return newCount;

  });

}

      setMessages([

        ...updatedMessages,

        aiMessage,
      ]);

      // ================= SPEAK AI =================

      speakText(aiText);

    } catch (error) {

      console.log(error);

      setMessages([

        ...updatedMessages,

        {

          role: "assistant",

          content:
            "Something went wrong while talking to AI.",
        },
      ]);

    } finally {

      setLoading(false);
    }
  }

  // ================= CLEAR CHAT =================

  function clearChat() {

    const confirmClear =
      window.confirm(
        "Clear AI Tutor chat history?"
      );

    if (!confirmClear)
      return;

    setMessages([]);

   localStorage.removeItem(
  chatStorageKey
);
  }

  // ================= ENTER KEY =================

  function handleKeyDown(e) {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      askQuestion();
    }
  }

  return (

    <div className="ai-page">

      <div className="ai-container">

        {/* ================= HEADER ================= */}

        <div className="ai-top">

          <div>

            <h1>
              AI PDF Tutor
            </h1>

            <p className="ai-subtitle">
              AI Voice Learning Assistant
            </p>

          </div>

          <div className="studying-box">
{isPro ? (
  <p className="pro-badge">
    ⭐ Pro Plan Active
  </p>
) : (
  <p>
    Free questions left:
    {" "}
    {Math.max(
      0,
      FREE_QUESTION_LIMIT - questionCount
    )}
  </p>
)}
            <span>
              Currently Studying
            </span>

            <h3>

              {pdfName}

            </h3>

          </div>

        </div>

        {/* ================= NO PDF ================= */}

        {!pdfUrl && (

          <div className="no-pdf-box">

            <h2>
              No PDF Selected
            </h2>

            <p>
              Open AI Tutor from Upload
              Page or Quiz Storage.
            </p>

          </div>
        )}

        {/* ================= QUICK PROMPTS ================= */}

        {pdfUrl && (

          <div className="quick-prompts">

            {quickPrompts.map(
              (prompt, index) => (

                <button
                  key={index}
                  className="prompt-btn"
                  onClick={() =>
                    askQuestion(prompt)
                  }
                >

                  {prompt}

                </button>
              )
            )}

          </div>
        )}

        {/* ================= CHAT ================= */}

        <div className="chat-box">

          {messages.length === 0 && (

            <div className="empty-chat">

              <h2>
                Ask anything about your PDF
              </h2>

              <p>
                AI can explain concepts,
                summarize topics,
                generate practice questions,
                and answer with voice.
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
                className={`message ${message.role}`}
              >

                <p>

                  {message.content}

                </p>

              </div>
            )
          )}

          {loading && (

            <div className="message assistant">

              <p>
                AI is thinking...
              </p>

            </div>
          )}

          <div ref={chatEndRef}></div>

        </div>

        {/* ================= INPUT AREA ================= */}

        {pdfUrl && (

          <div className="input-area">

            <div className="input-inner">

              <textarea

                placeholder="Ask anything about the PDF..."

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

              <div className="action-buttons">

                <button
  className="ask-btn"
  onClick={() => askQuestion()}
  disabled={loading}
>
  {loading ? (
    "..."
  ) : (
    <Send size={22} />
  )}
</button>

<div className="voice-control">

  {isSpeaking ? (
    <div className='aitutor-controol'>
      <button onClick={pauseSpeech}>Pause</button>
      <button onClick={resumeSpeech}>Resume</button>
      <button onClick={stopSpeech}>Stop</button>
    </div>
  ) : (
    <span>🔊 Voice ready</span>
  )}

</div>

                {voiceSupported && (
  <button
    className={`voice-btn ${
      isListening ? "listening" : ""
    }`}
    onClick={() =>
      isListening
        ? stopVoiceRecognition()
        : startVoiceRecognition()
    }
  >
    {isListening ? (
      <MicOff size={22} />
    ) : (
      <Mic size={22} />
    )}
  </button>
)}
<button
  className="clear-btn"
  onClick={clearChat}
>
  <Trash2 size={22} />
</button>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}