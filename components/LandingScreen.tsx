"use client";

import { HONGBOT_INFO, HONGGEUN_INFO } from "@/lib/prompts";

interface LandingScreenProps {
  onStart: () => void;
}

const comparisonItems = [
  { label: "나이", bot: HONGBOT_INFO.age, human: HONGGEUN_INFO.age },
  { label: "경력", bot: HONGBOT_INFO.experience, human: HONGGEUN_INFO.experience },
  { label: "실수", bot: HONGBOT_INFO.mistakes, human: HONGGEUN_INFO.mistakes },
  { label: "공정성", bot: HONGBOT_INFO.fairness, human: HONGGEUN_INFO.fairness },
  { label: "연봉", bot: HONGBOT_INFO.salary, human: HONGGEUN_INFO.salary },
  { label: "근무 시간", bot: HONGBOT_INFO.workHours, human: HONGGEUN_INFO.workHours },
  { label: "강점", bot: HONGBOT_INFO.specialty, human: HONGGEUN_INFO.specialty },
];

export default function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
      {/* Hero section */}
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
        <div className="text-center space-y-3 mb-12">
          <p className="text-sm font-medium text-slate-500 tracking-widest uppercase">
            서울시장 AI 가상 토론
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <span className="text-emerald-600">홍봇</span>
            <span className="text-slate-400 mx-3">vs.</span>
            <span className="text-amber-600">홍근</span>
          </h1>
          <p className="text-slate-500 text-lg">
            AI의 머리와 인간의 심장, 누가 서울을 바꿀 것인가?
          </p>
        </div>

        {/* Profile cards */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {/* Hongbot profile */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-lg">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="p-6 text-center">
              {/* Avatar silhouette */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 via-emerald-200 to-teal-300 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-300 via-teal-400 to-emerald-500 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">AI</span>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-emerald-700">
                {HONGBOT_INFO.name}
              </h2>
              <p className="text-sm text-emerald-600 font-medium mt-1">
                {HONGBOT_INFO.title}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                2026년생 | 0.003초 학습 완료
              </p>
            </div>
          </div>

          {/* Honggeun profile */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-lg">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-yellow-500" />
            <div className="p-6 text-center">
              {/* Avatar silhouette */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-yellow-300 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">人</span>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-amber-700">
                {HONGGEUN_INFO.name}
              </h2>
              <p className="text-sm text-amber-600 font-medium mt-1">
                {HONGGEUN_INFO.title}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                59세 | 4선 의원 20년 경력
              </p>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden mb-10">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-center font-bold text-slate-700">
              프로필 비교
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {comparisonItems.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-3 items-center px-6 py-3"
              >
                <div className="text-sm text-emerald-700 font-medium text-right pr-4">
                  {item.bot}
                </div>
                <div className="text-xs text-slate-400 font-bold text-center uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="text-sm text-amber-700 font-medium text-left pl-4">
                  {item.human}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <button
            onClick={onStart}
            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            토론 시작하기
          </button>
          <p className="text-xs text-slate-400">
            AI 상대 후보와의 가상 토론입니다. 실제 정치적 견해와 무관합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
