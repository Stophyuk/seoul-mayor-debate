"use client";

interface TimerDisplayProps {
  seconds: number;
  isActive: boolean;
}

export default function TimerDisplay({ seconds, isActive }: TimerDisplayProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds <= 30 && seconds > 0;
  const isExpired = seconds === 0 && isActive;

  return (
    <div
      className={`font-mono text-2xl font-bold tabular-nums ${
        isExpired
          ? "text-red-500 animate-pulse"
          : isLow
            ? "text-red-400"
            : "text-gold-400"
      }`}
    >
      {minutes}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
