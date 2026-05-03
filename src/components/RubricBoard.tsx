import { useState, useEffect } from "react";
import { rubrics } from "../data/rubrics";
import { CopyButton } from "./CopyButton";
import { Save } from "lucide-react";

const MEMO_KEY = "eduai_rubric_memos";

export function RubricBoard() {
  const [activeRubric, setActiveRubric] = useState(rubrics[0].id);
  const [memos, setMemos] = useState<Record<string, string>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(MEMO_KEY);
    if (saved) setMemos(JSON.parse(saved));
  }, []);

  const handleSaveMemo = (id: string) => {
    const updated = { ...memos };
    localStorage.setItem(MEMO_KEY, JSON.stringify(updated));
    setSavedStatus((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setSavedStatus((prev) => ({ ...prev, [id]: false })), 2000);
  };

  const rubric = rubrics.find((r) => r.id === activeRubric)!;

  const getRubricText = (r: typeof rubric) => {
    return `[${r.title}]\n\n${r.criteria.map((c) =>
      `${c.name} (${c.points}점)\n• 우수: ${c.excellent}\n• 양호: ${c.good}\n• 보통: ${c.fair}\n• 미흡: ${c.poor}`
    ).join("\n\n")}\n\n총점: ${r.totalPoints}점`;
  };

  const levelColors = {
    excellent: "bg-emerald-50 text-emerald-800 border-l-4 border-l-emerald-500",
    good: "bg-blue-50 text-blue-800 border-l-4 border-l-blue-400",
    fair: "bg-amber-50 text-amber-800 border-l-4 border-l-amber-400",
    poor: "bg-red-50 text-red-800 border-l-4 border-l-red-300",
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">평가 루브릭</h2>
        <p className="text-sm text-slate-500">4종의 평가 루브릭을 확인하고 복사하세요. 교수자 메모도 저장 가능합니다.</p>
      </div>

      {/* 루브릭 탭 */}
      <div className="flex flex-wrap gap-2">
        {rubrics.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRubric(r.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              activeRubric === r.id
                ? "bg-[#0f2554] text-white border-[#0f2554]"
                : "bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {r.title.replace(" 루브릭", "")}
          </button>
        ))}
      </div>

      {/* 루브릭 카드 */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#0f2554] to-[#1e3a8a] px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white text-lg font-bold">{rubric.title}</h3>
              <p className="text-blue-200 text-sm mt-0.5">{rubric.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
                총점 {rubric.totalPoints}점
              </span>
              <CopyButton text={getRubricText(rubric)} label="루브릭 복사" />
            </div>
          </div>
        </div>

        {/* 점수 요약 */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-wrap gap-3">
            {rubric.criteria.map((c) => (
              <div key={c.name} className="bg-white rounded-lg px-4 py-2 border border-slate-200 text-center">
                <p className="text-lg font-bold text-[#0f2554]">{c.points}점</p>
                <p className="text-xs text-slate-500">{c.name}</p>
              </div>
            ))}
            <div className="bg-[#0f2554] rounded-lg px-4 py-2 text-center">
              <p className="text-lg font-bold text-white">{rubric.totalPoints}점</p>
              <p className="text-xs text-blue-200">합계</p>
            </div>
          </div>
        </div>

        {/* 세부 기준 */}
        <div className="p-6 space-y-5">
          {rubric.criteria.map((criterion) => (
            <div key={criterion.name}>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-slate-800">{criterion.name}</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {criterion.points}점
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                <div className={`rounded-lg p-3 text-xs leading-relaxed ${levelColors.excellent}`}>
                  <span className="font-bold block mb-1">우수 ({criterion.points}점)</span>
                  {criterion.excellent}
                </div>
                <div className={`rounded-lg p-3 text-xs leading-relaxed ${levelColors.good}`}>
                  <span className="font-bold block mb-1">양호 ({Math.round(criterion.points * 0.8)}점)</span>
                  {criterion.good}
                </div>
                <div className={`rounded-lg p-3 text-xs leading-relaxed ${levelColors.fair}`}>
                  <span className="font-bold block mb-1">보통 ({Math.round(criterion.points * 0.6)}점)</span>
                  {criterion.fair}
                </div>
                <div className={`rounded-lg p-3 text-xs leading-relaxed ${levelColors.poor}`}>
                  <span className="font-bold block mb-1">미흡 ({Math.round(criterion.points * 0.4)}점)</span>
                  {criterion.poor}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 교수자 메모 */}
        <div className="px-6 pb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-amber-800">📋 교수자 평가 메모</span>
              <button
                onClick={() => handleSaveMemo(rubric.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  savedStatus[rubric.id]
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                <Save size={12} />
                {savedStatus[rubric.id] ? "저장됨!" : "저장"}
              </button>
            </div>
            <textarea
              value={memos[rubric.id] || ""}
              onChange={(e) => setMemos((prev) => ({ ...prev, [rubric.id]: e.target.value }))}
              placeholder="학생 평가 시 참고할 메모를 입력하세요. (예: 특이사항, 조정 기준, 팀별 참고사항)"
              rows={3}
              className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm text-slate-700 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-300"
            />
          </div>
        </div>
      </div>

      {/* 전체 루브릭 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rubrics.map((r) => (
          <div
            key={r.id}
            className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
              activeRubric === r.id ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-300"
            }`}
            onClick={() => setActiveRubric(r.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-slate-800 text-sm">{r.title}</h4>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                {r.totalPoints}점
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{r.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {r.criteria.map((c) => (
                <span key={c.name} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {c.name} {c.points}점
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
