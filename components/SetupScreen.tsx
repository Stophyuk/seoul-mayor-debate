"use client";

import { useState } from "react";
import { DebateConfig, PersonaType } from "@/types/debate";
import TopicSelector from "./TopicSelector";
import PersonaSelector from "./PersonaSelector";

interface SetupScreenProps {
  onStart: (config: DebateConfig) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [persona, setPersona] = useState<PersonaType>("aggressive");
  const [topics, setTopics] = useState<string[]>(["housing"]);
  const [roundCount, setRoundCount] = useState(3);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const canStart = candidateName.trim().length > 0 && topics.length > 0;

  const handleStart = () => {
    if (!canStart) return;
    onStart({
      candidateName: candidateName.trim(),
      candidateParty: candidateParty.trim(),
      persona,
      topics,
      roundCount,
      turnDuration: 120,
      ttsEnabled,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-400">Virtual</span>{" "}
            <span className="text-red-400">Debate</span>
          </h1>
          <p className="text-gold-400 font-medium">SEOUL</p>
          <p className="text-sm text-slate-500">
            서울시장 후보 가상 토론 시뮬레이션
          </p>
        </div>

        {/* Form */}
        <div className="bg-navy-900 border border-navy-700 rounded-xl p-6 space-y-5">
          {/* Candidate info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                후보 이름 *
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                소속 정당
              </label>
              <input
                type="text"
                value={candidateParty}
                onChange={(e) => setCandidateParty(e.target.value)}
                placeholder="무소속"
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Persona */}
          <PersonaSelector selected={persona} onChange={setPersona} />

          {/* Topics */}
          <TopicSelector
            selected={topics}
            onChange={setTopics}
            max={roundCount}
          />

          {/* Options */}
          <div className="flex items-center gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                라운드 수
              </label>
              <select
                value={roundCount}
                onChange={(e) => setRoundCount(Number(e.target.value))}
                className="px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value={2}>2라운드</option>
                <option value={3}>3라운드</option>
                <option value={4}>4라운드</option>
                <option value={5}>5라운드</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                id="tts"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
                className="w-4 h-4 accent-gold-400"
              />
              <label htmlFor="tts" className="text-sm text-slate-400">
                음성 합성 (TTS)
              </label>
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold rounded-lg hover:from-blue-500 hover:to-red-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            토론 시작
          </button>
        </div>

        <p className="text-center text-xs text-slate-600">
          AI 상대 후보와의 가상 토론입니다. 실제 정치적 견해와 무관합니다.
        </p>
      </div>
    </div>
  );
}
