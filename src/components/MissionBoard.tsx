import { useState } from "react";
import { missions } from "../data/missions";
import { CopyButton } from "./CopyButton";
import { Target, CheckSquare, Wrench, FileText, Star, ChevronRight } from "lucide-react";

const toolColors: Record<string, string> = {
  GPT:       "bg-emerald-100 text-emerald-700 border-emerald-200",
  Gamma:     "bg-violet-100 text-violet-700 border-violet-200",
  Napkin:    "bg-orange-100 text-orange-700 border-orange-200",
  Felo:      "bg-blue-100 text-blue-700 border-blue-200",
  Genspark:  "bg-pink-100 text-pink-700 border-pink-200",
  Geminiami: "bg-indigo-100 text-indigo-700 border-indigo-200",
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* 왼쪽: 주차 목록 */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">주차 선택</p>
          </div>
          <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
            {missions.map((m) => (
              <button
                key={m.week}
                onClick={() => setSelectedWeek(m.week)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left ${
                  selectedWeek === m.week ? "bg-blue-50 border-r-2 border-r-blue-600" : ""
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedWeek === m.week ? "bg-[#0f2554] text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {m.week}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${selectedWeek === m.week ? "text-blue-800" : "text-slate-700"}`}>
                    {m.title}
                  </p>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {m.tools.slice(0, 2).map((t) => (
                      <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${toolColors[t]}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedWeek === m.week && (
                  <ChevronRight size={12} className="text-blue-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 오른쪽: 미션 상세 */}
        <div className="lg:col-span-3">
          {mission ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {/* 미션 헤더 */}
              <div className="bg-gradient-to-r from-[#0a1a3e] to-[#1e3a8a] px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-sky-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {mission.week}주차
                      </span>
                      {mission.tools.map((t) => (
                        <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${toolColors[t]}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-white text-xl font-bold">{mission.title}</h3>
                  </div>
                  <CopyButton text={missionText} label="미션 복사" />
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* 미션 목표 */}
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-sky-700">
                    <Target size={15} />
                    <span className="text-sm font-bold">미션 목표</span>
                  </div>
                  <p className="text-sm text-sky-800 leading-relaxed">{mission.goal}</p>
                </div>

                {/* 수행 절차 */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-slate-700">
                    <CheckSquare size={15} />
                    <span className="text-sm font-bold">수행 절차</span>
                  </div>
                  <div className="space-y-2.5">
                    {mission.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#0f2554] text-white text-xs font-bold rounded-lg flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 도구 / 제출물 / 평가 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2 text-slate-700">
                      <Wrench size={13} />
                      <span className="text-xs font-bold">사용 AI 도구</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {mission.tools.map((t) => (
                        <span key={t} className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${toolColors[t]}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2 text-slate-700">
                      <FileText size={13} />
                      <span className="text-xs font-bold">제출물</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{mission.deliverable}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2 text-slate-700">
                      <Star size={13} />
                      <span className="text-xs font-bold">평가 기준</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{mission.criteria}</p>
                  </div>
                </div>

                {/* 추천 프롬프트 */}
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>🤖</span>
                      <span className="text-sm font-bold text-violet-800">추천 프롬프트</span>
                    </div>
                    <CopyButton text={mission.recommendedPrompt} />
                  </div>
                  <p className="text-sm text-violet-700 leading-relaxed pl-6">
                    "{mission.recommendedPrompt}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <p className="text-slate-400">왼쪽에서 주차를 선택하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
