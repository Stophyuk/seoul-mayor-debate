import { PersonaType } from "@/types/debate";
import { getAggressivePrompt } from "./aggressive";
import { getDataDrivenPrompt } from "./data-driven";
import { getEmotionalPrompt } from "./emotional";

export { getModeratorPrompt, getIntroPrompt, getTransitionPrompt } from "./moderator";
export { getFactCheckerPrompt } from "./factchecker";

export function getPersonaPrompt(persona: PersonaType, candidateName: string): string {
  switch (persona) {
    case "aggressive":
      return getAggressivePrompt(candidateName);
    case "data-driven":
      return getDataDrivenPrompt(candidateName);
    case "emotional":
      return getEmotionalPrompt(candidateName);
  }
}

export function getPersonaName(persona: PersonaType): string {
  switch (persona) {
    case "aggressive":
      return "이도전";
    case "data-driven":
      return "박통계";
    case "emotional":
      return "최시민";
  }
}

export const PERSONAS: Record<PersonaType, { name: string; title: string; description: string; color: string }> = {
  aggressive: {
    name: "이도전",
    title: "공격형 후보",
    description: "과거 발언 모순을 공격하는 날카로운 토론가",
    color: "#EF4444",
  },
  "data-driven": {
    name: "박통계",
    title: "데이터형 후보",
    description: "서울시 통계 기반으로 실현가능성을 검증하는 학자형",
    color: "#3B82F6",
  },
  emotional: {
    name: "최시민",
    title: "감성형 후보",
    description: "시민 입장에서 감정적으로 호소하는 풀뿌리 정치인",
    color: "#F59E0B",
  },
};
