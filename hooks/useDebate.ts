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
  error: null,
};

export function useDebate() {
  const [state, setState] = useState<DebateState>(INITIAL_STATE);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const opponentName = HONGBOT_NAME;

  // Timer kept for internal compatibility but no longer started
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // Error management
  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

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

  // Track last action for retry
  const lastActionRef = useRef<(() => Promise<void>) | null>(null);

  const retryLastAction = useCallback(() => {
    clearError();
    if (lastActionRef.current) {
      lastActionRef.current();
    }
  }, [clearError]);

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
        error: null,
      });

      const action = async () => {
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

          if (!res.ok) throw new Error(`서버 오류 (${res.status})`);

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
          }));
        } catch (err) {
          setState((s) => ({
            ...s,
            isProcessing: false,
            phase: "human-turn",
            error: err instanceof Error ? err.message : "토론 시작 중 오류가 발생했습니다",
          }));
        }
      };

      lastActionRef.current = action;
      await action();
    },
    []
  );

  // Submit human candidate's speech
  const submitSpeech = useCallback(
    async (text: string) => {
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
        error: null,
      }));

      const action = async () => {
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

        try {
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
            }).then((r) => {
              if (!r.ok) throw new Error(`팩트체크 오류 (${r.status})`);
              return r.json();
            }),
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
            }).then((r) => {
              if (!r.ok) throw new Error(`AI 응답 오류 (${r.status})`);
              return r.json();
            }),
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
          } else if (debateRes.status === "rejected") {
            setState((s) => ({
              ...s,
              phase: "ai-turn",
              isProcessing: false,
              error: "AI 응답을 가져오지 못했습니다. 재시도해 주세요.",
            }));
          } else {
            setState((s) => ({
              ...s,
              phase: "ai-turn",
              isProcessing: false,
            }));
          }
        } catch (err) {
          setState((s) => ({
            ...s,
            bridgeText: null,
            phase: "ai-turn",
            isProcessing: false,
            error: err instanceof Error ? err.message : "응답 처리 중 오류가 발생했습니다",
          }));
        }
      };

      lastActionRef.current = action;
      await action();
    },
    [
      state.messages,
      state.config,
      state.currentTopic,
      state.currentRound,
      opponentName,
      addMessage,
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
      setState((s) => ({ ...s, phase: "cooperation", isProcessing: true, error: null }));
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
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
        const data = await res.json();
        addMessage("moderator", "김진행", data.response);
      } catch (err) {
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : "협력 단계 전환 중 오류가 발생했습니다",
        }));
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
      error: null,
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
      if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
      const data = await res.json();
      addMessage("moderator", "김진행", data.response);
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "라운드 전환 중 오류가 발생했습니다",
      }));
    }

    setState((s) => ({
      ...s,
      isProcessing: false,
      phase: "human-turn",
    }));
  }, [
    state.currentRound,
    state.config,
    state.currentTopic,
    state.messages,
    opponentName,
    addMessage,
  ]);

  // Advance from cooperation to closing
  const advanceToClosing = useCallback(async () => {
    setState((s) => ({ ...s, phase: "closing", isProcessing: true, error: null }));
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
      if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
      const data = await res.json();
      addMessage("moderator", "김진행", data.response);
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "마무리 단계 전환 중 오류가 발생했습니다",
      }));
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
    clearError,
    retryLastAction,
  };
}
