import { useRef, useState, type ChangeEvent } from 'react'
import { AlertTriangle, Database, Download, FlaskConical, ShieldOff, Upload, UserCheck } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { ConfirmModal } from '../components/common/ConfirmModal'
import { downloadJson, readJsonFile } from '../utils/download'
import type { ProjectData } from '../types'

const usageSteps = [
  '홈 화면에서 예시 과목(서비스경영, 기본간호학)을 불러오거나 과목 설정에서 새 과목 정보를 입력합니다.',
  '16주 수업설계에서 자동 예시를 생성하거나 직접 주차별 내용을 작성합니다.',
  '퀴즈 생성기, 루브릭 생성기, 과제 피드백, AI 튜터 메뉴에서 필요한 자료를 만들고 저장합니다.',
  '모든 입력 내용은 저장 버튼을 누르면 브라우저에 자동으로 보관되며, 새로고침 후에도 유지됩니다.',
  '설정 메뉴에서 전체 데이터를 JSON으로 내보내거나 불러올 수 있습니다.',
]

export function Settings() {
  const { data, resetAll, importData, notify } = useProjectData()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const handleExport = () => {
    downloadJson(data, `eduai-studio-백업-${new Date().toISOString().slice(0, 10)}.json`)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const parsed = await readJsonFile<ProjectData>(file)
      importData(parsed)
    } catch {
      notify('파일을 불러오는 데 실패했습니다. 올바른 JSON 파일인지 확인해주세요.')
    }
  }

  return (
    <div>
      <PageHeader title="설정 및 사용 안내" description="플랫폼 사용 방법과 데이터 저장 방식을 안내합니다." />

      <div className="space-y-6">
        <section className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-900">
            <FlaskConical className="h-4 w-4 text-brand-600" aria-hidden="true" />
            플랫폼 사용 방법
          </h2>
          <ol className="space-y-2 text-sm text-brand-700">
            {usageSteps.map((step, idx) => (
              <li key={step} className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {idx + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-900">
            <Database className="h-4 w-4 text-brand-600" aria-hidden="true" />
            데이터 저장 방식
          </h2>
          <p className="text-sm leading-relaxed text-brand-700">
            이 플랫폼은 외부 데이터베이스나 서버를 사용하지 않으며, 입력한 모든 정보는 현재 사용 중인 브라우저의{' '}
            <strong>localStorage</strong>에만 저장됩니다. 다른 기기나 브라우저에서는 데이터가 공유되지 않으므로,
            데이터를 옮기려면 아래의 내보내기/불러오기 기능을 이용하세요.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4" aria-hidden="true" />
              데이터 내보내기 (JSON)
            </Button>
            <Button onClick={handleImportClick}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              데이터 불러오기 (JSON)
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
          </div>
          <div className="mt-4 border-t border-brand-100 pt-4">
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              전체 데이터 초기화
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-accent-200 bg-accent-50 p-5 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-accent-900">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            교육용 시범 플랫폼 안내
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed text-accent-900">
            <li>이 플랫폼은 대학 교수자를 위한 교육용 시범(프로토타입) 플랫폼이며, 실제 서비스 운영을 위한 것이 아닙니다.</li>
            <li>모든 문항, 루브릭, 피드백, AI 튜터 답변 등은 예시 자료이며, 실제 강의에 활용하기 전 반드시 검토해야 합니다.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-900">
            <ShieldOff className="h-4 w-4" aria-hidden="true" />
            개인정보 입력 금지
          </h2>
          <p className="text-sm leading-relaxed text-red-900">
            학생 이름, 학번, 연락처 등 실제 개인정보는 입력하지 마세요. 과제 피드백 메뉴의 학생 답안은 모두 가상의
            예시이며, 실제 학생 데이터를 대체하지 않습니다.
          </p>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-900">
            <UserCheck className="h-4 w-4 text-brand-600" aria-hidden="true" />
            AI 결과에 대한 안내
          </h2>
          <p className="text-sm leading-relaxed text-brand-700">
            본 버전에서는 실제 외부 AI API를 호출하지 않으며, 모든 "AI 활용" 관련 결과는 시범을 위한 예시입니다. AI가
            제안한 모든 결과물은 교수자가 반드시 검토하고 수정한 뒤 활용해야 합니다.
          </p>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
          <h2 className="mb-3 text-sm font-semibold text-brand-900">연구소 소개</h2>
          <p className="text-sm leading-relaxed text-brand-700">
            Edu AI Studio는 대학 교육 현장의 교수자를 지원하기 위해 AI 기반 수업설계·평가·학습자료 제작 도구를
            연구·개발하는 교육공학 연구 프로젝트입니다. 본 시범 플랫폼은 교수자의 업무 부담을 줄이고 학습자 중심의
            수업 설계를 돕기 위한 목적으로 제작되었습니다.
          </p>
        </section>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="모든 데이터를 초기화할까요?"
        description="과목 설정, 16주 수업설계, 퀴즈, 루브릭, 과제 피드백, AI 튜터 자료가 모두 삭제되며 되돌릴 수 없습니다."
        confirmLabel="전체 초기화"
        onConfirm={() => {
          resetAll()
          setConfirmReset(false)
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
