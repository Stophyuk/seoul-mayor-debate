"use client";

import { DebateMessage } from "@/types/debate";
import { HONGBOT_INFO } from "@/lib/prompts";

interface OpponentPanelProps {
  messages: DebateMessage[];
  isActive: boolean;
  isProcessing: boolean;
}

export default function OpponentPanel({
  messages,
  isActive,
  isProcessing,
}: OpponentPanelProps) {
  const opponentMessages = messages.filter((m) => m.role === "opponent");
  const lastMessage = opponentMessages[opponentMessages.length - 1];

  return (
    <div
      className={`flex flex-col h-full rounded-xl border transition-all ${
        isActive
          ? "border-emerald-500/50 bg-emerald-950/20"
          : "border-navy-700 bg-navy-900/50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: HONGBOT_INFO.color }}
          />
          <span className="font-bold" style={{ color: HONGBOT_INFO.color }}>
            {HONGBOT_INFO.name}
          </span>
          <span className="text-xs text-slate-500">({HONGBOT_INFO.title})</span>
        </div>
        {isActive && (
          <span className="text-xs text-emerald-400 font-medium">발언 중</span>
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
