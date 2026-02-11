"use client";

import { DebateMessage, PersonaType } from "@/types/debate";
import { PERSONAS } from "@/lib/prompts";

interface OpponentPanelProps {
  persona: PersonaType;
  messages: DebateMessage[];
  isActive: boolean;
  isProcessing: boolean;
}

export default function OpponentPanel({
  persona,
  messages,
  isActive,
  isProcessing,
}: OpponentPanelProps) {
  const info = PERSONAS[persona];
  const opponentMessages = messages.filter((m) => m.role === "opponent");
  const lastMessage = opponentMessages[opponentMessages.length - 1];

  return (
    <div
      className={`flex flex-col h-full rounded-xl border transition-all ${
        isActive
          ? "border-red-500/50 bg-red-950/20"
          : "border-navy-700 bg-navy-900/50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: info.color }}
          />
          <span className="font-bold" style={{ color: info.color }}>
            {info.name}
          </span>
          <span className="text-xs text-slate-500">({info.title})</span>
        </div>
        {isActive && (
          <span className="text-xs text-red-400 font-medium">발언 중</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isProcessing ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="typing-cursor">응답을 준비하고 있습니다</span>
          </div>
        ) : lastMessage ? (
          <p className="text-sm text-slate-300 leading-relaxed">
            {lastMessage.content}
          </p>
        ) : (
          <p className="text-sm text-slate-600 italic">발언 대기 중...</p>
        )}
      </div>
    </div>
  );
}
