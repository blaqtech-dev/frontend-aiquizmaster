import { useEffect, useState } from "react";
import './installapp.css'
function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);


  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();

      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert("Install not available yet (check PWA setup)");
      return;
    }

    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    console.log("User choice:", choice);

    setDeferredPrompt(null);
    setShowButton(false);
  };

  return (
    <>
      {showButton && (
        <button className="install-btn" onClick={installApp}>
          Install App
        </button>
      )}

      {isIOS && (
  <div className="install-tip">
    📱 To install this app:
    <br />
    Tap Share → “Add to Home Screen”
  </div>
)}
    </>
  );
}

export default InstallApp;