"use client";

import { DebateMessage } from "@/types/debate";
import { renderMarkdown } from "@/lib/render-markdown";
import VoiceInput from "./VoiceInput";

interface CandidatePanelProps {
  name: string;
  party: string;
  messages: DebateMessage[];
  isActive: boolean;
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

export default function CandidatePanel({
  name,
  party,
  messages,
  isActive,
  onSubmit,
  isProcessing,
}: CandidatePanelProps) {
  const candidateMessages = messages.filter((m) => m.role === "candidate");
  const lastMessage = candidateMessages[candidateMessages.length - 1];

  return (
    <div
      className={`flex flex-col h-full rounded-xl border transition-all ${
        isActive
          ? "border-amber-500/50 bg-amber-950/20"
          : "border-navy-700 bg-navy-900/50"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="font-bold text-amber-400 text-base">{name}</span>
          {party && (
            <span className="text-xs text-slate-500">({party})</span>
          )}
        </div>
        {isActive && (
          <span className="text-xs text-amber-400 font-medium">발언 중</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isActive ? (
          <VoiceInput
            onSubmit={onSubmit}
            disabled={isProcessing}
          />
        ) : lastMessage ? (
          <p className="text-base text-slate-300 leading-relaxed">
            {renderMarkdown(lastMessage.content)}
          </p>
        ) : (
          <p className="text-base text-slate-600 italic">
            발언 대기 중...
          </p>
        )}
      </div>
    </div>
  );
}
