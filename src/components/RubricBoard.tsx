import { useState, useEffect } from "react";
import { rubrics } from "../data/rubrics";
import { CopyButton } from "./CopyButton";
import { Save, ChevronDown } from "lucide-react";

const MEMO_KEY = "eduai_rubric_memos";

const levelConfig = {
  excellent: { label: "우수", color: "border-l-4 border-l-emerald-500 bg-emerald-50 text-emerald-800", badge: "bg-emerald-100 text-emerald-700" },
  good:      { label: "양호", color: "border-l-4 border-l-blue-400 bg-blue-50 text-blue-800",     badge: "bg-blue-100 text-blue-700" },
  fair:      { label: "보통", color: "border-l-4 border-l-amber-400 bg-amber-50 text-amber-800",  badge: "bg-amber-100 text-amber-700" },
  poor:      { label: "미흡", color: "border-l-4 border-l-rose-300 bg-rose-50 text-rose-800",     badge: "bg-rose-100 text-rose-700" },
};

export function RubricBoard() {
  const [activeRubric, setActiveRubric] = useState(rubrics[0].id);
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(MEMO_KEY);
    if (saved) {
      try { setMemos(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleSaveMemo = (id: string) => {
    const updated = { ...memos };
    localStorage.setItem(MEMO_KEY, JSON.stringify(updated));
    setSavedStatus((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setSavedStatus((prev) => ({ ...prev, [id]: false })), 2000);
  };

  const rubric = rubrics.find((r) => r.id === activeRubric)!;

  const getRubricText = (r: typeof rubric) =>
    `【${r.title}】\n${r.description}\n\n${r.criteria
      .map(
        (c) =>
          `▶ ${c.name} (${c.points}점)\n  우수: ${c.excellent}\n  양호: ${c.good}\n  보통: ${c.fair}\n  미흡: ${c.poor}`
      )
      .join("\n\n")}\n\n총점: ${r.totalPoints}점`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">평가 루브릭</h2>
        <p className="text-sm text-slate-500">4종의 평가 루브릭을 확인하고 복사하세요. 교수자 메모도 저장 가능합니다.</p>
      </div>

      {/* 루브릭 선택 탭 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rubrics.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRubric(r.id)}
            className={`p-3.5 rounded-xl text-left border transition-all ${
              activeRubric === r.id
                ? "bg-[#0f2554] text-white border-[#0f2554] shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            <p className={`text-xs font-bold mb-1 ${activeRubric === r.id ? "text-white/70" : "text-slate-400"}`}>
              루브릭 {rubrics.indexOf(r) + 1}
            </p>
            <p className={`text-sm font-semibold leading-tight ${activeRubric === r.id ? "text-white" : "text-slate-800"}`}>
              {r.title.replace(" 루브릭", "")}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-wrap gap-0.5">
                {r.criteria.map((c) => (
                  <span
                    key={c.name}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      activeRubric === r.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {c.points}
                  </span>
                ))}
              </div>
              <span className={`text-xs font-bold ${activeRubric === r.id ? "text-sky-300" : "text-blue-600"}`}>
                {r.totalPoints}점
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 루브릭 상세 카드 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#0a1a3e] to-[#1e3a8a] px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-sky-300 text-xs font-semibold mb-1">평가 루브릭</p>
              <h3 className="text-white text-lg font-bold">{rubric.title}</h3>
              <p className="text-blue-200/80 text-sm mt-1">{rubric.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{rubric.totalPoints}</p>
                <p className="text-blue-300 text-xs">총점</p>
              </div>
              <CopyButton text={getRubricText(rubric)} label="루브릭 복사" />
            </div>
          </div>
        </div>

        {/* 점수 배분 요약 */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">점수 배분:</span>
            {rubric.criteria.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 border border-slate-200 shadow-sm">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"][
                      rubric.criteria.indexOf(c) % 5
                    ],
                  }}
                />
                <span className="text-xs text-slate-600 font-medium">{c.name}</span>
                <span className="text-xs font-bold text-slate-800">{c.points}점</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1.5 bg-[#0f2554] rounded-lg px-3 py-1.5">
              <span className="text-white text-xs font-bold">합계 {rubric.totalPoints}점</span>
            </div>
          </div>

          {/* 점수 비율 바 */}
          <div className="mt-3 flex rounded-full overflow-hidden h-2.5">
            {rubric.criteria.map((c, i) => (
              <div
                key={c.name}
                className="h-full"
                style={{
                  width: `${(c.points / rubric.totalPoints) * 100}%`,
                  backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"][i % 5],
                }}
                title={`${c.name}: ${c.points}점`}
              />
            ))}
          </div>
        </div>

        {/* 세부 기준 */}
        <div className="p-6 space-y-5">
          {rubric.criteria.map((criterion) => (
            <div key={criterion.name}>
              <div className="flex items-center gap-3 mb-2.5">
                <span className="font-bold text-slate-800">{criterion.name}</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                  {criterion.points}점
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                {(["excellent", "good", "fair", "poor"] as const).map((level) => {
                  const lc = levelConfig[level];
                  const pct = level === "excellent" ? 100 : level === "good" ? 80 : level === "fair" ? 60 : 40;
                  return (
                    <div key={level} className={`rounded-xl p-3 text-xs leading-relaxed ${lc.color}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${lc.badge}`}>
                          {lc.label}
                        </span>
                        <span className="text-[10px] opacity-60 font-semibold">
                          {Math.round(criterion.points * pct / 100)}점
                        </span>
                      </div>
                      {criterion[level]}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 교수자 메모 */}
        <div className="px-6 pb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <span className="text-sm font-bold text-amber-800">교수자 평가 메모</span>
                <span className="text-xs text-amber-600 hidden sm:inline">— 브라우저에 저장됩니다</span>
              </div>
              <button
                onClick={() => handleSaveMemo(rubric.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  savedStatus[rubric.id]
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                <Save size={11} />
                {savedStatus[rubric.id] ? "저장됨!" : "저장"}
              </button>
            </div>
            <textarea
              value={memos[rubric.id] || ""}
              onChange={(e) => setMemos((prev) => ({ ...prev, [rubric.id]: e.target.value }))}
              placeholder="학생 평가 시 참고할 메모를 입력하세요. (예: 특이사항, 조정 기준, 팀별 참고사항, 평가 일자)"
              rows={3}
              className="w-full px-3 py-2.5 border border-amber-200 rounded-xl text-sm text-slate-700 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-300 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 루브릭 빠른 비교 */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">4종 루브릭 빠른 비교</h3>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0f2554] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold opacity-80">루브릭</th>
                <th className="px-4 py-3 text-left text-xs font-semibold opacity-80">주요 평가 항목</th>
                <th className="px-4 py-3 text-center text-xs font-semibold opacity-80">총점</th>
                <th className="px-4 py-3 text-center text-xs font-semibold opacity-80">복사</th>
              </tr>
            </thead>
            <tbody>
              {rubrics.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-slate-100 cursor-pointer transition-colors hover:bg-blue-50/50 ${
                    activeRubric === r.id ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                  }`}
                  onClick={() => setActiveRubric(r.id)}
                >
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.criteria.map((c) => (
                        <span key={c.name} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700">{r.totalPoints}점</td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <CopyButton text={getRubricText(r)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
