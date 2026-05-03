import { useState, useEffect, useCallback } from "react";
import { weeklyPlan } from "../data/weeklyPlan";
import { CopyButton } from "./CopyButton";
import { MessageSquare, Save, Bot, ChevronDown } from "lucide-react";

type QuestionType =
  | "concept"
  | "presentation"
  | "practice"
  | "quiz"
  | "feedback"
  | "tool"
  | "complaint"
  | "strategy";

interface QuestionButton {
  key: QuestionType;
  label: string;
  emoji: string;
  color: string;
}

const questionButtons: QuestionButton[] = [
  { key: "concept", label: "이번 주 개념 설명해줘", emoji: "📚", color: "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 data-[active]:bg-blue-600 data-[active]:text-white data-[active]:border-blue-600" },
  { key: "presentation", label: "발표자료 프롬프트 만들어줘", emoji: "🎨", color: "hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 data-[active]:bg-violet-600 data-[active]:text-white data-[active]:border-violet-600" },
  { key: "practice", label: "실습과제 어떻게 해?", emoji: "🔧", color: "hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 data-[active]:bg-teal-600 data-[active]:text-white data-[active]:border-teal-600" },
  { key: "quiz", label: "퀴즈 만들어줘", emoji: "❓", color: "hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 data-[active]:bg-orange-500 data-[active]:text-white data-[active]:border-orange-500" },
  { key: "feedback", label: "보고서 피드백 기준 알려줘", emoji: "📝", color: "hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 data-[active]:bg-emerald-600 data-[active]:text-white data-[active]:border-emerald-600" },
  { key: "tool", label: "어떤 AI 도구를 써야 해?", emoji: "🤖", color: "hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 data-[active]:bg-sky-600 data-[active]:text-white data-[active]:border-sky-600" },
  { key: "complaint", label: "고객불만 대응 시나리오", emoji: "🎭", color: "hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 data-[active]:bg-rose-500 data-[active]:text-white data-[active]:border-rose-500" },
  { key: "strategy", label: "서비스 전략 비교표 만들어줘", emoji: "📊", color: "hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 data-[active]:bg-indigo-600 data-[active]:text-white data-[active]:border-indigo-600" },
];

function generateAnswer(week: number, type: QuestionType): string {
  const w = weeklyPlan.find((x) => x.week === week);
  if (!w) return "";

  switch (type) {
    case "concept":
      return `📌 ${week}주차 — ${w.topic}\n\n【학습목표】\n${w.objective}\n\n【핵심 개념】\n${w.concepts.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\n【개념 해설】\n이번 주는 ${w.concepts[0]}과(와) ${w.concepts[1] || w.concepts[0]}의 관계를 이해하는 것이 핵심입니다. ${w.activity}를 통해 실제 사례에 직접 적용해보세요.\n\n【이번 주 핵심 질문】\n• "${w.concepts[0]}이 실제 서비스에서 어떻게 나타나는가?"\n• "${w.concepts[1] || w.concepts[0]}를 개선하기 위해 무엇을 해야 하는가?"`;

    case "presentation":
      return `🎨 ${week}주차 Gamma 발표자료 프롬프트\n\n아래 프롬프트를 Gamma(gamma.app)에 그대로 입력하세요:\n\n---\n"${w.gammaPrompt}"\n---\n\n【Gamma 활용 팁】\n1. Gamma 접속 → '새로 만들기' → '텍스트에서 생성' 선택\n2. 위 프롬프트 전체 복사 후 붙여넣기\n3. 슬라이드 수(10~12장), 언어(한국어), 디자인 테마 선택\n4. 생성 후 각 슬라이드에 실제 사례와 데이터를 추가해 완성도를 높이세요.`;

    case "practice":
      return `🔧 ${week}주차 실습과제 안내\n\n【과제명】 ${w.assignment}\n\n【실습 활동】 ${w.activity}\n\n【단계별 수행 방법】\n1단계. GPT에서 '${w.concepts[0]}'의 기본 개념을 학습하세요.\n2단계. 실제 서비스 사례를 1개 선정합니다 (카페, 병원, 쇼핑몰 등).\n3단계. ${w.tools[0]}를 활용해 분석 내용을 구체화하세요.\n4단계. ${w.tools[1] || "Gamma"}로 결과물을 시각화합니다.\n5단계. 평가 기준(${w.evaluation})을 참고해 최종 검토하세요.\n\n【제출 형식】 A4 2~3페이지 또는 슬라이드 10장 이내`;

    case "quiz":
      return `❓ ${week}주차 ${w.topic} 복습 퀴즈\n\n[Q1 - OX형]\n${w.concepts[0]}은(는) 서비스의 핵심 요소 중 하나다. (    )\n→ 정답: O / 해설: ${w.concepts[0]}은(는) ${w.objective.split("를")[0]}와 직결됩니다.\n\n[Q2 - 단답형]\n${w.concepts[1] || w.concepts[0]}의 정의를 간략히 서술하시오.\n→ 정답 예시: [개념 정의를 GPT로 확인하세요]\n\n[Q3 - 객관식]\n다음 중 ${w.topic}에서 가장 중요한 요소는?\n① ${w.concepts[0]}  ② ${w.concepts[1] || "서비스 품질"}  ③ 비용 절감  ④ 대량 생산\n→ 정답: ①\n\n[Q4 - 사례형]\n실제 ${w.activity}를 수행하면서 어떤 ${w.concepts[0]} 문제를 발견했는가?\n→ 자유 서술\n\n💡 Geminiami 프롬프트: "${w.week}주차 ${w.topic} 관련 퀴즈 10문제를 OX, 객관식, 단답형으로 만들어줘. 정답과 해설도 포함해줘."`;

    case "feedback":
      return `📝 ${week}주차 보고서 피드백 기준\n\n【핵심 평가 항목】\n\n✅ 개념 정확성 (25점)\n• ${w.concepts.slice(0, 2).join(", ")} 개념을 정확히 이해하고 적용했는가?\n• 수업에서 배운 이론적 프레임워크를 활용했는가?\n\n✅ 사례 분석 (25점)\n• ${w.activity}와 관련된 구체적이고 현실적인 사례를 제시했는가?\n• 사례와 이론의 연결이 논리적인가?\n\n✅ 논리적 구성 (25점)\n• 서론-본론-결론 구조가 명확한가?\n• 주장에 대한 근거가 충분한가?\n\n✅ AI 도구 활용 (15점)\n• ${w.tools.join(", ")}을 적절히 활용했는가?\n• 활용 결과가 보고서 품질 향상에 기여했는가?\n\n✅ 형식 완성도 (10점)\n• 분량, 참고문헌, 가독성이 적절한가?\n\n【최종 평가 기준】 ${w.evaluation}`;

    case "tool":
      return `🤖 ${week}주차 ${w.topic} 추천 AI 도구\n\n${w.tools.map((t) => {
        const info: Record<string, { use: string; prompt: string }> = {
          GPT: { use: "개념 정리, 비교표 작성, 보고서 초안 생성", prompt: `"${w.topic}에 대해 대학생 수준으로 쉽게 설명해줘. 핵심 개념과 실제 사례를 포함해줘."` },
          Gamma: { use: "발표 슬라이드 자동 생성, 포트폴리오 시각화", prompt: `"${w.gammaPrompt.substring(0, 60)}..."` },
          Napkin: { use: "서비스 프로세스, 구조도, 인포그래픽 시각화", prompt: `"${w.topic}의 핵심 구조를 흐름도로 시각화해줘."` },
          Felo: { use: "고객-직원 역할극, 응대 시뮬레이션, 발표 리허설", prompt: `"${w.activity} 상황극을 고객과 직원 역할로 만들어줘."` },
          Genspark: { use: "고객 인터뷰 대본, 직원 교육 시나리오, 사례 리서치", prompt: `"${w.topic} 관련 현장 조사를 위한 인터뷰 질문 8개를 만들어줘."` },
          Geminiami: { use: "복습 퀴즈 생성, 중간·기말 예상 문제 작성", prompt: `"${w.week}주차 ${w.topic} 관련 객관식 5문제를 만들어줘."` },
        };
        const i = info[t] || { use: "수업 지원", prompt: "관련 내용을 분석해줘." };
        return `🔹 ${t}\n   활용: ${i.use}\n   프롬프트 예시: ${i.prompt}`;
      }).join("\n\n")}\n\n💡 이번 주 과제(${w.assignment})에는 특히 ${w.tools[0]}을 우선 활용하세요.`;

    case "complaint":
      return `🎭 ${week}주차 고객불만 대응 시나리오\n\n【상황 설정】\n${w.topic} 관련 서비스에서 고객이 불만을 제기하는 상황\n\n【시나리오】\n\n👤 고객: "이게 무슨 서비스예요? 기다린 시간은 얼마인데 이런 대우를 받아야 합니까?"\n\n🏷️ 직원 Step 1 — 감정 인정 & 즉각 사과\n"고객님, 불편을 드려서 진심으로 사과드립니다. 충분히 화가 나실 만합니다. 제가 바로 확인해 드리겠습니다."\n\n🏷️ 직원 Step 2 — 원인 파악 & 설명\n"오늘 [상황]으로 인해 예상치 못한 지연이 발생했습니다. 구체적인 상황을 말씀드리면..."\n\n🏷️ 직원 Step 3 — 해결책 & 보상 제시\n"즉시 [조치]를 취하겠습니다. 추가로 [보상/쿠폰/우선 처리] 방식으로 불편을 보상해 드리겠습니다."\n\n🏷️ 직원 Step 4 — 재발 방지 & 신뢰 회복\n"다음에는 이런 일이 없도록 최선을 다하겠습니다. 다음 방문 때는 더 좋은 서비스로 뵙겠습니다."\n\n💡 GPT 프롬프트: "${w.topic} 관련 서비스에서 발생할 수 있는 고객불만 상황 3가지와 단계별 대응 스크립트를 작성해줘"`;

    case "strategy":
      return `📊 ${week}주차 ${w.topic} 서비스 전략 비교표\n\n| 전략 관점 | 전통적 방식 | AI 기반 방식 | 핵심 차이점 |\n|---------|-----------|------------|----------|\n| ${w.concepts[0]} | 수동 분석 | AI 자동 분석 | 속도·정확성 |\n| ${w.concepts[1] || "고객 접점"} | 경험 기반 판단 | 데이터 기반 의사결정 | 객관성 |\n| 서비스 품질 | 사후 모니터링 | 실시간 분석·예측 | 선제적 대응 |\n| 고객 소통 | 대면·전화 위주 | 옴니채널 통합 | 접근성·편의성 |\n| 피드백 처리 | 주간·월간 집계 | 즉시 처리·대응 | 신속성 |\n\n💡 더 상세한 분석은 GPT에 "${w.topic}에서 전통적 서비스 방식 vs AI·디지털 기반 서비스 방식을 비교하는 전략 분석표를 만들어줘"라고 요청하세요.`;

    default:
      return "";
  }
}

const STORAGE_KEY = "eduai_tutor_memos";

export function StudentTutor() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedType, setSelectedType] = useState<QuestionType>("concept");
  const [answer, setAnswer] = useState<string>(() => generateAnswer(1, "concept"));
  const [memo, setMemo] = useState("");
  const [savedMemo, setSavedMemo] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setMemo(saved);
  }, []);

  // 주차 또는 질문 유형이 바뀔 때마다 자동으로 답변 갱신
  const handleWeekChange = useCallback((week: number) => {
    setSelectedWeek(week);
    setAnswer(generateAnswer(week, selectedType));
  }, [selectedType]);

  const handleTypeChange = useCallback((type: QuestionType) => {
    setSelectedType(type);
    setAnswer(generateAnswer(selectedWeek, type));
  }, [selectedWeek]);

  const handleSaveMemo = () => {
    localStorage.setItem(STORAGE_KEY, memo);
    setSavedMemo(true);
    setTimeout(() => setSavedMemo(false), 2000);
  };

  const currentWeek = weeklyPlan.find((w) => w.week === selectedWeek);
  const currentQuestion = questionButtons.find((b) => b.key === selectedType);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">학생용 AI 튜터</h2>
        <p className="text-sm text-slate-500">주차와 질문 유형을 선택하면 답변이 자동으로 바뀝니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ─── 왼쪽 컨트롤 패널 ─── */}
        <div className="space-y-4">
          {/* 주차 선택 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">주차 선택</p>
            <div className="relative">
              <select
                value={selectedWeek}
                onChange={(e) => handleWeekChange(Number(e.target.value))}
                className="w-full appearance-none px-3 py-2.5 pr-8 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white font-medium text-slate-700"
              >
                {weeklyPlan.map((w) => (
                  <option key={w.week} value={w.week}>
                    {w.week}주차: {w.topic}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {currentWeek && (
              <div className="mt-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs font-bold text-blue-800">{currentWeek.topic}</p>
                <p className="text-xs text-blue-600 mt-1 leading-relaxed">{currentWeek.objective}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {currentWeek.tools.map((t) => (
                    <span key={t} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 질문 유형 선택 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">질문 유형 선택</p>
            <div className="space-y-1.5">
              {questionButtons.map((btn) => (
                <button
                  key={btn.key}
                  data-active={selectedType === btn.key ? "" : undefined}
                  onClick={() => handleTypeChange(btn.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all border font-medium ${btn.color} ${
                    selectedType === btn.key
                      ? ""
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <span className="text-base flex-shrink-0">{btn.emoji}</span>
                  <span className="leading-tight">{btn.label}</span>
                  {selectedType === btn.key && (
                    <span className="ml-auto text-xs opacity-70">선택됨</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── 오른쪽 답변 + 메모 ─── */}
        <div className="lg:col-span-2 space-y-4">
          {/* 답변 영역 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* 답변 헤더 */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#0f2554] rounded-xl flex items-center justify-center">
                  <Bot size={15} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">AI 튜터 답변</p>
                  <p className="text-xs text-slate-400">
                    {selectedWeek}주차 · {currentQuestion?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  자동 갱신
                </span>
                {answer && <CopyButton text={answer} label="복사" />}
              </div>
            </div>

            {/* 답변 내용 */}
            <div className="px-5 py-5 min-h-56">
              {answer ? (
                <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {answer}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
                    <MessageSquare size={24} className="text-blue-300" />
                  </div>
                  <p className="text-slate-400 text-sm">왼쪽에서 주차와 질문 유형을 선택하세요.</p>
                </div>
              )}
            </div>
          </div>

          {/* 학생 메모 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-lg">📓</span>
                <span className="font-semibold text-slate-800 text-sm">내 학습 메모</span>
                <span className="text-xs text-slate-400">— 브라우저에 자동 저장 가능</span>
              </div>
              <button
                onClick={handleSaveMemo}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  savedMemo
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-[#0f2554] text-white hover:bg-[#1e3a8a]"
                }`}
              >
                <Save size={11} />
                {savedMemo ? "저장됨!" : "저장하기"}
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder={`${selectedWeek}주차 학습 내용, 질문, 아이디어를 자유롭게 기록하세요.`}
                rows={5}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-300 leading-relaxed"
              />
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                '저장하기' 버튼을 누르면 새로고침 후에도 메모가 유지됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
