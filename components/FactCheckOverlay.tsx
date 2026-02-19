"use client";

import { FactCheckResult } from "@/types/debate";

interface FactCheckOverlayProps {
  checks: FactCheckResult[];
  visible: boolean;
}

const verdictConfig: Record<
  FactCheckResult["verdict"],
  { label: string; color: string; bg: string }
> = {
  true: { label: "사실", color: "text-green-400", bg: "bg-green-400/10" },
  "mostly-true": {
    label: "대체로 사실",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  "half-true": {
    label: "절반의 사실",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  misleading: {
    label: "오해의 소지",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  false: { label: "거짓", color: "text-red-400", bg: "bg-red-400/10" },
  unverifiable: {
    label: "확인불가",
    color: "text-slate-400",
    bg: "bg-slate-400/10",
  },
};

export default function FactCheckOverlay({
  checks,
  visible,
}: FactCheckOverlayProps) {
  if (!visible || checks.length === 0) return null;

  // Show last batch of checks
  const recentChecks = checks.slice(-2);

  return (
    <div className="animate-slide-up border-t border-navy-700 bg-navy-900/95 px-6 py-3">
      <div className="max-w-5xl mx-auto space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <span className="font-bold text-red-400 text-sm">LIVE</span>
          <span className="font-bold text-gold-400">FACT CHECK</span>
          <span>실시간 팩트체크</span>
        </div>
        {recentChecks.map((check, i) => {
          const config = verdictConfig[check.verdict];
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg ${config.bg}`}
            >
              <span
                className={`${config.color} font-bold text-sm whitespace-nowrap mt-0.5 min-w-[5rem] text-center px-2 py-0.5 rounded ${config.bg}`}
              >
                [{config.label}]
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-base text-slate-200">
                  &ldquo;{check.claim}&rdquo;
                </p>
                <p className="text-sm text-slate-400 mt-0.5">
                  {check.explanation}
                  {check.source && (
                    <span className="text-slate-600">
                      {" "}
                      (출처: {check.source})
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
