import { useState } from "react";
import { weeklyPlan } from "../data/weeklyPlan";
import { aiTools } from "../data/aiTools";
import { missions } from "../data/missions";
import { rubrics } from "../data/rubrics";
import { quizzes } from "../data/quizzes";
import { CopyButton } from "./CopyButton";
import { ChevronDown, ChevronUp, FileText, Info } from "lucide-react";

interface ExportSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  content: string;
  isCode?: boolean;
}

function generateWeeklyPlanText() {
  return weeklyPlan
    .map(
      (w) =>
        `[${w.week}주차] ${w.topic}
학습목표: ${w.objective}
핵심개념: ${w.concepts.join(", ")}
실습활동: ${w.activity}
AI 도구: ${w.tools.join(", ")}
과제: ${w.assignment}
평가: ${w.evaluation}`
    )
    .join("\n\n---\n\n");
}

function generateToolGuideText() {
  return aiTools
    .map(
      (t) =>
        `[${t.name}]
역할: ${t.role}
주요 기능:
${t.features.map((f) => `  • ${f}`).join("\n")}
추천 주차: ${t.applicableWeeks.length > 8 ? "전 주차 (1~16주)" : t.applicableWeeks.join("주, ") + "주"}
예시 프롬프트: "${t.examplePrompt}"`
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
        `[${m.week}주차 실습 미션] ${m.title}
목표: ${m.goal}
수행절차:
${m.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}
AI 도구: ${m.tools.join(", ")}
제출물: ${m.deliverable}
평가기준: ${m.criteria}
추천 프롬프트: "${m.recommendedPrompt}"`
    )
    .join("\n\n---\n\n");
}

function generateTutorExamplesText() {
  const examples = [
    { week: 3, q: "3주차 개념 설명해줘", a: "3주차는 고객 경험 관리입니다. 핵심은 고객이 서비스를 이용하기 전, 이용 중, 이용 후에 어떤 감정과 문제를 경험하는지 파악하는 것입니다. 고객여정맵은 고객의 행동, 접점, 감정, 불편사항을 단계별로 정리하는 도구입니다." },
    { week: 7, q: "7주차 발표자료 프롬프트 만들어줘", a: "Gamma 프롬프트: 서비스 마케팅 7P 전략을 주제로 발표자료를 만들어줘. Product, Price, Place, Promotion, People, Process, Physical Evidence 각각을 스타벅스 사례로 설명하는 10장 슬라이드를 구성해줘." },
    { week: 11, q: "11주차 고객불만 대응 시나리오 만들어줘", a: "상황: 고객이 예약 시간보다 30분 이상 기다려 불만을 제기했다. 직원은 먼저 사과하고, 대기 원인을 설명하며, 보상 또는 대안 서비스를 제시한다. 마지막으로 재방문 의사를 회복할 수 있도록 후속 피드백을 약속한다." },
    { week: 14, q: "14주차 서비스 혁신 아이디어 전략 비교표 만들어줘", a: "| 전략 요소 | 점진적 혁신 | 급진적 혁신 | 핵심 차이 |\n|---------|-----------|------------|--------|\n| 위험도 | 낮음 | 높음 | 불확실성 |\n| 투자 규모 | 소규모 | 대규모 | 자원 소요 |\n| 시장 반응 | 예측 가능 | 불확실 | 고객 수용성 |" },
  ];
  return examples
    .map((e) => `Q [${e.week}주차]: ${e.q}\nA: ${e.a}`)
    .join("\n\n---\n\n");
}

function generateQuizExamplesText() {
  return quizzes
    .slice(0, 20)
    .map(
      (q) =>
        `[${q.week}주차 / ${q.type}]
${q.question}${q.options ? "\n" + q.options.map((o) => `${o.number}. ${o.text}`).join("\n") : ""}
정답: ${q.answer}
해설: ${q.explanation}`
    )
    .join("\n\n---\n\n");
}

function generateRubricsText() {
  return rubrics
    .map(
      (r) =>
        `[${r.title}]
${r.description}

${r.criteria
  .map(
    (c) =>
      `${c.name} (${c.points}점)
  우수: ${c.excellent}
  양호: ${c.good}
  보통: ${c.fair}
  미흡: ${c.poor}`
  )
  .join("\n\n")}

총점: ${r.totalPoints}점`
    )
    .join("\n\n========\n\n");
}

function generateCustomGPTJson(): string {
  const json = {
    system_prompt:
      "너는 서비스경영 수업을 돕는 AI 튜터 챗봇이다. 교수자와 학생의 질문에 친절하고 전문적으로 답변한다. 서비스경영 개념(서비스 품질, 고객경험, 서비스 디자인, 마케팅, 운영전략 등)을 명확하게 설명하고, 실제 사례와 연결지어 답변한다. 한국어로 답변하며, 필요 시 표나 리스트 형식을 활용한다. AI 도구(GPT, Gamma, Napkin, Felo, Genspark, Geminiami)를 수업에 효과적으로 활용하는 방법도 안내한다.",
    course_info: {
      name: "서비스경영",
      weeks: 16,
      ai_tools: ["GPT", "Gamma", "Napkin", "Felo", "Genspark", "Geminiami"],
      platform: "EduAI Studio 연구소",
    },
    weekly_plan: weeklyPlan.map((w) => ({
      week: w.week,
      topic: w.topic,
      objective: w.objective,
      concepts: w.concepts,
      tools: w.tools,
      assignment: w.assignment,
      evaluation: w.evaluation,
      gamma_prompt: w.gammaPrompt,
    })),
    ai_tools: aiTools.map((t) => ({
      name: t.name,
      role: t.role,
      features: t.features,
      applicable_weeks: t.applicableWeeks,
      example_prompt: t.examplePrompt,
      tips: t.tips,
    })),
    student_faq: [
      { question: "서비스경영이 뭔가요?", answer: "서비스경영은 서비스 품질 향상, 고객 만족, 서비스 운영 효율화를 다루는 경영학 분야입니다." },
      { question: "SERVQUAL이 뭔가요?", answer: "고객의 기대와 인식 간의 차이(갭)로 서비스 품질을 측정하는 모델로, 5가지 차원(유형성, 신뢰성, 응답성, 확신성, 공감성)을 사용합니다." },
      { question: "고객여정맵을 어떻게 만드나요?", answer: "고객 페르소나 설정 → 여정 단계 구분 → 각 단계별 행동/감정/터치포인트 기록 → 페인포인트 도출 → 시각화 순서로 제작합니다." },
      { question: "서비스 실패 후 어떻게 대응해야 하나요?", answer: "즉각적인 사과 → 원인 파악 → 보상/해결책 제시 → 재발 방지 약속 순서로 서비스 회복 프로세스를 진행합니다." },
      { question: "AI 도구를 수업에 어떻게 활용하나요?", answer: "GPT(개념 정리, 보고서 초안), Gamma(발표자료), Napkin(시각화), Felo(시뮬레이션), Genspark(인터뷰 대본), Geminiami(퀴즈 생성)를 각 과제 특성에 맞게 활용하세요." },
    ],
    rubrics: rubrics.map((r) => ({
      title: r.title,
      total_points: r.totalPoints,
      criteria: r.criteria.map((c) => ({
        name: c.name,
        points: c.points,
        levels: {
          excellent: c.excellent,
          good: c.good,
          fair: c.fair,
          poor: c.poor,
        },
      })),
    })),
    sample_quizzes: quizzes.slice(0, 16).map((q) => ({
      week: q.week,
      type: q.type,
      question: q.question,
      answer: q.answer,
      explanation: q.explanation,
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
    {
      id: "weekly",
      title: "16주차 수업계획서",
      icon: "📅",
      description: "LMS 업로드, 학생 배포용 전체 수업계획서",
      content: generateWeeklyPlanText(),
    },
    {
      id: "tools",
      title: "AI 도구별 활용 가이드",
      icon: "🤖",
      description: "6가지 AI 도구의 역할, 활용법, 예시 프롬프트",
      content: generateToolGuideText(),
    },
    {
      id: "gamma",
      title: "주차별 Gamma 발표자료 프롬프트",
      icon: "🎨",
      description: "16주차 전체 Gamma 슬라이드 생성 프롬프트 모음",
      content: generateGammaPromptsText(),
    },
    {
      id: "missions",
      title: "주차별 실습 미션 카드",
      icon: "🎯",
      description: "16개 실습 미션 (목표, 절차, 추천 프롬프트 포함)",
      content: generateMissionCardsText(),
    },
    {
      id: "tutor",
      title: "학생용 AI 튜터 질문 예시",
      icon: "💬",
      description: "학생들이 자주 묻는 질문 유형별 예시 답변",
      content: generateTutorExamplesText(),
    },
    {
      id: "quizzes",
      title: "중간·기말 퀴즈 예시",
      icon: "❓",
      description: "OX·객관식·단답형·사례형 주요 퀴즈 20선",
      content: generateQuizExamplesText(),
    },
    {
      id: "rubrics",
      title: "평가 루브릭 4종",
      icon: "📋",
      description: "사례분석·고객여정맵·서비스회복·팀발표 100점 기준 루브릭",
      content: generateRubricsText(),
    },
    {
      id: "json",
      title: "Custom GPT 지식탭 업로드용 JSON",
      icon: "⚙️",
      description: "ChatGPT Custom GPT Knowledge 탭에 업로드하여 수업 전용 챗봇 구성",
      content: generateCustomGPTJson(),
      isCode: true,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">교수자 출력자료</h2>
        <p className="text-sm text-slate-500">수업 운영에 필요한 모든 자료를 펼침/접기로 확인하고 복사하세요.</p>
      </div>

      {/* 안내 카드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">교수자 출력자료 활용 안내</p>
            <div className="space-y-0.5 text-xs text-blue-700 leading-relaxed">
              <p>• LMS 수업계획서 업로드: <strong>16주차 수업계획서</strong> 복사 후 LMS에 붙여넣기</p>
              <p>• Custom GPT 챗봇 구성: <strong>JSON 파일</strong>을 ChatGPT Custom GPT → Knowledge 탭에 업로드</p>
              <p>• Gamma 슬라이드 제작: <strong>Gamma 프롬프트</strong> 복사 후 gamma.app에 입력</p>
              <p>• 학생 배포용: <strong>실습 미션 카드</strong> 및 <strong>평가 루브릭</strong>을 출력 또는 공유</p>
            </div>
          </div>
        </div>
      </div>

      {/* 섹션 목록 */}
      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          const charCount = section.content.length;
          const lineCount = section.content.split("\n").length;

          return (
            <div
              key={section.id}
              className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                isOpen ? "border-blue-300" : "border-slate-200"
              }`}
            >
              {/* 섹션 헤더 */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-xl flex-shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{section.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{section.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {section.isCode && (
                    <span className="hidden sm:inline text-[10px] bg-slate-800 text-green-400 px-2 py-0.5 rounded font-mono font-bold">
                      JSON
                    </span>
                  )}
                  <span className="text-slate-400">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>
              </button>

              {/* 섹션 내용 */}
              {isOpen && (
                <div className="border-t border-slate-100">
                  {/* 툴바 */}
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <FileText size={11} />
                        {charCount.toLocaleString()}자
                      </span>
                      <span>{lineCount.toLocaleString()}줄</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.isCode && (
                        <span className="text-xs text-slate-500">JSON 파일로 저장 후 ChatGPT Custom GPT에 업로드</span>
                      )}
                      <CopyButton text={section.content} label="전체 복사" size="md" />
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="p-5">
                    {section.isCode ? (
                      /* ── JSON 코드 블록 ── */
                      <div className="relative">
                        <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-slate-700">
                          {/* 코드 블록 헤더 */}
                          <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                              </div>
                              <span className="text-xs text-slate-400 font-mono ml-2">custom-gpt-knowledge.json</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-mono">JSON</span>
                              <CopyButton text={section.content} label="복사" />
                            </div>
                          </div>
                          {/* 코드 내용 */}
                          <div className="overflow-auto max-h-[480px]">
                            <pre className="px-5 py-4 text-[12px] text-emerald-300 font-mono leading-relaxed whitespace-pre">
                              {section.content}
                            </pre>
                          </div>
                        </div>
                        {/* JSON 사용 안내 */}
                        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                          <p className="font-semibold text-slate-700">📌 Custom GPT 적용 방법</p>
                          <p>1. 위 JSON 내용을 복사합니다.</p>
                          <p>2. 텍스트 편집기(메모장 등)에 붙여넣고 <code className="bg-slate-200 px-1 rounded">knowledge.json</code> 으로 저장합니다.</p>
                          <p>3. ChatGPT → Explore GPTs → Create → Knowledge 탭에 파일을 업로드합니다.</p>
                          <p>4. <code className="bg-slate-200 px-1 rounded">system_prompt</code> 내용을 Instructions에 붙여넣어 챗봇을 완성합니다.</p>
                        </div>
                      </div>
                    ) : (
                      /* ── 일반 텍스트 블록 ── */
                      <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50">
                        <pre className="px-4 py-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
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

      {/* 일괄 안내 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">📎 저작권 안내:</span>{" "}
          본 출력자료는 서비스경영 수업설계 및 교육 목적에 한해 자유롭게 활용할 수 있습니다.
          상업적 목적이나 타 기관 제출 시에는 출처(EduAI Studio 연구소)를 명시해 주세요.
        </p>
      </div>
    </div>
  );
}
