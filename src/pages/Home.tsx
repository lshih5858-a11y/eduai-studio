import { Stethoscope, Users } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { serviceManagementPackage, nursingPackage } from '../data/exampleData'
import { Button } from '../components/common/Button'
import type { MenuKey } from '../types'

interface HomeProps {
  onNavigate: (key: MenuKey) => void
}

export function Home({ onNavigate }: HomeProps) {
  const { data, loadExample } = useProjectData()

  const totalWeeksFilled = data.weeklyPlan.filter((w) => w.topic && !w.topic.includes('주차 주제를 입력')).length
  const doneCount = [
    Boolean(data.courseInfo),
    totalWeeksFilled >= 16,
    data.quizSets.some((s) => s.items.length > 0),
    data.rubrics.length > 0,
    data.feedbackSets.length > 0,
    data.tutorQuestions.length > 0,
  ].filter(Boolean).length
  const progress = Math.round((doneCount / 6) * 100)

  return (
    <div>
      {/* 첫 화면 안내: 이 플랫폼이 무엇인지 한 문장으로만 설명한다 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-950 sm:text-4xl">환영합니다</h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-brand-700">
          왼쪽 메뉴에서 원하는 작업(수업설계, 퀴즈, 루브릭 등)을 바로 선택하거나, 아래에서 시작해 보세요.
        </p>
      </div>

      {/* 핵심 동작 한 가지: 이어서 작업하기, 또는 새로 시작하기 */}
      {data.courseInfo ? (
        <section className="mb-6 rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
          <p className="text-sm font-medium text-brand-500">최근 작업 중인 과목</p>
          <h2 className="mt-1 text-2xl font-bold text-brand-950">
            {data.courseInfo.courseName || '(과목명 미입력)'}
          </h2>
          <p className="mt-1 text-base text-brand-600">
            {data.courseInfo.major} · {data.courseInfo.grade} · {data.courseInfo.credit}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-100">
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="shrink-0 text-sm font-semibold text-brand-700">전체 준비 {progress}%</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => onNavigate('courseSetup')}>
              이어서 작업하기
            </Button>
            <span className="text-sm text-brand-400">
              마지막 저장: {new Date(data.updatedAt).toLocaleString('ko-KR')}
            </span>
          </div>
        </section>
      ) : (
        <section className="mb-6 rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-brand-950">새 과목을 시작해 볼까요?</h2>
          <p className="mt-2 text-base leading-relaxed text-brand-700">
            과목의 기본 정보만 입력하면 16주 수업설계, 퀴즈, 평가표까지 순서대로 만들 수 있습니다.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => onNavigate('courseSetup')}>
              과목 설정 시작하기
            </Button>
          </div>
        </section>
      )}

      {/* 보조 동작: 예시 과목 둘러보기 (덜 중요하므로 한 단계 낮은 위계) */}
      <section className="rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-brand-900">예시 과목으로 미리 둘러보기</h2>
        <p className="mt-1.5 text-base text-brand-600">
          이미 만들어진 16주 수업자료를 불러와 화면 구성을 먼저 확인할 수 있습니다.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => loadExample(serviceManagementPackage)} className="flex-1 justify-center py-3">
            <Users className="h-4 w-4" aria-hidden="true" />
            서비스경영 예시 불러오기
          </Button>
          <Button onClick={() => loadExample(nursingPackage)} className="flex-1 justify-center py-3">
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
            기본간호학 예시 불러오기
          </Button>
        </div>
        {data.courseInfo && (
          <p className="mt-3 text-sm text-brand-400">※ 예시를 불러오면 현재 작성 중인 내용이 대체됩니다.</p>
        )}
      </section>
    </div>
  )
}
