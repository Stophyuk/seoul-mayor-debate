"use client";

import { DebateMessage } from "@/types/debate";
import TimerDisplay from "./TimerDisplay";
import VoiceInput from "./VoiceInput";

interface CandidatePanelProps {
  name: string;
  party: string;
  messages: DebateMessage[];
  isActive: boolean;
  timeRemaining: number;
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

export default function CandidatePanel({
  name,
  party,
  messages,
  isActive,
  timeRemaining,
  onSubmit,
  isProcessing,
}: CandidatePanelProps) {
  const candidateMessages = messages.filter((m) => m.role === "candidate");
  const lastMessage = candidateMessages[candidateMessages.length - 1];

  return (
    <div
      className={`flex flex-col h-full rounded-xl border transition-all ${
        isActive
          ? "border-blue-500/50 bg-blue-950/20"
          : "border-navy-700 bg-navy-900/50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="font-bold text-blue-400">{name}</span>
          {party && (
            <span className="text-xs text-slate-500">({party})</span>
          )}
        </div>
        {isActive && (
          <TimerDisplay seconds={timeRemaining} isActive={isActive} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isActive ? (
          <VoiceInput
            onSubmit={onSubmit}
            disabled={isProcessing}
            timeRemaining={timeRemaining}
          />
        ) : lastMessage ? (
          <p className="text-sm text-slate-300 leading-relaxed">
            {lastMessage.content}
          </p>
        ) : (
          <p className="text-sm text-slate-600 italic">
            발언 대기 중...
          </p>
        )}
      </div>
    </div>
  );
}
