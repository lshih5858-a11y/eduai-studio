import {
  BookOpenCheck,
  CalendarRange,
  ClipboardList,
  GraduationCap,
  Sparkles,
  Stethoscope,
  Table2,
  Users,
} from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { serviceManagementPackage, nursingPackage } from '../data/exampleData'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import type { MenuKey } from '../types'

interface HomeProps {
  onNavigate: (key: MenuKey) => void
}

const featureCards: { key: MenuKey; title: string; description: string; icon: typeof CalendarRange }[] = [
  { key: 'courseSetup', title: '과목 설정', description: '전공, 학년, 학점 등 과목의 기본 정보를 입력합니다.', icon: GraduationCap },
  { key: 'weeklyPlan', title: '16주 수업설계', description: '주차별 학습목표, 교수·학생 활동을 설계합니다.', icon: CalendarRange },
  { key: 'quiz', title: '퀴즈 생성기', description: 'OX, 객관식, 단답형, 사례형 문항을 만듭니다.', icon: BookOpenCheck },
  { key: 'rubric', title: '루브릭 생성기', description: '평가 영역별 배점과 성취수준을 설계합니다.', icon: Table2 },
  { key: 'feedback', title: '과제 피드백', description: '가상 학생 답안에 대한 피드백 예시를 검토합니다.', icon: ClipboardList },
  { key: 'aiTutor', title: 'AI 튜터', description: '전공별 질문과 시범 답변 자료를 살펴봅니다.', icon: Sparkles },
]

export function Home({ onNavigate }: HomeProps) {
  const { data, loadExample } = useProjectData()

  const totalWeeksFilled = data.weeklyPlan.filter((w) => w.topic && !w.topic.includes('주차 주제를 입력')).length
  const sections = [
    { label: '과목 설정', done: Boolean(data.courseInfo) },
    { label: '16주 수업설계', done: totalWeeksFilled >= 16 },
    { label: '퀴즈 생성기', done: data.quizSets.some((s) => s.items.length > 0) },
    { label: '루브릭 생성기', done: data.rubrics.length > 0 },
    { label: '과제 피드백', done: data.feedbackSets.length > 0 },
    { label: 'AI 튜터', done: data.tutorQuestions.length > 0 },
  ]
  const progress = Math.round((sections.filter((s) => s.done).length / sections.length) * 100)

  return (
    <div>
      <PageHeader
        title="Edu AI Studio 교수지원 플랫폼"
        description="대학 교수자를 위한 AI 기반 수업설계·평가·학습자료 제작 시범 플랫폼입니다. 16주 수업계획부터 퀴즈, 루브릭, 과제 피드백, AI 튜터 자료까지 한 곳에서 만들고 저장하세요."
      />

      <section className="mb-8 rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-brand-900">전체 진행률</h2>
            <p className="mt-1 text-xs text-brand-500">과목 설정부터 AI 튜터 자료까지 6개 영역 기준입니다.</p>
          </div>
          <span className="text-2xl font-bold text-brand-700">{progress}%</span>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-brand-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {sections.map((s) => (
            <span
              key={s.label}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                s.done ? 'bg-brand-100 text-brand-700' : 'bg-brand-50 text-brand-400'
              }`}
            >
              {s.done ? '✓ ' : '· '}
              {s.label}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-brand-950">핵심 기능</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => onNavigate(card.key)}
                className="flex flex-col items-start rounded-2xl border border-brand-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-brand-950">{card.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-brand-600">{card.description}</p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-brand-950">예시 과목 불러오기</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-brand-950">서비스경영 예시</h3>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-brand-600">
              서비스 특성, 고객경험, SERVQUAL, 서비스 실패와 회복, AI 서비스 혁신 등을 반영한 16주 예시 데이터입니다.
            </p>
            <Button variant="primary" onClick={() => loadExample(serviceManagementPackage)}>
              서비스경영 예시 불러오기
            </Button>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-brand-950">기본간호학 예시</h3>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-brand-600">
              활력징후, 감염관리, 무균술, 투약 5 Rights, OSCE 평가 등을 반영한 16주 예시 데이터입니다.
            </p>
            <Button variant="primary" onClick={() => loadExample(nursingPackage)}>
              기본간호학 예시 불러오기
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-brand-950">최근 저장 프로젝트</h2>
        {data.courseInfo ? (
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-brand-950">
                  {data.courseInfo.courseName || '(과목명 미입력)'}
                </p>
                <p className="mt-1 text-xs text-brand-500">
                  {data.courseInfo.major} · {data.courseInfo.grade} · {data.courseInfo.credit}
                </p>
                <p className="mt-1 text-xs text-brand-400">
                  마지막 저장: {new Date(data.updatedAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <Button variant="primary" onClick={() => onNavigate('courseSetup')}>
                이어서 작업하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 p-6 text-center text-sm text-brand-600">
            아직 저장된 프로젝트가 없습니다. 과목 설정에서 새로 시작하거나 예시 과목을 불러오세요.
          </div>
        )}
      </section>
    </div>
  )
}
