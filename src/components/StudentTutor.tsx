import { useState, useEffect } from "react";
import { weeklyPlan } from "../data/weeklyPlan";
import { CopyButton } from "./CopyButton";
import { MessageSquare, Save } from "lucide-react";

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
}

const questionButtons: QuestionButton[] = [
  { key: "concept", label: "이번 주 개념 설명해줘", emoji: "📚" },
  { key: "presentation", label: "발표자료 프롬프트 만들어줘", emoji: "🎨" },
  { key: "practice", label: "실습과제 어떻게 해?", emoji: "🔧" },
  { key: "quiz", label: "퀴즈 만들어줘", emoji: "❓" },
  { key: "feedback", label: "내 보고서 피드백 기준 알려줘", emoji: "📝" },
  { key: "tool", label: "어떤 AI 도구를 써야 해?", emoji: "🤖" },
  { key: "complaint", label: "고객불만 대응 시나리오 만들어줘", emoji: "🎭" },
  { key: "strategy", label: "서비스 전략 비교표 만들어줘", emoji: "📊" },
];

function generateAnswer(week: number, type: QuestionType): string {
  const w = weeklyPlan.find((x) => x.week === week);
  if (!w) return "";

  switch (type) {
    case "concept":
      return `${week}주차 주제는 **${w.topic}**입니다.\n\n📌 학습목표: ${w.objective}\n\n🔑 핵심 개념:\n${w.concepts.map((c) => `• ${c}`).join("\n")}\n\n이번 주는 ${w.concepts[0]}와(과) ${w.concepts[1]}의 차이를 이해하는 것이 핵심입니다. ${w.activity}를 통해 실제 사례에 적용해보세요.`;

    case "presentation":
      return `${week}주차 **${w.topic}** 발표자료 Gamma 프롬프트:\n\n"${w.gammaPrompt}"\n\n💡 Gamma에 위 프롬프트를 입력하면 자동으로 발표 슬라이드가 생성됩니다. 생성된 슬라이드를 검토하고 실제 사례나 데이터를 추가하여 완성도를 높이세요.`;

    case "practice":
      return `${week}주차 실습과제 안내입니다.\n\n✅ 과제: **${w.assignment}**\n\n📋 실습 활동: ${w.activity}\n\n수행 방법:\n1. ${w.concepts[0]}에 대한 기본 개념을 GPT로 학습하세요.\n2. 실제 서비스 사례를 선택해 적용해보세요.\n3. ${w.tools.join(", ")} 도구를 활용해 결과물을 완성하세요.\n4. 평가 기준(${w.evaluation})을 참고해 최종 검토하세요.`;

    case "quiz":
      return `${week}주차 **${w.topic}** 복습 퀴즈 예시입니다.\n\nQ1. ${w.concepts[0]}의 정의를 설명하시오.\nQ2. ${w.concepts[1]}과(와) ${w.concepts[0]}의 차이점은 무엇인가?\nQ3. 다음 중 ${w.topic}에서 가장 중요한 요소는? (객관식)\nQ4. 실제 서비스 사례를 들어 ${w.concepts[2] || w.concepts[0]}을(를) 설명하시오.\n\n💡 Geminiami를 활용해 더 많은 문제를 생성해보세요: "${week}주차 ${w.topic} 관련 퀴즈 10문제를 객관식과 단답형으로 만들어줘"`;

    case "feedback":
      return `${week}주차 보고서 피드백 기준 안내:\n\n✅ 핵심 평가 항목:\n• 개념 정확성: ${w.concepts.slice(0, 2).join(", ")} 개념을 정확히 이해하고 적용했는가?\n• 사례 적절성: ${w.activity}와 관련된 구체적 사례를 제시했는가?\n• 논리적 구성: 서론-본론-결론이 명확하게 구성되어 있는가?\n• AI 도구 활용: ${w.tools.join(", ")}을 적절히 활용했는가?\n\n📊 평가 방법: ${w.evaluation}`;

    case "tool":
      return `${week}주차 **${w.topic}** 수업에 적합한 AI 도구:\n\n${w.tools.map((t) => {
        const roles: Record<string, string> = {
          GPT: "개념 설명, 사례 분석, 보고서 초안 작성",
          Gamma: "발표 슬라이드 자동 생성",
          Napkin: "프로세스/구조 시각화",
          Felo: "고객 응대 시뮬레이션, 역할극",
          Genspark: "인터뷰 대본, 시나리오 작성",
          Geminiami: "퀴즈 문항, 복습 자료 생성",
        };
        return `🔹 **${t}**: ${roles[t] || "수업 지원"}`;
      }).join("\n")}\n\n이번 주 과제(${w.assignment})에는 특히 ${w.tools[0]}를 활용하는 것을 추천합니다.`;

    case "complaint":
      return `고객불만 대응 시나리오 예시:\n\n📍 상황: 고객이 ${week}주차 관련 서비스 문제로 불만을 제기하는 상황\n\n👤 고객: "이게 뭐예요? 기다린 시간이 얼마인데 이런 서비스를 받아야 합니까?"\n\n🏷️ 직원 1단계 (감정 인정): "불편을 드려서 정말 죄송합니다. 오래 기다리셨군요. 충분히 화가 나실 만 합니다."\n\n🏷️ 직원 2단계 (원인 설명): "오늘 예상치 못한 상황으로 인해 지연이 발생했습니다. 구체적으로 말씀드리면..."\n\n🏷️ 직원 3단계 (해결책 제시): "해결 방안으로 [보상 또는 대안]을 제공해 드리겠습니다."\n\n🏷️ 직원 4단계 (재방문 의사 회복): "다음 방문 시에는 더 나은 서비스를 받으실 수 있도록 최선을 다하겠습니다."\n\n💡 GPT 프롬프트: "${w.topic} 관련 서비스에서 발생할 수 있는 고객불만 상황과 단계별 대응 시나리오를 작성해줘"`;

    case "strategy":
      return `${week}주차 **${w.topic}** 서비스 전략 비교표:\n\n| 전략 요소 | 전통적 접근 | AI 기반 접근 | 핵심 차이 |\n|---------|-----------|------------|--------|\n| ${w.concepts[0]} | 수동 분석 | AI 자동 분석 | 속도·정확성 |\n| ${w.concepts[1]} | 경험에 의존 | 데이터 기반 | 객관성 |\n| 고객 접점 | 대면 위주 | 옴니채널 | 접근성 |\n| 피드백 | 사후 처리 | 실시간 대응 | 신속성 |\n\n💡 더 상세한 비교표는 GPT에 "${w.topic}에서 전통적 서비스 방식과 디지털/AI 기반 서비스 방식을 비교하는 표를 만들어줘"라고 요청해보세요.`;

    default:
      return "";
  }
}

const STORAGE_KEY = "eduai_tutor_memos";

export function StudentTutor() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [answer, setAnswer] = useState("");
  const [memo, setMemo] = useState("");
  const [savedMemo, setSavedMemo] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setMemo(saved);
  }, []);

  const handleAsk = (type: QuestionType) => {
    setSelectedType(type);
    setAnswer(generateAnswer(selectedWeek, type));
  };

  const handleSaveMemo = () => {
    localStorage.setItem(STORAGE_KEY, memo);
    setSavedMemo(true);
    setTimeout(() => setSavedMemo(false), 2000);
  };

  const currentWeek = weeklyPlan.find((w) => w.week === selectedWeek);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">학생용 AI 튜터</h2>
        <p className="text-sm text-slate-500">주차와 질문 유형을 선택하면 예시 답변을 확인할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 왼쪽: 설정 패널 */}
        <div className="space-y-4">
          {/* 주차 선택 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">주차 선택</p>
            <select
              value={selectedWeek}
              onChange={(e) => { setSelectedWeek(Number(e.target.value)); setAnswer(""); setSelectedType(null); }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {weeklyPlan.map((w) => (
                <option key={w.week} value={w.week}>{w.week}주차: {w.topic}</option>
              ))}
            </select>
            {currentWeek && (
              <div className="mt-3 bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium">{currentWeek.topic}</p>
                <p className="text-xs text-blue-600 mt-1">{currentWeek.objective}</p>
              </div>
            )}
          </div>

          {/* 질문 유형 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">질문 유형 선택</p>
            <div className="space-y-2">
              {questionButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => handleAsk(btn.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                    selectedType === btn.key
                      ? "bg-[#0f2554] text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200"
                  }`}
                >
                  <span>{btn.emoji}</span>
                  <span className="font-medium">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 답변 + 메모 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 답변 영역 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600" />
                <span className="font-semibold text-slate-800">AI 튜터 답변</span>
                {selectedType && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {questionButtons.find((b) => b.key === selectedType)?.label}
                  </span>
                )}
              </div>
              {answer && <CopyButton text={answer} label="답변 복사" />}
            </div>

            <div className="px-5 py-5 min-h-48">
              {answer ? (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {answer}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare size={22} className="text-blue-400" />
                  </div>
                  <p className="text-slate-400 text-sm">왼쪽에서 주차와 질문 유형을 선택하세요.</p>
                  <p className="text-slate-300 text-xs mt-1">8가지 질문 유형을 지원합니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* 학생 메모 */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <span className="font-semibold text-slate-800">📓 내 학습 메모</span>
              <button
                onClick={handleSaveMemo}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  savedMemo
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Save size={12} />
                {savedMemo ? "저장됨!" : "저장하기"}
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="이번 주 학습 내용, 질문, 아이디어를 자유롭게 기록하세요. 자동 저장은 '저장하기' 버튼을 눌러주세요."
                rows={6}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-300"
              />
              <p className="text-xs text-slate-400 mt-1.5">메모는 브라우저에 저장되며 새로고침 후에도 유지됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
