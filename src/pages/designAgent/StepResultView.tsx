import type { AgentStepState, QuizzesResult, RubricsResult, WeeklyPlanResult } from '../../types/agent'
import { renderStepResultText } from '../../services/aiAgent/renderText'

interface StepResultViewProps {
  step: AgentStepState
}

function WeeklyPlanTable({ result }: { result: WeeklyPlanResult }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand-100">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-brand-50">
          <tr>
            {['주차', '주제', '핵심개념', '교수활동', '학생활동', 'AI 활용', '평가'].map((h) => (
              <th key={h} className="border-b border-brand-100 px-3 py-2 font-semibold text-brand-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.weeks.map((w) => (
            <tr key={w.week} className={w.isExamWeek ? 'bg-accent-50/50' : ''}>
              <td className="border-b border-brand-50 px-3 py-2 font-semibold text-brand-900">{w.week}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-900">{w.topic}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-600">{w.coreConcepts}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-600">{w.teachingActivities}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-600">{w.studentActivities}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-600">{w.aiUsage}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-600">{w.evaluation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RubricsTable({ result }: { result: RubricsResult }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand-100">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-brand-50">
          <tr>
            {['평가영역', '가중치', '우수', '양호', '보통', '미흡'].map((h) => (
              <th key={h} className="border-b border-brand-100 px-3 py-2 font-semibold text-brand-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.criteria.map((c) => (
            <tr key={c.id}>
              <td className="border-b border-brand-50 px-3 py-2 font-semibold text-brand-900">{c.area}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-900">{c.weight}%</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-600">{c.excellent}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-600">{c.good}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-600">{c.fair}</td>
              <td className="border-b border-brand-50 px-3 py-2 text-brand-600">{c.poor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QuizList({ result }: { result: QuizzesResult }) {
  return (
    <div className="space-y-3">
      {result.items.map((q, idx) => (
        <div key={q.id} className="rounded-xl border border-brand-100 bg-white p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">문항 {idx + 1}</span>
            <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-800">
              {q.type} · {q.difficulty}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-brand-900">{q.question}</p>
          {q.options && (
            <ul className="mt-2 list-inside list-disc text-sm text-brand-600">
              {q.options.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm font-medium text-brand-700">정답: {q.answer}</p>
          <p className="text-sm text-brand-500">해설: {q.explanation}</p>
        </div>
      ))}
    </div>
  )
}

export function StepResultView({ step }: StepResultViewProps) {
  if (step.manualOverrideText) {
    return <pre className="whitespace-pre-wrap rounded-xl border border-brand-100 bg-white p-4 text-sm text-brand-800">{step.manualOverrideText}</pre>
  }
  if (!step.result) return null

  if (step.key === 'weeklyPlan') return <WeeklyPlanTable result={step.result as WeeklyPlanResult} />
  if (step.key === 'rubrics') return <RubricsTable result={step.result as RubricsResult} />
  if (step.key === 'quizzes') return <QuizList result={step.result as QuizzesResult} />

  return (
    <pre className="whitespace-pre-wrap rounded-xl border border-brand-100 bg-white p-4 text-sm leading-relaxed text-brand-800">
      {renderStepResultText(step.key, step.result)}
    </pre>
  )
}
