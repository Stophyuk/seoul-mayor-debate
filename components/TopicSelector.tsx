"use client";

import topicsData from "@/data/topics.json";

interface TopicSelectorProps {
  selected: string[];
  onChange: (topics: string[]) => void;
  max: number;
}

export default function TopicSelector({
  selected,
  onChange,
  max,
}: TopicSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      // Prevent deselecting the last topic
      if (selected.length <= 1) return;
      onChange(selected.filter((t) => t !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-base text-slate-400">
        토론 주제 선택 (최대 {max}개)
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {topicsData.topics.map((topic) => {
          const isSelected = selected.includes(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => toggle(topic.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? "border-gold-400 bg-gold-400/10 text-gold-400"
                  : "border-navy-700 bg-navy-800 text-slate-300 hover:border-slate-500"
              }`}
            >
              <div className="flex items-center gap-2">
                {isSelected && (
                  <span className="text-gold-400 text-sm">&#10003;</span>
                )}
                <span className="font-medium text-sm">{topic.title}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {topic.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
