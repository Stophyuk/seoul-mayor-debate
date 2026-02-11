"use client";

import { useState, useCallback, useRef } from "react";

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  play: (audioUrl: string) => Promise<void>;
  playFromBlob: (blob: Blob) => Promise<void>;
  stop: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  const play = useCallback(
    async (audioUrl: string) => {
      cleanup();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);

      setIsPlaying(true);
      await audio.play();
    },
    [cleanup]
  );

  const playFromBlob = useCallback(
    async (blob: Blob) => {
      cleanup();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        cleanup();
      };
      audio.onerror = () => {
        setIsPlaying(false);
        cleanup();
      };

      setIsPlaying(true);
      await audio.play();
    },
    [cleanup]
  );

  const stop = useCallback(() => {
    cleanup();
    setIsPlaying(false);
  }, [cleanup]);

  return { isPlaying, play, playFromBlob, stop };
}
