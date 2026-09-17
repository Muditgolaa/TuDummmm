import { useState, useRef, useEffect } from "react";

// Wraps the Web Speech API so the interview answer box can accept voice input.
export function useSpeechRecognition() {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  );
  const [interim, setInterim] = useState(""); // live text as you speak
  const recRef = useRef(null);
  const manualStop = useRef(false);
  const onFinalRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true; // show words live
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      setInterim(interimText);
      if (finalText && onFinalRef.current) onFinalRef.current(finalText.trim());
    };

    // Chrome ends on silence — restart automatically unless the user stopped.
    rec.onend = () => {
      if (!manualStop.current) {
        try {
          rec.start();
        } catch {
          /* ignore double-start */
        }
      } else {
        setListening(false);
        setInterim("");
      }
    };

    rec.onerror = (e) => {
      // Brave / denied mic → stop cleanly
      if (["not-allowed", "service-not-allowed", "network"].includes(e.error)) {
        manualStop.current = true;
        setListening(false);
      }
    };

    recRef.current = rec;
    return () => {
      manualStop.current = true;
      try {
        rec.stop();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Speech recognition error:", error);
        }
      }
    };
  }, []);

  function start(onFinal) {
    if (!recRef.current) return;
    onFinalRef.current = onFinal;
    manualStop.current = false;
    setInterim("");
    try {
      recRef.current.start();
      setListening(true);
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Speech recognition error:", error);
      }
    }
  }

  function stop() {
    manualStop.current = true;
    try {
      recRef.current?.stop();
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Speech recognition error:", error);
      }
    }
    setListening(false);
    setInterim("");
  }

  return { listening, supported, interim, start, stop };
}