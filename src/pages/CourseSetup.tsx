import { useEffect, useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { Tabs } from '../components/common/Tabs'
import { TextField, TextareaField, SelectField } from '../components/common/FormField'
import { Button } from '../components/common/Button'
import type { CourseInfo } from '../types'

const emptyCourseInfo: CourseInfo = {
  major: '',
  courseName: '',
  grade: '1학년',
  credit: '3학점',
  hoursPerWeek: '3시간',
  courseType: '이론+실습',
  overview: '',
  objectives: '',
  evaluationMethod: '',
  textbooks: '',
  updatedAt: '',
}

const tabs = [
  { key: 'basic', label: '1. 기본 정보' },
  { key: 'detail', label: '2. 세부 내용' },
]

export function CourseSetup() {
  const { data, setCourseInfo } = useProjectData()
  const [form, setForm] = useState<CourseInfo>(data.courseInfo ?? emptyCourseInfo)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    setForm(data.courseInfo ?? emptyCourseInfo)
  }, [data.courseInfo])

  const update = <K extends keyof CourseInfo>(key: K, value: CourseInfo[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setCourseInfo({ ...form, updatedAt: new Date().toISOString() })
  }

  return (
    <div>
      <PageHeader
        title="과목 설정"
        description="과목의 기본 정보를 입력하세요. 여기서 저장한 내용은 수업설계, 퀴즈, 평가표를 만들 때 함께 사용됩니다."
      />

      <form onSubmit={handleSubmit}>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} idPrefix="course-setup" />

        <div
          className="rounded-2xl border border-brand-100 bg-white p-6 sm:p-8"
          role="tabpanel"
          id={`course-setup-panel-${activeTab}`}
          aria-labelledby={`course-setup-tab-${activeTab}`}
        >
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextField
                label="전공"
                htmlFor="major"
                required
                placeholder="예: 경영학과"
                value={form.major}
                onChange={(e) => update('major', e.target.value)}
              />
              <TextField
                label="과목명"
                htmlFor="courseName"
                required
                placeholder="예: 서비스경영"
                value={form.courseName}
                onChange={(e) => update('courseName', e.target.value)}
              />
              <SelectField
                label="학년"
                htmlFor="grade"
                value={form.grade}
                onChange={(e) => update('grade', e.target.value)}
              >
                {['1학년', '2학년', '3학년', '4학년'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="학점"
                htmlFor="credit"
                value={form.credit}
                onChange={(e) => update('credit', e.target.value)}
              >
                {['1학점', '2학점', '3학점', '4학점'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="주당 수업시간"
                htmlFor="hoursPerWeek"
                placeholder="예: 3시간, 이론 2시간 + 실습 2시간"
                value={form.hoursPerWeek}
                onChange={(e) => update('hoursPerWeek', e.target.value)}
              />
              <SelectField
                label="수업 형태"
                htmlFor="courseType"
                value={form.courseType}
                onChange={(e) => update('courseType', e.target.value)}
              >
                {['이론', '실습', '이론+실습', '온라인', '블렌디드'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
            </div>
          )}

          {activeTab === 'detail' && (
            <div className="space-y-6">
              <TextareaField
                label="교과목 개요"
                htmlFor="overview"
                hint="이 과목이 무엇을 다루는 과목인지 간단히 설명해주세요."
                rows={4}
                placeholder="과목의 목적과 다루는 범위를 서술하세요."
                value={form.overview}
                onChange={(e) => update('overview', e.target.value)}
              />
              <TextareaField
                label="학습 목표"
                htmlFor="objectives"
                hint="학생이 이 과목을 마쳤을 때 할 수 있어야 하는 것을 적어주세요."
                rows={4}
                placeholder="학습자가 이 과목을 통해 도달해야 할 목표를 서술하세요."
                value={form.objectives}
                onChange={(e) => update('objectives', e.target.value)}
              />
              <TextareaField
                label="평가 방법"
                htmlFor="evaluationMethod"
                rows={3}
                placeholder="예: 중간고사 30%, 기말고사 30%, 과제 20%, 참여도 20%"
                value={form.evaluationMethod}
                onChange={(e) => update('evaluationMethod', e.target.value)}
              />
              <TextareaField
                label="교재 및 참고자료"
                htmlFor="textbooks"
                rows={3}
                placeholder="주교재 및 참고자료를 입력하세요."
                value={form.textbooks}
                onChange={(e) => update('textbooks', e.target.value)}
              />
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse items-start gap-3 border-t border-brand-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-brand-400">
              {data.courseInfo?.updatedAt
                ? `마지막 저장: ${new Date(data.courseInfo.updatedAt).toLocaleString('ko-KR')}`
                : '아직 저장되지 않았습니다.'}
            </p>
            <Button type="submit" variant="primary">
              <Save className="h-4 w-4" aria-hidden="true" />
              저장하기
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
