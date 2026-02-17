"use client";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useState, useEffect, useRef } from "react";

interface VoiceInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
  timeRemaining: number;
}

const STATUS_LABELS: Record<string, string> = {
  idle: "대기",
  connecting: "연결 중...",
  active: "인식 중",
  reconnecting: "재연결 중...",
};

export default function VoiceInput({
  onSubmit,
  disabled,
  timeRemaining,
}: VoiceInputProps) {
  const {
    isListening,
    transcript,
    status,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  } = useSpeechRecognition();

  const [textInput, setTextInput] = useState("");
  const [mode, setMode] = useState<"text" | "voice">("text");

  // Track transcript via ref for auto-submit to avoid unnecessary effect runs
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  const textInputRef = useRef(textInput);
  textInputRef.current = textInput;

  // Auto-submit when time expires
  useEffect(() => {
    if (timeRemaining === 0 && !disabled) {
      const text =
        mode === "voice" ? transcriptRef.current : textInputRef.current;
      if (text.trim()) {
        if (isListening) stopListening();
        onSubmit(text.trim());
        setTextInput("");
        resetTranscript();
      }
    }
  }, [timeRemaining, disabled, mode, isListening, stopListening, onSubmit, resetTranscript]);

  const handleSubmit = () => {
    const text = mode === "voice" ? transcript : textInput;
    if (!text.trim() || disabled) return;
    if (isListening) stopListening();
    onSubmit(text.trim());
    setTextInput("");
    resetTranscript();
  };

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const statusLabel = STATUS_LABELS[status] ?? "";

  return (
    <div className="space-y-2">
      {/* Mode toggle */}
      {isSupported && (
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("text");
              if (isListening) stopListening();
            }}
            className={`px-2 py-1 rounded ${
              mode === "text"
                ? "bg-blue-600 text-white"
                : "bg-navy-700 text-slate-400"
            }`}
          >
            텍스트
          </button>
          <button
            type="button"
            onClick={() => setMode("voice")}
            className={`px-2 py-1 rounded ${
              mode === "voice"
                ? "bg-blue-600 text-white"
                : "bg-navy-700 text-slate-400"
            }`}
          >
            음성
          </button>
        </div>
      )}

      {mode === "voice" && isSupported ? (
        <div className="space-y-2">
          <div className="min-h-[80px] p-3 bg-navy-800 border border-navy-700 rounded-lg text-sm text-slate-300">
            {transcript || (
              <span className="text-slate-600">
                마이크 버튼을 눌러 발언하세요...
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              disabled={disabled}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
                isListening
                  ? status === "reconnecting"
                    ? "bg-yellow-600 text-white"
                    : "bg-red-600 text-white animate-pulse"
                  : "bg-navy-700 text-slate-300 hover:bg-navy-600"
              } disabled:opacity-40`}
            >
              {isListening
                ? `● ${statusLabel}`
                : "🎤 발언 시작"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!transcript.trim() || disabled}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              제출
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="발언 내용을 입력하세요..."
            disabled={disabled}
            rows={3}
            className="w-full p-3 bg-navy-800 border border-navy-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-600">Ctrl+Enter로 제출</span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!textInput.trim() || disabled}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              발언 제출
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
