import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  Wrench,
  ClipboardList,
  LayoutGrid,
  TableProperties,
  Target,
  Star,
} from "lucide-react";
import { weeklyPlan } from "../data/weeklyPlan";
import { CopyButton } from "./CopyButton";

type ViewMode = "card" | "table";

const toolColors: Record<string, string> = {
  GPT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Gamma: "bg-violet-100 text-violet-700 border-violet-200",
  Napkin: "bg-orange-100 text-orange-700 border-orange-200",
  Felo: "bg-blue-100 text-blue-700 border-blue-200",
  Genspark: "bg-pink-100 text-pink-700 border-pink-200",
  Geminiami: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export function WeeklyPlan() {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [filterTool, setFilterTool] = useState<string>("전체");

  const allTools = ["전체", "GPT", "Gamma", "Napkin", "Felo", "Genspark", "Geminiami"];

  const filtered = weeklyPlan.filter((w) => {
    const matchSearch =
      !search ||
      w.topic.includes(search) ||
      w.concepts.some((c) => c.includes(search)) ||
      w.tools.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      w.objective.includes(search);
    const matchTool = filterTool === "전체" || w.tools.includes(filterTool);
    return matchSearch && matchTool;
  });

  const toggleWeek = (week: number) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  const expandAll = () => setOpenWeeks(new Set(filtered.map((w) => w.week)));
  const collapseAll = () => setOpenWeeks(new Set());

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">16주차 수업설계</h2>
          <p className="text-sm text-slate-500 mt-0.5">주차를 클릭하면 전체 상세 내용과 Gamma 프롬프트가 펼쳐집니다.</p>
        </div>
      </div>

      {/* 검색 & 필터 & 뷰 전환 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="주제, 핵심 개념, AI 도구 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* 뷰 모드 토글 */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 flex-shrink-0">
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "card" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid size={13} />
              카드형
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === "table" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <TableProperties size={13} />
              표형
            </button>
          </div>
        </div>

        {/* AI 도구 필터 + 전체 펼침/접기 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">AI 도구 필터:</span>
          {allTools.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTool(t)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-all ${
                filterTool === t
                  ? "bg-[#0f2554] text-white border-[#0f2554]"
                  : t === "전체"
                  ? "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-400"
                  : `${toolColors[t]} border hover:opacity-80`
              }`}
            >
              {t}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button onClick={expandAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              전체 펼치기
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={collapseAll} className="text-xs text-slate-500 hover:text-slate-700 font-medium">
              전체 접기
            </button>
          </div>
        </div>
      </div>

      {/* ── 카드형 뷰 ── */}
      {viewMode === "card" && (
        <div className="space-y-2">
          {filtered.map((week) => {
            const isOpen = openWeeks.has(week.week);
            return (
              <div
                key={week.week}
                className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                  isOpen ? "border-blue-300 shadow-md" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* 헤더 행 */}
                <button
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/80 transition-colors text-left"
                  onClick={() => toggleWeek(week.week)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                    isOpen ? "bg-blue-600 text-white" : "bg-[#0f2554] text-white"
                  }`}>
                    {week.week}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800">{week.topic}</span>
                      <div className="flex flex-wrap gap-1">
                        {week.tools.map((t) => (
                          <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium border ${toolColors[t] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{week.objective}</p>
                  </div>
                  <span className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDown size={16} />
                  </span>
                </button>

                {/* 상세 내용 */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white px-5 py-5 space-y-4">
                    {/* 2열 그리드: 핵심 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* 학습목표 */}
                      <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2.5 text-blue-700">
                          <BookOpen size={14} />
                          <span className="text-xs font-bold uppercase tracking-wide">학습목표</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{week.objective}</p>
                      </div>

                      {/* 핵심 개념 */}
                      <div className="bg-white rounded-xl p-4 border border-violet-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2.5 text-violet-700">
                          <Lightbulb size={14} />
                          <span className="text-xs font-bold uppercase tracking-wide">핵심 개념</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {week.concepts.map((c) => (
                            <span key={c} className="bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-lg border border-violet-200 font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 실습 활동 */}
                      <div className="bg-white rounded-xl p-4 border border-teal-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2.5 text-teal-700">
                          <Wrench size={14} />
                          <span className="text-xs font-bold uppercase tracking-wide">실습 활동</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{week.activity}</p>
                      </div>

                      {/* 과제 & 평가 */}
                      <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2.5 text-orange-700">
                          <ClipboardList size={14} />
                          <span className="text-xs font-bold uppercase tracking-wide">과제 & 평가방법</span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium">{week.assignment}</p>
                        <div className="mt-1.5 flex items-start gap-1.5">
                          <Star size={11} className="text-orange-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-orange-700">{week.evaluation}</p>
                        </div>
                      </div>
                    </div>

                    {/* 사용 AI 도구 */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2.5 text-slate-700">
                        <Target size={14} />
                        <span className="text-xs font-bold uppercase tracking-wide">활용 AI 도구</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {week.tools.map((t) => {
                          const descriptions: Record<string, string> = {
                            GPT: "개념 설명·과제 초안",
                            Gamma: "발표자료 생성",
                            Napkin: "구조 시각화",
                            Felo: "고객 시뮬레이션",
                            Genspark: "인터뷰·시나리오",
                            Geminiami: "퀴즈·평가 문항",
                          };
                          return (
                            <div key={t} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${toolColors[t]}`}>
                              <span>{t}</span>
                              <span className="text-current/60 font-normal">{descriptions[t]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 학생 실습 미션 */}
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">🎯</span>
                        <span className="text-sm font-bold text-sky-800">{week.week}주차 실습 미션</span>
                      </div>
                      <p className="text-sm text-sky-700 pl-6">{week.missionSummary}</p>
                    </div>

                    {/* Gamma 발표자료 프롬프트 */}
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🎨</span>
                          <span className="text-sm font-bold text-violet-800">Gamma 발표자료 프롬프트</span>
                        </div>
                        <CopyButton text={week.gammaPrompt} />
                      </div>
                      <p className="text-sm text-violet-700 leading-relaxed pl-6">{week.gammaPrompt}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <p className="text-slate-400 text-sm">검색 조건에 맞는 주차가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* ── 표형 뷰 ── */}
      {viewMode === "table" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">16주차 수업계획 요약표</h3>
            <CopyButton
              text={weeklyPlan
                .map(
                  (w) =>
                    `${w.week}주차 | ${w.topic} | ${w.objective} | ${w.concepts.join(", ")} | ${w.tools.join(", ")} | ${w.assignment} | ${w.evaluation}`
                )
                .join("\n")}
              label="전체 복사"
              size="md"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f2554] text-white">
                  {["주차", "수업주제", "학습목표", "핵심개념", "AI 도구", "과제", "평가방법"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-xs whitespace-nowrap opacity-90">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((week, i) => (
                  <tr
                    key={week.week}
                    className={`border-b border-slate-100 hover:bg-blue-50/50 transition-colors cursor-pointer ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    }`}
                    onClick={() => {
                      setViewMode("card");
                      setTimeout(() => {
                        setOpenWeeks((prev) => new Set([...prev, week.week]));
                      }, 100);
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-[#0f2554] text-white text-xs font-bold rounded-lg">
                        {week.week}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{week.topic}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-48">
                      <p className="line-clamp-2">{week.objective}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {week.concepts.slice(0, 3).map((c) => (
                          <span key={c} className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded border border-violet-100">
                            {c}
                          </span>
                        ))}
                        {week.concepts.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{week.concepts.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {week.tools.map((t) => (
                          <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${toolColors[t]}`}>
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
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            행을 클릭하면 카드형 상세 보기로 이동합니다.
          </div>
        </div>
      )}

      {/* 전체 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "총 주차", value: "16주", color: "text-blue-700 bg-blue-50 border-blue-100" },
          { label: "핵심 개념", value: "50+개", color: "text-violet-700 bg-violet-50 border-violet-100" },
          { label: "Gamma 프롬프트", value: "16개", color: "text-purple-700 bg-purple-50 border-purple-100" },
          { label: "AI 도구 활용", value: "6종", color: "text-teal-700 bg-teal-50 border-teal-100" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-3 border text-center ${s.color}`}>
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
