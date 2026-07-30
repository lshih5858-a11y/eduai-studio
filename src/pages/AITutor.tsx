import { useMemo, useState } from 'react'
import { AlertTriangle, MessageCircleQuestion, Plus, Sparkles, UserCheck } from 'lucide-react'
import { useProjectData } from '../context/ProjectDataContext'
import { PageHeader } from '../components/common/PageHeader'
import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'
import { TextField, TextareaField } from '../components/common/FormField'
import { tutorSeedQuestions } from '../data/tutorSeed'
import { generateId } from '../utils/id'
import type { TutorQuestion } from '../types'

export function AITutor() {
  const { data, setTutorQuestions, notify } = useProjectData()
  const allQuestions = useMemo(
    () => [...tutorSeedQuestions, ...data.tutorQuestions],
    [data.tutorQuestions],
  )
  const majors = useMemo(() => Array.from(new Set(allQuestions.map((q) => q.major))), [allQuestions])

  const [selectedMajor, setSelectedMajor] = useState<string>(majors[0] ?? '')
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customForm, setCustomForm] = useState({
    major: '',
    question: '',
    sampleAnswer: '',
    keyConcepts: '',
    followUpQuestions: '',
  })

  const questionsForMajor = allQuestions.filter((q) => q.major === selectedMajor)
  const selectedQuestion = questionsForMajor.find((q) => q.id === selectedQuestionId) ?? null

  const handleSelectQuestion = (q: TutorQuestion) => {
    setSelectedQuestionId(q.id)
    setShowAnswer(false)
  }

  const handleAddCustom = () => {
    if (!customForm.major.trim() || !customForm.question.trim()) {
      notify('전공과 질문을 입력해주세요.')
      return
    }
    const newQuestion: TutorQuestion = {
      id: generateId('tutor'),
      major: customForm.major.trim(),
      question: customForm.question.trim(),
      sampleAnswer: customForm.sampleAnswer.trim(),
      keyConcepts: customForm.keyConcepts
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      followUpQuestions: customForm.followUpQuestions
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean),
    }
    const updated = [...data.tutorQuestions, newQuestion]
    setTutorQuestions(updated)
    setSelectedMajor(newQuestion.major)
    setSelectedQuestionId(newQuestion.id)
    setShowCustomForm(false)
    setCustomForm({ major: '', question: '', sampleAnswer: '', keyConcepts: '', followUpQuestions: '' })
  }

  return (
    <div>
      <PageHeader
        title="AI 튜터"
        description="전공별 질문 예시를 선택하면 시범 답변, 핵심 개념, 추가 학습 질문을 확인할 수 있습니다."
        actions={
          <Button onClick={() => setShowCustomForm((v) => !v)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            질문 예시 추가
          </Button>
        }
      />

      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-xs text-accent-800 sm:text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          본 답변은 <strong>실제 AI API를 호출하지 않는 시범(예시) 응답</strong>입니다. 학생에게 그대로 제공하기 전에
          반드시 교수자의 검토가 필요합니다.
        </p>
      </div>

      {showCustomForm && (
        <div className="mb-6 space-y-4 rounded-2xl border border-brand-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-brand-900">새 질문 예시 추가</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="전공"
              htmlFor="custom-major"
              value={customForm.major}
              onChange={(e) => setCustomForm((f) => ({ ...f, major: e.target.value }))}
              placeholder="예: 유아교육학과"
            />
            <TextField
              label="핵심 개념 (쉼표로 구분)"
              htmlFor="custom-concepts"
              value={customForm.keyConcepts}
              onChange={(e) => setCustomForm((f) => ({ ...f, keyConcepts: e.target.value }))}
              placeholder="예: 개념1, 개념2"
            />
          </div>
          <TextareaField
            label="질문"
            htmlFor="custom-question"
            rows={2}
            value={customForm.question}
            onChange={(e) => setCustomForm((f) => ({ ...f, question: e.target.value }))}
          />
          <TextareaField
            label="예시 답변"
            htmlFor="custom-answer"
            rows={3}
            value={customForm.sampleAnswer}
            onChange={(e) => setCustomForm((f) => ({ ...f, sampleAnswer: e.target.value }))}
          />
          <TextareaField
            label="추가 학습 질문 (줄바꿈으로 구분)"
            htmlFor="custom-followups"
            rows={2}
            value={customForm.followUpQuestions}
            onChange={(e) => setCustomForm((f) => ({ ...f, followUpQuestions: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowCustomForm(false)}>취소</Button>
            <Button variant="primary" onClick={handleAddCustom}>
              추가 및 저장
            </Button>
          </div>
        </div>
      )}

      {majors.length === 0 ? (
        <EmptyState title="등록된 질문 예시가 없습니다" description="'질문 예시 추가' 버튼으로 새 질문을 추가해보세요." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-500">전공 선택</h3>
            <div className="mb-5 flex flex-wrap gap-2 lg:flex-col">
              {majors.map((major) => (
                <button
                  key={major}
                  type="button"
                  onClick={() => {
                    setSelectedMajor(major)
                    setSelectedQuestionId(null)
                  }}
                  className={`rounded-lg px-3.5 py-2 text-left text-sm font-medium ${
                    selectedMajor === major ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  }`}
                >
                  {major}
                </button>
              ))}
            </div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-500">질문 선택</h3>
            <div className="space-y-1.5">
              {questionsForMajor.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleSelectQuestion(q)}
                  className={`flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${
                    selectedQuestionId === q.id ? 'bg-brand-100 text-brand-900' : 'hover:bg-brand-50 text-brand-700'
                  }`}
                >
                  <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
                  {q.question}
                </button>
              ))}
            </div>
          </div>

          <div>
            {!selectedQuestion ? (
              <EmptyState
                icon={MessageCircleQuestion}
                title="질문을 선택하세요"
                description="왼쪽에서 전공과 질문을 선택하면 시범 답변을 확인할 수 있습니다."
              />
            ) : (
              <div className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
                <span className="mb-2 inline-block rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
                  {selectedQuestion.major}
                </span>
                <h3 className="text-lg font-semibold text-brand-950">{selectedQuestion.question}</h3>

                {!showAnswer ? (
                  <Button variant="primary" onClick={() => setShowAnswer(true)} className="mt-4">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    예시 답변 보기
                  </Button>
                ) : (
                  <div className="mt-4 space-y-5">
                    <div className="rounded-xl bg-brand-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand-600">
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        예시 답변 (시범 응답)
                      </div>
                      <p className="text-sm leading-relaxed text-brand-900">{selectedQuestion.sampleAnswer}</p>
                    </div>

                    {selectedQuestion.keyConcepts.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-500">핵심 개념</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedQuestion.keyConcepts.map((c) => (
                            <span key={c} className="rounded-full bg-accent-100 px-3 py-1 text-xs font-medium text-accent-800">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedQuestion.followUpQuestions.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-500">추가 학습 질문</h4>
                        <ul className="space-y-1.5 text-sm text-brand-700">
                          {selectedQuestion.followUpQuestions.map((q) => (
                            <li key={q} className="flex items-start gap-2">
                              <MessageCircleQuestion className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" aria-hidden="true" />
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
                      <UserCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      이 답변은 시범 응답이며 학생에게 전달하기 전 교수자 검토가 필요합니다.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
