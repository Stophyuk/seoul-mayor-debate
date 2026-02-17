"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  DebateState,
  DebateConfig,
  DebateMessage,
  FactCheckResult,
  DebatePhase,
} from "@/types/debate";
import { getNextPhase, generateMessageId } from "@/lib/debate-engine";
import { HONGBOT_NAME } from "@/lib/prompts";
import { getRandomBridgePhrase } from "@/lib/bridge-phrases";
import topicsData from "@/data/topics.json";

const INITIAL_STATE: DebateState = {
  phase: "landing",
  config: {
    candidateName: "홍근",
    topics: [],
    roundCount: 3,
    turnDuration: 120,
  },
  currentRound: 1,
  currentTopic: "",
  messages: [],
  factChecks: [],
  isProcessing: false,
  timeRemaining: 120,
  bridgeText: null,
};

export function useDebate() {
  const [state, setState] = useState<DebateState>(INITIAL_STATE);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const opponentName = HONGBOT_NAME;

  // Timer management
  const startTimer = useCallback(
    (duration?: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const d = duration ?? state.config.turnDuration;
      setState((s) => ({ ...s, timeRemaining: d }));
      timerRef.current = setInterval(() => {
        setState((s) => {
          if (s.timeRemaining <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return { ...s, timeRemaining: 0 };
          }
          return { ...s, timeRemaining: s.timeRemaining - 1 };
        });
      }, 1000);
    },
    [state.config.turnDuration]
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Add a message to the transcript
  const addMessage = useCallback(
    (
      role: DebateMessage["role"],
      speaker: string,
      content: string
    ): DebateMessage => {
      const msg: DebateMessage = {
        id: generateMessageId(),
        role,
        speaker,
        content,
        timestamp: Date.now(),
      };
      setState((s) => ({ ...s, messages: [...s.messages, msg] }));
      return msg;
    },
    []
  );

  // Set phase
  const setPhase = useCallback((phase: DebatePhase) => {
    setState((s) => ({ ...s, phase }));
  }, []);

  // Go to setup screen from landing
  const goToSetup = useCallback(() => {
    setState((s) => ({ ...s, phase: "setup" }));
  }, []);

  // Start debate
  const startDebate = useCallback(
    async (config: DebateConfig) => {
      const firstTopic = config.topics[0] ?? "housing";
      setState({
        ...INITIAL_STATE,
        config,
        phase: "intro",
        currentTopic: firstTopic,
        isProcessing: true,
      });

      try {
        const topicTitle =
          topicsData.topics.find((t) => t.id === firstTopic)?.title ??
          firstTopic;

        const res = await fetch("/api/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [],
            phase: "intro",
            topic: topicTitle,
            round: 1,
            totalRounds: config.roundCount,
            candidateName: config.candidateName,
            opponentName: HONGBOT_NAME,
          }),
        });

        const data = await res.json();
        const msg: DebateMessage = {
          id: generateMessageId(),
          role: "moderator",
          speaker: "김진행",
          content: data.response,
          timestamp: Date.now(),
        };

        setState((s) => ({
          ...s,
          messages: [msg],
          isProcessing: false,
          phase: "human-turn",
          timeRemaining: config.turnDuration,
        }));
        startTimer(config.turnDuration);
      } catch {
        setState((s) => ({
          ...s,
          isProcessing: false,
          phase: "human-turn",
        }));
        startTimer(config.turnDuration);
      }
    },
    [startTimer]
  );

  // Submit human candidate's speech
  const submitSpeech = useCallback(
    async (text: string) => {
      stopTimer();
      addMessage("candidate", state.config.candidateName, text);

      const topicTitle =
        topicsData.topics.find((t) => t.id === state.currentTopic)?.title ??
        state.currentTopic;

      // Generate bridge phrase and set state immediately
      const bridgePhrase = getRandomBridgePhrase({
        candidateName: state.config.candidateName,
        topic: topicTitle,
        round: state.currentRound,
      });

      setState((s) => ({
        ...s,
        phase: "processing",
        isProcessing: true,
        bridgeText: bridgePhrase,
      }));

      // Fire-and-forget: bridge TTS (independent of main flow)
      fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: bridgePhrase, voiceType: "moderator" }),
      })
        .then((r) => r.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.onended = () => URL.revokeObjectURL(url);
          audio.onerror = () => URL.revokeObjectURL(url);
          audio.play();
        })
        .catch(() => {}); // Graceful degradation: text fallback

      // Parallel: factcheck + debate response
      const [factCheckRes, debateRes] = await Promise.allSettled([
        fetch("/api/factcheck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            statement: text,
            speaker: state.config.candidateName,
            topic: state.currentTopic,
          }),
        }).then((r) => r.json()),
        fetch("/api/debate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...state.messages,
              {
                id: "temp",
                role: "candidate",
                speaker: state.config.candidateName,
                content: text,
                timestamp: Date.now(),
              },
            ],
            topic: state.currentTopic,
            candidateName: state.config.candidateName,
            round: state.currentRound,
          }),
        }).then((r) => r.json()),
      ]);

      // Clear bridge text now that responses are ready
      setState((s) => ({ ...s, bridgeText: null }));

      // Process factcheck results
      let checks: FactCheckResult[] = [];
      if (factCheckRes.status === "fulfilled" && factCheckRes.value.checks) {
        checks = factCheckRes.value.checks;
      }

      if (checks.length > 0) {
        setState((s) => ({
          ...s,
          factChecks: [...s.factChecks, ...checks],
          phase: "factcheck-display",
          isProcessing: false,
        }));

        // Show factcheck for 3 seconds, then proceed to AI turn
        await new Promise((r) => setTimeout(r, 3000));
      }

      // Process AI response
      if (debateRes.status === "fulfilled" && debateRes.value.response) {
        const aiMsg: DebateMessage = {
          id: generateMessageId(),
          role: "opponent",
          speaker: opponentName,
          content: debateRes.value.response,
          timestamp: Date.now(),
        };

        setState((s) => ({
          ...s,
          messages: [...s.messages, aiMsg],
          phase: "ai-turn",
          isProcessing: false,
        }));
      } else {
        setState((s) => ({
          ...s,
          phase: "ai-turn",
          isProcessing: false,
        }));
      }
    },
    [
      state.messages,
      state.config,
      state.currentTopic,
      state.currentRound,
      opponentName,
      addMessage,
      stopTimer,
    ]
  );

  // Advance to next round, cooperation, or closing
  const advanceRound = useCallback(async () => {
    const nextPhase = getNextPhase(
      "transition",
      state.currentRound,
      state.config.roundCount
    );

    if (nextPhase === "cooperation") {
      // Generate cooperation declaration
      setState((s) => ({ ...s, phase: "cooperation", isProcessing: true }));
      try {
        const res = await fetch("/api/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: state.messages.slice(-4),
            phase: "cooperation",
            topic: state.currentTopic,
            round: state.currentRound,
            totalRounds: state.config.roundCount,
            candidateName: state.config.candidateName,
            opponentName,
          }),
        });
        const data = await res.json();
        addMessage("moderator", "김진행", data.response);
      } catch {
        // non-critical
      }
      setState((s) => ({ ...s, isProcessing: false }));
      return;
    }

    // Next round
    const nextRound = state.currentRound + 1;
    const topicIdx = Math.min(nextRound - 1, state.config.topics.length - 1);
    const nextTopic = state.config.topics[topicIdx] ?? state.currentTopic;
    const nextTopicTitle =
      topicsData.topics.find((t) => t.id === nextTopic)?.title ?? nextTopic;

    setState((s) => ({
      ...s,
      currentRound: nextRound,
      currentTopic: nextTopic,
      phase: "transition",
      isProcessing: true,
    }));

    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: state.messages.slice(-4),
          phase: "transition",
          topic: nextTopicTitle,
          round: nextRound,
          totalRounds: state.config.roundCount,
          candidateName: state.config.candidateName,
          opponentName,
        }),
      });
      const data = await res.json();
      addMessage("moderator", "김진행", data.response);
    } catch {
      // non-critical
    }

    setState((s) => ({
      ...s,
      isProcessing: false,
      phase: "human-turn",
      timeRemaining: state.config.turnDuration,
    }));
    startTimer();
  }, [
    state.currentRound,
    state.config,
    state.currentTopic,
    state.messages,
    opponentName,
    addMessage,
    startTimer,
  ]);

  // Advance from cooperation to closing
  const advanceToClosing = useCallback(async () => {
    setState((s) => ({ ...s, phase: "closing", isProcessing: true }));
    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: state.messages.slice(-4),
          phase: "closing",
          topic: state.currentTopic,
          round: state.currentRound,
          totalRounds: state.config.roundCount,
          candidateName: state.config.candidateName,
          opponentName,
        }),
      });
      const data = await res.json();
      addMessage("moderator", "김진행", data.response);
    } catch {
      // non-critical
    }
    setState((s) => ({ ...s, isProcessing: false }));
  }, [
    state.messages,
    state.config,
    state.currentTopic,
    state.currentRound,
    opponentName,
    addMessage,
  ]);

  // Reset everything
  const resetDebate = useCallback(() => {
    stopTimer();
    setState(INITIAL_STATE);
  }, [stopTimer]);

  return {
    state,
    opponentName,
    goToSetup,
    startDebate,
    submitSpeech,
    advanceRound,
    advanceToClosing,
    resetDebate,
    setPhase,
    stopTimer,
  };
}
