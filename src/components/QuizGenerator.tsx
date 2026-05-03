import { useState } from "react";
import { quizzes, type QuizType } from "../data/quizzes";
import { CopyButton } from "./CopyButton";
import { HelpCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

const quizTypeColors: Record<QuizType, string> = {
  OX: "bg-emerald-100 text-emerald-700",
  객관식: "bg-blue-100 text-blue-700",
  단답형: "bg-orange-100 text-orange-700",
  사례형: "bg-purple-100 text-purple-700",
};

export function QuizGenerator() {
  const [selectedWeek, setSelectedWeek] = useState<number>(2);
  const [selectedType, setSelectedType] = useState<QuizType | "전체">("전체");
  const [count, setCount] = useState<number>(5);
  const [generated, setGenerated] = useState<typeof quizzes>([]);
  const [openAnswers, setOpenAnswers] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = () => {
    let pool = quizzes.filter((q) => q.week === selectedWeek);
    if (selectedType !== "전체") {
      pool = pool.filter((q) => q.type === selectedType);
    }
    const result = pool.slice(0, count);
    setGenerated(result);
    setOpenAnswers(new Set());
    setHasGenerated(true);
  };

  const toggleAnswer = (id: string) => {
    setOpenAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const quizText = generated
    .map(
      (q, i) =>
        `[문제 ${i + 1}] (${q.type})\n${q.question}${
          q.options ? "\n" + q.options.map((o) => `${o.number}. ${o.text}`).join("\n") : ""
        }\n\n정답: ${q.answer}\n해설: ${q.explanation}`
    )
    .join("\n\n---\n\n");

  const availableTypes: (QuizType | "전체")[] = ["전체", "OX", "객관식", "단답형", "사례형"];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">퀴즈 생성기</h2>
        <p className="text-sm text-slate-500">주차와 문제 유형을 선택하면 예시 퀴즈가 생성됩니다.</p>
      </div>

      {/* 옵션 패널 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">주차 선택</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>{w}주차</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">문제 유형</label>
            <div className="flex flex-wrap gap-1.5">
              {availableTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    selectedType === t
                      ? "bg-[#0f2554] text-white border-[#0f2554]"
                      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">문제 수</label>
            <div className="flex gap-2">
              {[3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border ${
                    count === n
                      ? "bg-[#0f2554] text-white border-[#0f2554]"
                      : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                  }`}
                >
                  {n}문항
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 bg-[#0f2554] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#1e3a8a] transition-colors"
          >
            <HelpCircle size={16} />
            퀴즈 생성하기
          </button>
          {hasGenerated && (
            <button
              onClick={() => { setGenerated([]); setHasGenerated(false); setOpenAnswers(new Set()); }}
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors"
            >
              <RefreshCw size={14} />
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 생성된 퀴즈 */}
      {hasGenerated && (
        <div className="space-y-4">
          {generated.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
              <p className="text-slate-400 text-sm">선택한 조건에 해당하는 문제가 없습니다.</p>
              <p className="text-slate-300 text-xs mt-1">다른 주차나 유형을 선택해보세요.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  {selectedWeek}주차 퀴즈 — {generated.length}문항 생성됨
                </p>
                <CopyButton text={quizText} label="전체 복사" size="md" />
              </div>

              {generated.map((quiz, idx) => (
                <div key={quiz.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-[#0f2554] text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${quizTypeColors[quiz.type]}`}>
                        {quiz.type}
                      </span>
                      <span className="text-xs text-slate-400">{quiz.week}주차</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed mb-3">{quiz.question}</p>

                    {quiz.options && (
                      <div className="space-y-1.5 mb-3">
                        {quiz.options.map((opt) => (
                          <div key={opt.number} className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-slate-100 text-slate-600 text-xs font-semibold rounded flex items-center justify-center flex-shrink-0">
                              {opt.number}
                            </span>
                            <span className="text-sm text-slate-700">{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => toggleAnswer(quiz.id)}
                      className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold hover:text-blue-800 transition-colors"
                    >
                      {openAnswers.has(quiz.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {openAnswers.has(quiz.id) ? "정답 숨기기" : "정답 및 해설 보기"}
                    </button>

                    {openAnswers.has(quiz.id) && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold text-emerald-700 flex-shrink-0">정답</span>
                          <p className="text-sm text-emerald-800 leading-relaxed">{quiz.answer}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold text-emerald-600 flex-shrink-0">해설</span>
                          <p className="text-xs text-emerald-700 leading-relaxed">{quiz.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* 퀴즈 활용 가이드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 mb-3">퀴즈 유형 가이드</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { type: "OX", desc: "핵심 개념의 참/거짓을 판단하는 기초 이해 확인", color: "bg-emerald-100 text-emerald-700" },
            { type: "객관식", desc: "4개 보기에서 정답 선택, 정확한 개념 구분 능력 평가", color: "bg-blue-100 text-blue-700" },
            { type: "단답형", desc: "핵심 용어나 개념을 직접 서술하는 심화 이해 확인", color: "bg-orange-100 text-orange-700" },
            { type: "사례형", desc: "실제 상황에 개념을 적용하는 고차원 사고력 평가", color: "bg-purple-100 text-purple-700" },
          ].map((g) => (
            <div key={g.type} className="bg-white rounded-lg p-3 border border-blue-100">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${g.color}`}>{g.type}</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
