"use client";

import { DebateMessage, DebatePhase } from "@/types/debate";
import { getPhaseLabel } from "@/lib/debate-engine";
import SpeechButton from "./SpeechButton";

interface ModeratorPanelProps {
  messages: DebateMessage[];
  phase: DebatePhase;
  round: number;
  totalRounds: number;
  topic: string;
  isProcessing: boolean;
  bridgeText: string | null;
}

export default function ModeratorPanel({
  messages,
  phase,
  round,
  totalRounds,
  topic,
  isProcessing,
  bridgeText,
}: ModeratorPanelProps) {
  const lastModeratorMsg = [...messages]
    .reverse()
    .find((m) => m.role === "moderator");

  return (
    <div className="bg-navy-900/80 border-b border-navy-700 px-6 py-4">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400 text-sm font-bold">
              MC
            </div>
            <span className="text-gold-400 font-medium text-sm">
              사회자 김진행
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>
              {round}/{totalRounds} 라운드
            </span>
            <span className="text-gold-400">{topic}</span>
            <span className="px-2 py-0.5 rounded bg-navy-700 text-slate-400">
              {getPhaseLabel(phase)}
            </span>
          </div>
        </div>

        {/* Moderator message */}
        <div className="min-h-[2rem]">
          {phase === "processing" && bridgeText ? (
            <p className="text-gold-400 text-sm leading-relaxed animate-fade-in">
              {bridgeText}
            </p>
          ) : isProcessing && phase === "intro" ? (
            <p className="text-slate-400 text-sm typing-cursor">
              사회자가 토론을 준비하고 있습니다
            </p>
          ) : lastModeratorMsg ? (
            <div className="flex items-start gap-2">
              <p className="text-slate-200 text-sm leading-relaxed flex-1">
                {lastModeratorMsg.content}
              </p>
              <SpeechButton
                text={lastModeratorMsg.content}
                voiceType="moderator"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
