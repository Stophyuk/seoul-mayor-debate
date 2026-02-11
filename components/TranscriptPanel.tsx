"use client";

import { useEffect, useRef } from "react";
import { DebateMessage } from "@/types/debate";

interface TranscriptPanelProps {
  messages: DebateMessage[];
}

const roleStyles: Record<DebateMessage["role"], string> = {
  moderator: "text-gold-400",
  candidate: "text-blue-400",
  opponent: "text-red-400",
};

export default function TranscriptPanel({ messages }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="border-t border-navy-700 bg-navy-950/80">
      <div className="max-w-5xl mx-auto px-6 py-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-500">TRANSCRIPT</span>
          <span className="text-xs text-slate-600">실시간 대본</span>
        </div>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {messages.map((msg) => (
            <div key={msg.id} className="text-xs leading-relaxed">
              <span className={`font-bold ${roleStyles[msg.role]}`}>
                [{msg.speaker}]
              </span>{" "}
              <span className="text-slate-400">{msg.content}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
