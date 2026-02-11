import { DebatePhase } from "@/types/debate";

// State machine transitions
const transitions: Record<DebatePhase, DebatePhase | null> = {
  setup: "intro",
  intro: "human-turn",
  "human-turn": "processing",
  processing: "factcheck-display",
  "factcheck-display": "ai-turn",
  "ai-turn": "transition",
  transition: "human-turn", // or "closing" if last round
  closing: null,
};

export function getNextPhase(
  current: DebatePhase,
  currentRound: number,
  totalRounds: number
): DebatePhase {
  if (current === "transition" && currentRound >= totalRounds) {
    return "closing";
  }
  return transitions[current] ?? "closing";
}

export function shouldAutoAdvance(phase: DebatePhase): boolean {
  return phase === "processing" || phase === "intro";
}

export function getPhaseLabel(phase: DebatePhase): string {
  const labels: Record<DebatePhase, string> = {
    setup: "토론 준비",
    intro: "토론 시작",
    "human-turn": "후보 발언",
    processing: "응답 생성 중",
    "factcheck-display": "팩트체크",
    "ai-turn": "상대 후보 발언",
    transition: "다음 라운드 준비",
    closing: "토론 종료",
  };
  return labels[phase];
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
