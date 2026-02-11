"use client";

import { PersonaType } from "@/types/debate";
import { PERSONAS } from "@/lib/prompts";

interface PersonaSelectorProps {
  selected: PersonaType;
  onChange: (persona: PersonaType) => void;
}

const personaKeys: PersonaType[] = ["aggressive", "data-driven", "emotional"];

export default function PersonaSelector({
  selected,
  onChange,
}: PersonaSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-slate-400">
        AI 상대 후보 선택
      </label>
      <div className="grid grid-cols-3 gap-2">
        {personaKeys.map((key) => {
          const persona = PERSONAS[key];
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-red-500 bg-red-500/10"
                  : "border-navy-700 bg-navy-800 hover:border-slate-500"
              }`}
            >
              <div
                className="font-bold text-sm"
                style={{ color: isSelected ? persona.color : "#94a3b8" }}
              >
                {persona.name}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {persona.title}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {persona.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
