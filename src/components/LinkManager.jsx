import { useState } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { copyToClipboard } from '../utils/copyToClipboard'
import CopyButton from './CopyButton'
import GuideBox from './GuideBox'

const linkFields = [
  { key: 'chatbot',    label: '수업 챗봇',           icon: '🤖', placeholder: 'https://chatgpt.com/g/...',           color: 'from-green-50 to-emerald-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
  { key: 'lms',        label: 'LMS (강의실)',         icon: '📚', placeholder: 'https://lms.university.ac.kr/...',    color: 'from-blue-50 to-indigo-50',   border: 'border-blue-200',  badge: 'bg-blue-100 text-blue-700' },
  { key: 'gamma',      label: 'Gamma 발표자료',       icon: '🎨', placeholder: 'https://gamma.app/...',               color: 'from-purple-50 to-violet-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  { key: 'submission', label: '팀 프로젝트 제출함',   icon: '📦', placeholder: 'https://forms.google.com/...',        color: 'from-orange-50 to-amber-50',  border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  { key: 'reference',  label: '참고자료 폴더',        icon: '📁', placeholder: 'https://drive.google.com/...',        color: 'from-teal-50 to-cyan-50',     border: 'border-teal-200',  badge: 'bg-teal-100 text-teal-700' },
  { key: 'drive',      label: '팀 공유 드라이브',     icon: '💾', placeholder: 'https://drive.google.com/...',        color: 'from-slate-50 to-gray-50',    border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700' },
  { key: 'assignment', label: '과제 제출 링크',       icon: '📝', placeholder: 'https://lms.../assignment/...',        color: 'from-pink-50 to-rose-50',     border: 'border-pink-200',  badge: 'bg-pink-100 text-pink-700' },
  { key: 'notice',     label: '공지사항',             icon: '📢', placeholder: 'https://...',                          color: 'from-yellow-50 to-amber-50',  border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
]

const defaultLinks = {
  chatbot: 'https://chatgpt.com/g/경영학-AI-튜터',
  lms: '',
  gamma: '',
  submission: '',
  reference: '',
  drive: '',
  assignment: '',
  notice: '',
  courseName: '경영학 AI 활용 수업',
  professor: '홍길동 교수',
  week: '8',
  topic: 'AI 기반 비즈니스 모델 설계',
}

export default function LinkManager() {
  const [links, setLinks] = useState(() => storage.get(STORAGE_KEYS.LINKS, defaultLinks))
  const [copied, setCopied] = useState({})
  const [saved, setSaved] = useState(false)

  const handleChange = (key, value) => setLinks(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    storage.set(STORAGE_KEYS.LINKS, links)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCopyLink = (key, value) => {
    if (!value) return
    copyToClipboard(value, () => {
      setCopied(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
    })
  }

  const activeLinks = linkFields.filter(f => links[f.key])

  const studentGuide = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 ${links.courseName} | ${links.week}주차 수업 링크 안내
담당: ${links.professor || '담당 교수'}  |  주제: ${links.topic || '오늘의 수업 주제'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

오늘 수업에서 사용할 링크를 아래에서 확인하세요.

${activeLinks.map(f => `${f.icon} [${f.label}]\n   ${links[f.key]}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  AI 생성 결과는 교수자 검토 후 활용하세요.
🔒  개인정보 입력 시 주의하세요.
📋  AI 활용 시 출처를 명시하고 저작권을 준수하세요.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

  return (
    <div className="space-y-5">

      <GuideBox
        mode="professor"
        steps={['링크 입력 및 저장', '안내문 자동 생성', 'LMS·카카오톡에 공유', '수업 중 빔프로젝터 표시', '학생 링크 접속 확인']}
        tip="수업 시작 전 이 메뉴를 열어 링크 카드를 빔프로젝터로 띄워두면, 학생들이 자신의 기기에서 바로 접속할 수 있습니다. 안내문을 복사해 LMS 공지나 카카오톡으로 공유하세요."
      />

      {/* 입력 폼 */}
      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">🔗</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">LMS·챗봇 링크 관리</h2>
            <p className="text-xs text-slate-500">수업 링크 등록 → 학생 안내문·링크 카드 자동 생성 (새로고침 후에도 유지됨)</p>
          </div>
        </div>

        {/* 수업 기본 정보 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <label className="label">과목명</label>
            <input className="input-field" value={links.courseName} onChange={e => handleChange('courseName', e.target.value)} />
          </div>
          <div>
            <label className="label">담당 교수</label>
            <input className="input-field" value={links.professor || ''} onChange={e => handleChange('professor', e.target.value)} placeholder="홍길동 교수" />
          </div>
          <div>
            <label className="label">주차</label>
            <select className="input-field" value={links.week} onChange={e => handleChange('week', e.target.value)}>
              {Array.from({ length: 16 }, (_, i) => i + 1).map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="label">오늘 수업 주제</label>
            <input className="input-field" value={links.topic || ''} onChange={e => handleChange('topic', e.target.value)} placeholder="예: AI 비즈니스 모델" />
          </div>
        </div>

        {/* 링크 입력 필드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {linkFields.map(f => (
            <div key={f.key}>
              <label className="label">
                <span className="mr-1">{f.icon}</span>{f.label}
              </label>
              <input
                className="input-field"
                value={links[f.key] || ''}
                onChange={e => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                type="url"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={handleSave} className="btn-primary">
            {saved ? '✅ 저장 완료!' : '💾 저장하기'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('모든 링크를 초기화하시겠습니까?')) {
                setLinks(defaultLinks)
                storage.remove(STORAGE_KEYS.LINKS)
              }
            }}
            className="btn-secondary"
          >
            🗑️ 초기화
          </button>
        </div>
      </div>

      {/* 링크 카드 그리드 */}
      {activeLinks.length > 0 && (
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0 text-base">
              <span>📌</span>
              {links.courseName} {links.week}주차 링크 카드
            </h3>
            <span className="text-xs text-slate-400">{activeLinks.length}개 링크</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {activeLinks.map(f => (
              <div
                key={f.key}
                className={`rounded-2xl p-4 border-2 ${f.border} bg-gradient-to-br ${f.color} hover:shadow-md transition-all group`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{f.icon}</span>
                    <span className={`badge ${f.badge} text-xs font-bold`}>{f.label}</span>
                  </div>
                  <button
                    onClick={() => handleCopyLink(f.key, links[f.key])}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      copied[f.key]
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-white/80 border border-white text-slate-600 hover:bg-white'
                    }`}
                  >
                    {copied[f.key] ? '✅ 복사됨' : '📋 복사'}
                  </button>
                </div>
                <a
                  href={links[f.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all leading-relaxed block"
                >
                  {links[f.key].length > 50 ? links[f.key].slice(0, 50) + '...' : links[f.key]}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 학생 안내문 */}
      {activeLinks.length > 0 && (
        <div className="card">
          <div className="prompt-header">
            <h3 className="section-title mb-0 text-base">
              <span>📢</span> 학생 안내문 자동 생성
            </h3>
            <CopyButton text={studentGuide} label="안내문 복사" />
          </div>
          <pre className="prompt-box text-white leading-relaxed">{studentGuide}</pre>
          <p className="text-xs text-slate-400 mt-3">💡 위 안내문을 복사하여 LMS 공지사항 또는 카카오톡 단체채팅방에 공유하세요.</p>
        </div>
      )}

      {/* 빔프로젝터 표시용 카드 */}
      {activeLinks.length > 0 && (
        <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span>📺</span> 빔프로젝터 표시용 — 오늘 수업 링크
            </h3>
            <CopyButton text={activeLinks.map(f => `${f.icon} ${f.label}: ${links[f.key]}`).join('\n')} label="전체 복사" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeLinks.map(f => (
              <div key={f.key} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors">
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{f.label}</p>
                  <p className="text-blue-300 text-xs truncate">{links[f.key]}</p>
                </div>
                <button
                  onClick={() => handleCopyLink(f.key, links[f.key])}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  {copied[f.key] ? '✅' : '복사'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeLinks.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔗</div>
          <p className="text-slate-500 font-medium mb-2">등록된 링크가 없습니다</p>
          <p className="text-sm text-slate-400">위 입력 폼에 링크를 입력하면 카드와 학생 안내문이 자동으로 생성됩니다.</p>
        </div>
      )}
    </div>
  )
}
