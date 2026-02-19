"use client";

import { useEffect, useRef, useState } from "react";
import { DebateMessage } from "@/types/debate";
import { renderMarkdown } from "@/lib/render-markdown";

interface TranscriptPanelProps {
  messages: DebateMessage[];
}

const roleStyles: Record<DebateMessage["role"], { text: string; dot: string }> = {
  moderator: { text: "text-gold-400", dot: "bg-gold-400" },
  candidate: { text: "text-amber-400", dot: "bg-amber-400" },
  opponent: { text: "text-emerald-400", dot: "bg-emerald-400" },
};

export default function TranscriptPanel({ messages }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="border-t border-navy-700 bg-navy-950/80">
      <div className="max-w-5xl mx-auto px-6 py-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xs font-bold text-slate-500">TRANSCRIPT</span>
          <span className="text-xs text-slate-600">실시간 대본</span>
          <span className="ml-auto text-xs text-slate-500">
            {isExpanded ? "▲" : "▼"}
          </span>
        </button>
        <div
          className={`overflow-y-auto space-y-1 transition-all duration-300 ${
            isExpanded ? "max-h-[50vh]" : "max-h-24"
          }`}
        >
          {messages.map((msg) => {
            const style = roleStyles[msg.role];
            return (
              <div key={msg.id} className="text-sm leading-relaxed flex items-start gap-1.5">
                <span className={`w-2 h-2 rounded-full ${style.dot} mt-1.5 shrink-0`} />
                <span className={`font-bold ${style.text}`}>
                  [{msg.speaker}]
                </span>{" "}
                <span className="text-slate-400">{renderMarkdown(msg.content)}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
