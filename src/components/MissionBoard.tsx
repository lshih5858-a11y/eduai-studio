import { useState } from "react";
import { missions } from "../data/missions";
import { CopyButton } from "./CopyButton";
import { Target, CheckSquare, Wrench, FileText, Star } from "lucide-react";

const toolColors: Record<string, string> = {
  GPT: "bg-emerald-100 text-emerald-700",
  Gamma: "bg-purple-100 text-purple-700",
  Napkin: "bg-orange-100 text-orange-700",
  Felo: "bg-blue-100 text-blue-700",
  Genspark: "bg-pink-100 text-pink-700",
  Geminiami: "bg-indigo-100 text-indigo-700",
};

export function MissionBoard() {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const mission = missions.find((m) => m.week === selectedWeek);

  const missionText = mission
    ? `[${mission.week}주차 실습 미션] ${mission.title}

미션 목표: ${mission.goal}

수행 절차:
${mission.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

사용 AI 도구: ${mission.tools.join(", ")}
제출물: ${mission.deliverable}
평가 기준: ${mission.criteria}

추천 프롬프트: "${mission.recommendedPrompt}"`
    : "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">주차별 실습 미션</h2>
        <p className="text-sm text-slate-500">주차를 선택하면 해당 주차의 실습 미션 상세 내용이 표시됩니다.</p>
      </div>

      {/* 주차 선택 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 mb-3">주차 선택</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                selectedWeek === w
                  ? "bg-[#0f2554] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* 미션 카드 */}
      {mission && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* 미션 헤더 */}
          <div className="bg-gradient-to-r from-[#0f2554] to-[#1e3a8a] px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-sky-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {mission.week}주차
                  </span>
                  <div className="flex gap-1">
                    {mission.tools.map((t) => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${toolColors[t]}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="text-white text-lg font-bold">{mission.title}</h3>
              </div>
              <CopyButton text={missionText} label="미션 복사" />
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* 미션 목표 */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 text-sky-700">
                <Target size={16} />
                <span className="text-sm font-semibold">미션 목표</span>
              </div>
              <p className="text-sm text-sky-800 leading-relaxed">{mission.goal}</p>
            </div>

            {/* 수행 절차 */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-slate-700">
                <CheckSquare size={16} />
                <span className="text-sm font-semibold">수행 절차</span>
              </div>
              <div className="space-y-2">
                {mission.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-[#0f2554] text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 도구 / 제출물 / 평가 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-slate-700">
                  <Wrench size={14} />
                  <span className="text-xs font-semibold">사용 AI 도구</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mission.tools.map((t) => (
                    <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${toolColors[t]}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-slate-700">
                  <FileText size={14} />
                  <span className="text-xs font-semibold">제출물</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{mission.deliverable}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-slate-700">
                  <Star size={14} />
                  <span className="text-xs font-semibold">평가 기준</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{mission.criteria}</p>
              </div>
            </div>

            {/* 추천 프롬프트 */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-purple-800">🤖 추천 프롬프트</p>
                <CopyButton text={mission.recommendedPrompt} />
              </div>
              <p className="text-sm text-purple-700 leading-relaxed">"{mission.recommendedPrompt}"</p>
            </div>
          </div>
        </div>
      )}

      {/* 전체 미션 목록 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">전체 실습 미션 목록</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {missions.map((m) => (
            <button
              key={m.week}
              onClick={() => setSelectedWeek(m.week)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left ${
                selectedWeek === m.week ? "bg-blue-50" : ""
              }`}
            >
              <span className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                selectedWeek === m.week ? "bg-[#0f2554] text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {m.week}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{m.title}</p>
                <p className="text-xs text-slate-500 truncate">{m.goal}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {m.tools.map((t) => (
                  <span key={t} className={`text-xs px-1.5 py-0.5 rounded font-medium ${toolColors[t]}`}>
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
