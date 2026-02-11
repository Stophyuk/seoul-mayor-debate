// Debate state machine phases
export type DebatePhase =
  | "setup"
  | "intro"
  | "human-turn"
  | "processing"
  | "factcheck-display"
  | "ai-turn"
  | "transition"
  | "closing";

// AI opponent persona types
export type PersonaType = "aggressive" | "data-driven" | "emotional";

export interface Persona {
  id: PersonaType;
  name: string;
  title: string;
  description: string;
  color: string;
}

// Debate topic
export interface Topic {
  id: string;
  title: string;
  description: string;
  dataKeys: string[]; // keys referencing seoul data files
}

// Debate configuration from setup screen
export interface DebateConfig {
  candidateName: string;
  candidateParty: string;
  persona: PersonaType;
  topics: string[]; // topic IDs
  roundCount: number;
  turnDuration: number; // seconds
  ttsEnabled: boolean;
}

// Single message in transcript
export interface DebateMessage {
  id: string;
  role: "moderator" | "candidate" | "opponent";
  speaker: string;
  content: string;
  timestamp: number;
  audioUrl?: string;
}

// Fact-check result
export interface FactCheckResult {
  claim: string;
  verdict: "true" | "mostly-true" | "half-true" | "misleading" | "false" | "unverifiable";
  explanation: string;
  source?: string;
}

// Current debate state
export interface DebateState {
  phase: DebatePhase;
  config: DebateConfig;
  currentRound: number;
  currentTopic: string;
  messages: DebateMessage[];
  factChecks: FactCheckResult[];
  isProcessing: boolean;
  timeRemaining: number;
}

// API request/response types
export interface DebateRequest {
  messages: DebateMessage[];
  persona: PersonaType;
  topic: string;
  candidateName: string;
  round: number;
}

export interface ModerateRequest {
  messages: DebateMessage[];
  phase: DebatePhase;
  topic: string;
  round: number;
  totalRounds: number;
  candidateName: string;
  opponentName: string;
}

export interface FactCheckRequest {
  statement: string;
  speaker: string;
  topic: string;
}

export interface TTSRequest {
  text: string;
  voiceType: "moderator" | "opponent";
}

// Seoul data types
export interface BudgetItem {
  category: string;
  amount: number;
  year: number;
  unit: string;
  change?: number;
}

export interface TransportationData {
  metric: string;
  value: number | string;
  year: number;
  source: string;
}

export interface PopulationData {
  district: string;
  population: number;
  year: number;
  change?: number;
}

export interface HousingData {
  metric: string;
  value: number | string;
  year: number;
  source: string;
}

export interface SafetyData {
  metric: string;
  value: number | string;
  year: number;
  source: string;
}

export interface EnvironmentData {
  metric: string;
  value: number | string;
  year: number;
  source: string;
}
