"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type RecognitionStatus = "idle" | "connecting" | "active" | "reconnecting";

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  status: RecognitionStatus;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

// Extend Window for webkitSpeechRecognition
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

const MAX_RETRIES = 3;

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<RecognitionStatus>("idle");
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const intentionalStopRef = useRef(false);
  const retryCountRef = useRef(0);
  const finalTranscriptRef = useRef("");

  function createRecognition() {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)();
    recognition.lang = "ko-KR";
    recognition.interimResults = true;
    recognition.continuous = true;
    return recognition;
  }

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      (!!((window as unknown as Record<string, unknown>).SpeechRecognition) ||
        !!((window as unknown as Record<string, unknown>).webkitSpeechRecognition));
    setIsSupported(supported);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  const setupRecognition = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recognition: any) => {
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscriptRef.current += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        setTranscript(finalTranscriptRef.current + interim);
        setStatus("active");
        retryCountRef.current = 0; // Reset retry on successful result
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const retryableErrors = ["no-speech", "network", "aborted"];
        if (
          retryableErrors.includes(event.error) &&
          !intentionalStopRef.current &&
          retryCountRef.current < MAX_RETRIES
        ) {
          retryCountRef.current++;
          setStatus("reconnecting");
          // Auto-restart will happen via onend
          return;
        }
        // Non-retryable or max retries exceeded
        setIsListening(false);
        setStatus("idle");
      };

      recognition.onend = () => {
        if (!intentionalStopRef.current) {
          // Unexpected end — auto-restart
          setStatus("reconnecting");
          try {
            recognition.start();
          } catch {
            // If start fails, create a new instance
            const newRecognition = createRecognition();
            if (newRecognition) {
              recognitionRef.current = newRecognition;
              setupRecognition(newRecognition);
              try {
                newRecognition.start();
              } catch {
                setIsListening(false);
                setStatus("idle");
              }
            } else {
              setIsListening(false);
              setStatus("idle");
            }
          }
        } else {
          setIsListening(false);
          setStatus("idle");
        }
      };
    },
    []
  );

  const startListening = useCallback(() => {
    if (!isSupported) return;

    intentionalStopRef.current = false;
    retryCountRef.current = 0;
    finalTranscriptRef.current = "";

    // Reuse existing or create new instance
    let recognition = recognitionRef.current;
    if (!recognition) {
      recognition = createRecognition();
      if (!recognition) return;
      recognitionRef.current = recognition;
    }

    setupRecognition(recognition);
    setStatus("connecting");

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // Instance might be in a bad state — create a new one
      recognition = createRecognition();
      if (!recognition) return;
      recognitionRef.current = recognition;
      setupRecognition(recognition);
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setStatus("idle");
      }
    }
  }, [isSupported, setupRecognition]);

  const stopListening = useCallback(() => {
    intentionalStopRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsListening(false);
    setStatus("idle");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    finalTranscriptRef.current = "";
  }, []);

  return {
    isListening,
    transcript,
    status,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  };
}
