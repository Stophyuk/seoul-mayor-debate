"use client";

import { useDebate } from "@/hooks/useDebate";
import ModeratorPanel from "./ModeratorPanel";
import CandidatePanel from "./CandidatePanel";
import OpponentPanel from "./OpponentPanel";
import FactCheckOverlay from "./FactCheckOverlay";
import TranscriptPanel from "./TranscriptPanel";
import topicsData from "@/data/topics.json";

interface DebateStageProps {
  debate: ReturnType<typeof useDebate>;
}

export default function DebateStage({ debate }: DebateStageProps) {
  const {
    state,
    opponentName,
    submitSpeech,
    advanceRound,
    advanceToClosing,
    resetDebate,
  } = debate;
  const { phase, config, currentRound, currentTopic, messages, factChecks } =
    state;

  const topicTitle =
    topicsData.topics.find((t) => t.id === currentTopic)?.title ?? currentTopic;

  const showFactCheck =
    phase === "factcheck-display" ||
    (phase === "ai-turn" && factChecks.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Moderator */}
      <ModeratorPanel
        messages={messages}
        phase={phase}
        round={currentRound}
        totalRounds={config.roundCount}
        topic={topicTitle}
        isProcessing={state.isProcessing}
        bridgeText={state.bridgeText}
      />

      {/* Main stage */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-4">
        {/* Cooperation phase UI */}
        {phase === "cooperation" && (
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-emerald-950/30 to-amber-950/30 border border-emerald-700/30">
            <div className="text-center space-y-3">
              <div className="text-2xl font-bold">
                <span className="text-emerald-400">홍봇의 머리</span>
                <span className="text-slate-400 mx-2">+</span>
                <span className="text-amber-400">{config.candidateName}의 심장</span>
              </div>
              <p className="text-slate-400 text-sm">
                대결을 넘어 협력으로 — 서울의 미래를 함께 만들어갑니다
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-22rem)]">
          {/* Human candidate */}
          <CandidatePanel
            name={config.candidateName}
            party=""
            messages={messages}
            isActive={phase === "human-turn"}
            timeRemaining={state.timeRemaining}
            onSubmit={submitSpeech}
            isProcessing={state.isProcessing}
          />

          {/* AI opponent */}
          <OpponentPanel
            messages={messages}
            isActive={phase === "ai-turn"}
            isProcessing={
              state.isProcessing &&
              (phase === "processing" || phase === "factcheck-display")
            }
          />
        </div>

        {/* Action bar */}
        <div className="mt-4 flex justify-center gap-3">
          {phase === "ai-turn" && !state.isProcessing && (
            <button
              onClick={advanceRound}
              className="px-6 py-2 bg-gold-400 text-navy-950 font-bold rounded-lg hover:bg-gold-500 transition-colors animate-pulse-glow"
            >
              {currentRound >= config.roundCount
                ? "협력 선언"
                : "다음 라운드"}
            </button>
          )}
          {phase === "cooperation" && !state.isProcessing && (
            <button
              onClick={advanceToClosing}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold rounded-lg hover:from-emerald-500 hover:to-amber-500 transition-colors"
            >
              토론 마무리
            </button>
          )}
          {phase === "closing" && !state.isProcessing && (
            <button
              onClick={resetDebate}
              className="px-6 py-2 bg-navy-700 text-slate-300 font-medium rounded-lg hover:bg-navy-600 transition-colors"
            >
              새 토론 시작
            </button>
          )}
        </div>
      </div>

      {/* Fact Check Overlay */}
      <FactCheckOverlay checks={factChecks} visible={showFactCheck} />

      {/* Transcript */}
      <TranscriptPanel messages={messages} />
    </div>
  );
}
