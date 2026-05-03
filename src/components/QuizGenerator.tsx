import { useState, useMemo } from "react";
import { quizzes, type QuizType } from "../data/quizzes";
import { weeklyPlan } from "../data/weeklyPlan";
import { CopyButton } from "./CopyButton";
import { HelpCircle, ChevronDown, ChevronUp, RefreshCw, Sparkles } from "lucide-react";

const quizTypeColors: Record<QuizType, string> = {
  OX: "bg-emerald-100 text-emerald-700 border-emerald-200",
  객관식: "bg-blue-100 text-blue-700 border-blue-200",
  단답형: "bg-orange-100 text-orange-700 border-orange-200",
  사례형: "bg-violet-100 text-violet-700 border-violet-200",
};

export function QuizGenerator() {
  const [selectedWeek, setSelectedWeek] = useState<number>(2);
  const [selectedType, setSelectedType] = useState<QuizType | "전체">("전체");
  const [count, setCount] = useState<number>(5);
  const [generated, setGenerated] = useState<typeof quizzes>([]);
  const [openAnswers, setOpenAnswers] = useState<Set<string>>(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);

  // 주차별 문제 수 미리 계산
  const weekStats = useMemo(() => {
    const result: Record<number, Record<QuizType | "전체", number>> = {};
    for (let w = 1; w <= 16; w++) {
      const pool = quizzes.filter((q) => q.week === w);
      result[w] = {
        전체: pool.length,
        OX: pool.filter((q) => q.type === "OX").length,
        객관식: pool.filter((q) => q.type === "객관식").length,
        단답형: pool.filter((q) => q.type === "단답형").length,
        사례형: pool.filter((q) => q.type === "사례형").length,
      };
    }
    return result;
  }, []);

  const availableCount = weekStats[selectedWeek]?.[selectedType] ?? 0;

  const handleGenerate = () => {
    let pool = quizzes.filter((q) => q.week === selectedWeek);
    if (selectedType !== "전체") {
      pool = pool.filter((q) => q.type === selectedType);
    }
    // 최대 available만큼만, count 초과하지 않도록
    const result = pool.slice(0, Math.min(count, pool.length));
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

  const toggleAllAnswers = () => {
    if (openAnswers.size === generated.length) {
      setOpenAnswers(new Set());
    } else {
      setOpenAnswers(new Set(generated.map((q) => q.id)));
    }
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
  const currentWeekTopic = weeklyPlan.find((w) => w.week === selectedWeek)?.topic || "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">퀴즈 생성기</h2>
        <p className="text-sm text-slate-500">주차와 유형을 선택하면 예시 퀴즈가 즉시 생성됩니다. 주차별 4문항 이상 제공됩니다.</p>
      </div>

      {/* ── 옵션 패널 ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 주차 선택 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              주차 선택
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(Number(e.target.value));
                setHasGenerated(false);
                setGenerated([]);
              }}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium text-slate-700"
            >
              {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => {
                const total = weekStats[w]?.["전체"] ?? 0;
                return (
                  <option key={w} value={w}>
                    {w}주차 — {weeklyPlan.find((wp) => wp.week === w)?.topic} ({total}문항)
                  </option>
                );
              })}
            </select>
            {currentWeekTopic && (
              <p className="text-xs text-slate-400 mt-1">총 {availableCount}문항 사용 가능</p>
            )}
          </div>

          {/* 문제 유형 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              문제 유형
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {availableTypes.map((t) => {
                const cnt = weekStats[selectedWeek]?.[t] ?? 0;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all border text-center ${
                      selectedType === t
                        ? "bg-[#0f2554] text-white border-[#0f2554] shadow-sm"
                        : t === "전체"
                        ? "bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600"
                        : `${quizTypeColors[t as QuizType]} border hover:opacity-80`
                    }`}
                  >
                    {t}
                    <span className="ml-1 opacity-60">({cnt})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 문제 수 */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              문제 수
            </label>
            <div className="flex gap-2">
              {[3, 5, 10].map((n) => {
                const isDisabled = availableCount < n;
                return (
                  <button
                    key={n}
                    onClick={() => !isDisabled && setCount(n)}
                    disabled={isDisabled}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                      count === n && !isDisabled
                        ? "bg-[#0f2554] text-white border-[#0f2554] shadow-sm"
                        : isDisabled
                        ? "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"
                        : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    {n}문항
                    {isDisabled && <span className="block text-[9px] opacity-60">부족</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              현재 {Math.min(count, availableCount)}문항 생성 가능
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-1 border-t border-slate-100">
          <button
            onClick={handleGenerate}
            disabled={availableCount === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              availableCount === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-[#0f2554] text-white hover:bg-[#1e3a8a] shadow-sm hover:shadow-md"
            }`}
          >
            <Sparkles size={15} />
            퀴즈 생성하기
          </button>
          {hasGenerated && (
            <button
              onClick={() => {
                setGenerated([]);
                setHasGenerated(false);
                setOpenAnswers(new Set());
              }}
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors"
            >
              <RefreshCw size={13} />
              초기화
            </button>
          )}
          {hasGenerated && generated.length > 0 && (
            <button
              onClick={toggleAllAnswers}
              className="ml-auto flex items-center gap-1.5 text-blue-600 text-sm font-semibold hover:text-blue-800"
            >
              <HelpCircle size={14} />
              {openAnswers.size === generated.length ? "전체 정답 숨기기" : "전체 정답 보기"}
            </button>
          )}
        </div>
      </div>

      {/* ── 생성된 퀴즈 ── */}
      {hasGenerated && (
        <div className="space-y-4">
          {generated.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
              <p className="text-slate-400 text-sm">선택한 조건에 해당하는 문제가 없습니다.</p>
              <p className="text-slate-300 text-xs mt-1">다른 주차나 유형을 선택해보세요.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {selectedWeek}주차 — {currentWeekTopic}
                  </p>
                  <p className="text-xs text-slate-500">{generated.length}문항 생성됨</p>
                </div>
                <CopyButton text={quizText} label="전체 복사" size="md" />
              </div>

              {generated.map((quiz, idx) => (
                <div
                  key={quiz.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:border-slate-300 transition-colors"
                >
                  <div className="px-5 py-4">
                    {/* 문제 헤더 */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-[#0f2554] text-white text-xs font-bold rounded-xl flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${quizTypeColors[quiz.type]}`}>
                        {quiz.type}
                      </span>
                      <span className="text-xs text-slate-400">{quiz.week}주차</span>
                    </div>

                    {/* 문제 본문 */}
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-3">
                      {quiz.question}
                    </p>

                    {/* 객관식 보기 */}
                    {quiz.options && (
                      <div className="space-y-1.5 mb-3">
                        {quiz.options.map((opt) => (
                          <div key={opt.number} className="flex items-center gap-2.5">
                            <span className="w-6 h-6 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                              {opt.number}
                            </span>
                            <span className="text-sm text-slate-700">{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 정답 토글 버튼 */}
                    <button
                      onClick={() => toggleAnswer(quiz.id)}
                      className="flex items-center gap-1.5 text-blue-600 text-xs font-bold hover:text-blue-800 transition-colors py-1"
                    >
                      {openAnswers.has(quiz.id) ? (
                        <><ChevronUp size={13} />정답 숨기기</>
                      ) : (
                        <><ChevronDown size={13} />정답 및 해설 보기</>
                      )}
                    </button>

                    {/* 정답 & 해설 */}
                    {openAnswers.has(quiz.id) && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                        <div className="flex items-start gap-2.5">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                            정답
                          </span>
                          <p className="text-sm text-emerald-900 font-semibold leading-relaxed">{quiz.answer}</p>
                        </div>
                        <div className="flex items-start gap-2.5 pt-2 border-t border-emerald-200">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                            해설
                          </span>
                          <p className="text-xs text-emerald-800 leading-relaxed">{quiz.explanation}</p>
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

      {/* ── 퀴즈 유형 가이드 ── */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-3">퀴즈 유형 가이드</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { type: "OX" as QuizType, desc: "핵심 개념의 참/거짓을 판단하는 기초 이해 확인 문항", badge: "기초" },
            { type: "객관식" as QuizType, desc: "4개 보기에서 정답 선택, 정확한 개념 구분 능력 평가", badge: "표준" },
            { type: "단답형" as QuizType, desc: "핵심 용어나 개념을 직접 서술하는 심화 이해 평가", badge: "심화" },
            { type: "사례형" as QuizType, desc: "실제 상황에 개념을 적용하는 고차원 사고력 평가", badge: "응용" },
          ].map((g) => (
            <div key={g.type} className={`rounded-xl p-3.5 border ${quizTypeColors[g.type]}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold`}>{g.type}</span>
                <span className="text-[10px] bg-white/60 px-1.5 py-0.5 rounded font-bold">{g.badge}</span>
              </div>
              <p className="text-xs leading-relaxed opacity-80">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
