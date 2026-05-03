import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Lightbulb, Wrench, ClipboardList } from "lucide-react";
import { weeklyPlan } from "../data/weeklyPlan";
import { CopyButton } from "./CopyButton";

const toolColors: Record<string, string> = {
  GPT: "bg-emerald-100 text-emerald-700",
  Gamma: "bg-purple-100 text-purple-700",
  Napkin: "bg-orange-100 text-orange-700",
  Felo: "bg-blue-100 text-blue-700",
  Genspark: "bg-pink-100 text-pink-700",
  Geminiami: "bg-indigo-100 text-indigo-700",
};

export function WeeklyPlan() {
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = weeklyPlan.filter(
    (w) =>
      w.topic.includes(search) ||
      w.concepts.some((c) => c.includes(search)) ||
      w.tools.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">16주차 수업설계</h2>
          <p className="text-sm text-slate-500">주차를 클릭하면 상세 내용과 Gamma 프롬프트가 표시됩니다.</p>
        </div>
        <div className="sm:ml-auto">
          <input
            type="text"
            placeholder="주제, 개념, AI 도구 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((week) => (
          <div key={week.week} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* 주차 헤더 */}
            <button
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
              onClick={() => setOpenWeek(openWeek === week.week ? null : week.week)}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0f2554] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {week.week}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800">{week.topic}</span>
                  <div className="flex flex-wrap gap-1">
                    {week.tools.map((t) => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${toolColors[t] || "bg-gray-100 text-gray-600"}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{week.objective}</p>
              </div>
              <span className="text-slate-400 flex-shrink-0">
                {openWeek === week.week ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>

            {/* 상세 내용 */}
            {openWeek === week.week && (
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 space-y-5">
                {/* 핵심 정보 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2 text-blue-700">
                      <BookOpen size={15} />
                      <span className="text-sm font-semibold">학습목표</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{week.objective}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2 text-purple-700">
                      <Lightbulb size={15} />
                      <span className="text-sm font-semibold">핵심 개념</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {week.concepts.map((c) => (
                        <span key={c} className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full border border-purple-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2 text-emerald-700">
                      <Wrench size={15} />
                      <span className="text-sm font-semibold">실습 활동</span>
                    </div>
                    <p className="text-sm text-slate-700">{week.activity}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2 text-orange-700">
                      <ClipboardList size={15} />
                      <span className="text-sm font-semibold">과제 / 평가</span>
                    </div>
                    <p className="text-sm text-slate-700">{week.assignment}</p>
                    <p className="text-xs text-slate-500 mt-1">평가기준: {week.evaluation}</p>
                  </div>
                </div>

                {/* 학생 실습 미션 */}
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-sky-800 mb-1">
                    🎯 {week.week}주차 실습 미션
                  </p>
                  <p className="text-sm text-sky-700">{week.missionSummary}</p>
                </div>

                {/* Gamma 발표자료 프롬프트 */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-800">🎨 Gamma 발표자료 프롬프트</p>
                    <CopyButton text={week.gammaPrompt} />
                  </div>
                  <p className="text-sm text-purple-700 leading-relaxed">{week.gammaPrompt}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 전체 수업계획 요약 표 */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">16주차 수업계획 요약표</h3>
          <CopyButton
            text={weeklyPlan.map(w =>
              `${w.week}주차 | ${w.topic} | ${w.objective} | ${w.concepts.join(", ")} | ${w.tools.join(", ")} | ${w.assignment}`
            ).join("\n")}
            label="전체 복사"
            size="md"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["주차", "수업주제", "핵심개념", "AI 도구", "과제", "평가방법"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 text-xs whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeklyPlan.map((week, i) => (
                <tr key={week.week} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="px-4 py-3 font-semibold text-blue-700 whitespace-nowrap">{week.week}주</td>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{week.topic}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{week.concepts.slice(0, 3).join(", ")}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {week.tools.map((t) => (
                        <span key={t} className={`text-xs px-1.5 py-0.5 rounded font-medium ${toolColors[t] || "bg-gray-100 text-gray-600"}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{week.assignment}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{week.evaluation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
