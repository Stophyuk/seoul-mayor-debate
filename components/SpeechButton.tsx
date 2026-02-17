"use client";

import { useState, useCallback, useRef } from "react";

interface SpeechButtonProps {
  text: string;
  voiceType: "opponent" | "moderator";
  disabled?: boolean;
}

type PlayState = "idle" | "loading" | "playing";

export default function SpeechButton({
  text,
  voiceType,
  disabled,
}: SpeechButtonProps) {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const handleClick = useCallback(async () => {
    if (playState === "playing") {
      cleanup();
      setPlayState("idle");
      return;
    }

    if (playState === "loading") return;

    setPlayState("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceType }),
      });

      if (!res.ok) {
        setPlayState("idle");
        return;
      }

      const blob = await res.blob();
      cleanup();

      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayState("idle");
        cleanup();
      };
      audio.onerror = () => {
        setPlayState("idle");
        cleanup();
      };

      setPlayState("playing");
      await audio.play();
    } catch {
      setPlayState("idle");
    }
  }, [text, voiceType, playState, cleanup]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || !text}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
      title={
        playState === "playing"
          ? "음성 정지"
          : playState === "loading"
          ? "로딩 중..."
          : "음성으로 듣기"
      }
    >
      {playState === "loading" ? (
        <svg
          className="w-4 h-4 text-slate-400 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
          />
        </svg>
      ) : playState === "playing" ? (
        <svg
          className="w-4 h-4 text-emerald-400"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14l-1.41-1.41a8 8 0 000-11.32l1.41-1.41zM15.54 8.46a5 5 0 010 7.07l-1.41-1.41a3 3 0 000-4.24l1.41-1.42z" />
        </svg>
      )}
    </button>
  );
}
