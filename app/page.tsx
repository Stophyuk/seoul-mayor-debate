"use client";

import { useDebate } from "@/hooks/useDebate";
import SetupScreen from "@/components/SetupScreen";
import DebateStage from "@/components/DebateStage";

export default function Home() {
  const debate = useDebate();

  if (debate.state.phase === "setup") {
    return <SetupScreen onStart={debate.startDebate} />;
  }

  return <DebateStage debate={debate} />;
}
