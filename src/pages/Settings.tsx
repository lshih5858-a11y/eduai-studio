import { useRef, useState, type ChangeEvent } from 'react'
import { AlertTriangle, Database, Download, FlaskConical, Upload } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { ConfirmModal } from '../components/common/ConfirmModal'
import { downloadJson, readJsonFile } from '../utils/download'
import type { ProjectData } from '../types'

const usageSteps = [
  '홈 화면에서 예시 과목을 불러오거나, 과목 설정에서 새 과목 정보를 입력합니다.',
  '16주 수업설계에서 자동으로 틀을 만들거나, 직접 주차별 내용을 작성합니다.',
  '퀴즈, 루브릭, 과제 피드백, AI 튜터 메뉴에서 필요한 자료를 만들고 저장합니다.',
  '저장 버튼을 누르면 이 컴퓨터의 브라우저에 자동으로 보관되며, 새로고침해도 그대로 남아있습니다.',
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
      notify('파일을 불러오는 데 실패했습니다. 저장한 파일이 맞는지 확인해주세요.')
    }
  }

  return (
    <div>
      <PageHeader title="설정 및 사용 안내" description="플랫폼을 쓰는 방법과 자료를 안전하게 보관하는 방법을 안내합니다." />

      <div className="space-y-6">
        <section className="rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
            <FlaskConical className="h-5 w-5 text-brand-600" aria-hidden="true" />
            이렇게 사용하세요
          </h2>
          <ol className="space-y-3 text-base leading-relaxed text-brand-700">
            {usageSteps.map((step, idx) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {idx + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
            <Database className="h-5 w-5 text-brand-600" aria-hidden="true" />
            자료는 어디에 보관되나요
          </h2>
          <p className="text-base leading-relaxed text-brand-700">
            별도의 서버나 데이터베이스를 사용하지 않고, 입력한 모든 내용은{' '}
            <strong>지금 사용 중인 이 컴퓨터의 웹브라우저 안</strong>에만 저장됩니다. 다른 컴퓨터나 다른 브라우저에서는
            보이지 않으니, 자료를 옮기고 싶다면 아래 버튼으로 파일을 저장해두었다가 불러오세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4" aria-hidden="true" />
              전체 자료 파일로 저장
            </Button>
            <Button onClick={handleImportClick}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              저장한 파일 불러오기
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
          </div>
          <div className="mt-5 border-t border-brand-100 pt-5">
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              전체 자료 초기화
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-accent-200 bg-accent-50 p-6 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-accent-900">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            사용 전 꼭 확인하세요
          </h2>
          <ul className="space-y-3 text-base leading-relaxed text-accent-900">
            <li>· 이 플랫폼은 실제 서비스가 아닌 <strong>교육용 시범(연습용) 버전</strong>입니다.</li>
            <li>· 이 버전은 실제 AI를 연결하지 않으며, "AI 활용"·"AI 튜터"에 나오는 내용은 모두 예시 응답입니다.</li>
            <li>· 학생 이름, 학번, 연락처 같은 실제 개인정보는 입력하지 마세요. 과제 피드백의 학생 답안은 모두 가상의 예시입니다.</li>
            <li>· 생성된 모든 문항·루브릭·피드백·AI 답변은 실제 수업에 쓰기 전 교수자가 반드시 검토하고 수정해야 합니다.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-6 sm:p-8">
          <h2 className="mb-3 text-lg font-semibold text-brand-900">만든 곳 소개</h2>
          <p className="text-base leading-relaxed text-brand-700">
            Edu AI Studio는 대학 교육 현장의 교수자를 돕기 위해 AI 기반 수업설계·평가·학습자료 제작 도구를
            연구·개발하는 교육공학 연구 프로젝트입니다.
          </p>
        </section>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="모든 자료를 초기화할까요?"
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
