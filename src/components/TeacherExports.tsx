import { useState } from "react";
import { weeklyPlan } from "../data/weeklyPlan";
import { aiTools } from "../data/aiTools";
import { missions } from "../data/missions";
import { rubrics } from "../data/rubrics";
import { quizzes } from "../data/quizzes";
import { CopyButton } from "./CopyButton";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface ExportSection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

function generateWeeklyPlanText() {
  return weeklyPlan
    .map(
      (w) =>
        `[${w.week}주차] ${w.topic}\n학습목표: ${w.objective}\n핵심개념: ${w.concepts.join(", ")}\n실습: ${w.activity}\nAI 도구: ${w.tools.join(", ")}\n과제: ${w.assignment}\n평가: ${w.evaluation}`
    )
    .join("\n\n---\n\n");
}

function generateToolGuideText() {
  return aiTools
    .map(
      (t) =>
        `[${t.name}]\n역할: ${t.role}\n주요 기능:\n${t.features.map((f) => `• ${f}`).join("\n")}\n추천 주차: ${
          t.applicableWeeks.length > 8 ? "전 주차" : t.applicableWeeks.join("주, ") + "주"
        }\n예시 프롬프트: "${t.examplePrompt}"`
    )
    .join("\n\n---\n\n");
}

function generateGammaPromptsText() {
  return weeklyPlan
    .map((w) => `[${w.week}주차: ${w.topic}]\n${w.gammaPrompt}`)
    .join("\n\n---\n\n");
}

function generateMissionCardsText() {
  return missions
    .map(
      (m) =>
        `[${m.week}주차 실습 미션] ${m.title}\n목표: ${m.goal}\n수행절차:\n${m.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\nAI 도구: ${m.tools.join(", ")}\n제출물: ${m.deliverable}\n평가기준: ${m.criteria}\n추천 프롬프트: "${m.recommendedPrompt}"`
    )
    .join("\n\n---\n\n");
}

function generateTutorExamplesText() {
  const examples = [
    { week: 3, q: "개념 설명해줘", a: "3주차는 고객 경험 관리입니다. 핵심은 고객이 서비스를 이용하기 전, 이용 중, 이용 후에 어떤 감정과 문제를 경험하는지 파악하는 것입니다. 고객여정맵은 고객의 행동, 접점, 감정, 불편사항을 단계별로 정리하는 도구입니다." },
    { week: 11, q: "고객불만 대응 시나리오 만들어줘", a: "상황: 고객이 예약 시간보다 30분 이상 기다려 불만을 제기했다. 직원은 먼저 사과하고, 대기 원인을 설명하며, 보상 또는 대안 서비스를 제시한다. 마지막으로 재방문 의사를 회복할 수 있도록 후속 피드백을 약속한다." },
    { week: 7, q: "7P 전략 분석 비교표 만들어줘", a: "서비스 마케팅 7P 분석표: Product(핵심 서비스), Price(가격 전략), Place(유통 채널), Promotion(촉진 활동), People(서비스 인력), Process(서비스 절차), Physical Evidence(물리적 환경)를 각각 정리합니다." },
    { week: 14, q: "서비스 혁신 아이디어 발표 프롬프트 만들어줘", a: "Gamma 프롬프트: 서비스 혁신 제안 발표자료를 만들어줘. 현재 문제점 분석, 디자인씽킹 적용, 혁신 아이디어 3가지, 실행 방안, 기대 효과를 포함한 10장 슬라이드로 구성해줘." },
  ];
  return examples
    .map((e) => `Q [${e.week}주차]: ${e.q}\nA: ${e.a}`)
    .join("\n\n---\n\n");
}

function generateQuizExamplesText() {
  return quizzes
    .slice(0, 15)
    .map(
      (q) =>
        `[${q.week}주차 / ${q.type}]\n${q.question}${
          q.options ? "\n" + q.options.map((o) => `${o.number}. ${o.text}`).join("\n") : ""
        }\n정답: ${q.answer}\n해설: ${q.explanation}`
    )
    .join("\n\n---\n\n");
}

function generateRubricsText() {
  return rubrics
    .map(
      (r) =>
        `[${r.title}]\n${r.description}\n\n${r.criteria.map((c) => `${c.name} (${c.points}점)\n우수: ${c.excellent}\n양호: ${c.good}\n보통: ${c.fair}\n미흡: ${c.poor}`).join("\n\n")}\n\n총점: ${r.totalPoints}점`
    )
    .join("\n\n========\n\n");
}

function generateCustomGPTJson() {
  const json = {
    system_prompt:
      "너는 서비스경영 수업을 돕는 AI 튜터 챗봇이다. 교수자와 학생의 질문에 친절하고 전문적으로 답변한다. 서비스경영 개념(서비스 품질, 고객경험, 서비스 디자인, 마케팅, 운영전략 등)을 명확하게 설명하고, 실제 사례와 연결지어 답변한다. 한국어로 답변하며, 필요 시 표나 리스트 형식을 활용한다.",
    weekly_plan: weeklyPlan.map((w) => ({
      week: w.week,
      topic: w.topic,
      objective: w.objective,
      concepts: w.concepts,
      tools: w.tools,
      assignment: w.assignment,
    })),
    ai_tools: aiTools.map((t) => ({
      name: t.name,
      role: t.role,
      applicableWeeks: t.applicableWeeks,
      examplePrompt: t.examplePrompt,
    })),
    student_faq: [
      { q: "서비스경영이 뭔가요?", a: "서비스경영은 서비스 품질 향상, 고객 만족, 서비스 운영 효율화를 다루는 경영학 분야입니다." },
      { q: "SERVQUAL이 뭔가요?", a: "고객의 기대와 인식 간의 차이(갭)로 서비스 품질을 측정하는 모델로, 5가지 차원(유형성, 신뢰성, 응답성, 확신성, 공감성)을 사용합니다." },
      { q: "고객여정맵을 어떻게 만드나요?", a: "고객 페르소나 설정 → 여정 단계 구분 → 각 단계별 행동/감정/터치포인트 기록 → 페인포인트 도출 → 시각화 순서로 제작합니다." },
      { q: "서비스 실패 후 어떻게 대응해야 하나요?", a: "즉각적인 사과 → 원인 파악 → 보상/해결책 제시 → 재발 방지 약속 순서로 서비스 회복 프로세스를 진행합니다." },
      { q: "AI 도구를 수업에 어떻게 활용하나요?", a: "GPT(개념 정리, 보고서 초안), Gamma(발표자료), Napkin(시각화), Felo(시뮬레이션), Genspark(인터뷰 대본), Geminiami(퀴즈 생성)를 각 과제 특성에 맞게 활용하세요." },
    ],
    rubrics: rubrics.map((r) => ({
      title: r.title,
      totalPoints: r.totalPoints,
      criteria: r.criteria.map((c) => ({ name: c.name, points: c.points })),
    })),
  };
  return JSON.stringify(json, null, 2);
}

export function TeacherExports() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["weekly"]));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sections: ExportSection[] = [
    { id: "weekly", title: "16주차 수업계획서", icon: "📅", content: generateWeeklyPlanText() },
    { id: "tools", title: "AI 도구별 활용 가이드", icon: "🤖", content: generateToolGuideText() },
    { id: "gamma", title: "주차별 Gamma 발표자료 프롬프트", icon: "🎨", content: generateGammaPromptsText() },
    { id: "missions", title: "주차별 실습 미션 카드", icon: "🎯", content: generateMissionCardsText() },
    { id: "tutor", title: "학생용 AI 튜터 질문 예시", icon: "💬", content: generateTutorExamplesText() },
    { id: "quizzes", title: "중간·기말 퀴즈 예시", icon: "❓", content: generateQuizExamplesText() },
    { id: "rubrics", title: "평가 루브릭", icon: "📋", content: generateRubricsText() },
    { id: "json", title: "Custom GPT 지식탭 업로드용 JSON", icon: "⚙️", content: generateCustomGPTJson() },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">교수자 출력자료</h2>
          <p className="text-sm text-slate-500">수업 운영에 필요한 모든 자료를 펼침/접기로 확인하고 복사하세요.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">교수자 출력자료 활용 안내</p>
            <p className="text-xs text-blue-600 mt-1 leading-relaxed">
              각 항목의 내용을 복사하여 LMS, 수업 자료집, Custom GPT 지식탭에 활용할 수 있습니다.
              JSON 파일은 ChatGPT Custom GPT의 Knowledge 탭에 업로드하여 수업 전용 챗봇을 구성할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <div key={section.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-xl flex-shrink-0">{section.icon}</span>
                <span className="flex-1 font-semibold text-slate-800">{section.title}</span>
                <span className="text-slate-400 flex-shrink-0">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100">
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <span className="text-xs text-slate-500">{section.content.length.toLocaleString()}자</span>
                    <CopyButton text={section.content} label="전체 복사" size="md" />
                  </div>
                  <div className="p-5">
                    {section.id === "json" ? (
                      <pre className="text-xs text-slate-700 bg-slate-950 text-green-300 p-4 rounded-lg overflow-x-auto font-mono leading-relaxed max-h-96 overflow-y-auto">
                        {section.content}
                      </pre>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                          {section.content}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
