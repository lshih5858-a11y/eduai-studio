import { useState } from 'react'
import { storage, STORAGE_KEYS } from '../utils/storage'
import { copyToClipboard } from '../utils/copyToClipboard'
import CopyButton from './CopyButton'

const defaultLinks = {
  chatbot: '',
  lms: '',
  gamma: '',
  drive: '',
  assignment: '',
  notice: '',
  courseName: '경영학 AI 활용 수업',
  week: '8',
}

const linkFields = [
  { key: 'chatbot', label: '수업 챗봇 링크', icon: '🤖', placeholder: 'https://chatgpt.com/g/...' },
  { key: 'lms', label: 'LMS 링크', icon: '📚', placeholder: 'https://lms.university.ac.kr/...' },
  { key: 'gamma', label: 'Gamma 발표자료 링크', icon: '🎨', placeholder: 'https://gamma.app/...' },
  { key: 'drive', label: 'Google Drive 링크', icon: '📁', placeholder: 'https://drive.google.com/...' },
  { key: 'assignment', label: '과제 제출 링크', icon: '📝', placeholder: 'https://...' },
  { key: 'notice', label: '공지사항 링크', icon: '📢', placeholder: 'https://...' },
]

export default function LinkManager() {
  const [links, setLinks] = useState(() => storage.get(STORAGE_KEYS.LINKS, defaultLinks))
  const [copied, setCopied] = useState({})
  const [saved, setSaved] = useState(false)

  const handleChange = (key, value) => {
    const updated = { ...links, [key]: value }
    setLinks(updated)
  }

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

  const studentGuide = `📚 ${links.courseName} ${links.week}주차 수업 안내
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

오늘 수업에서 사용할 링크 모음입니다.
아래 링크를 클릭하여 수업에 참여해 주세요.

${activeLinks.map(f => `${f.icon} ${f.label}\n   ${links[f.key]}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ AI 생성 결과는 교수자 검토 후 활용하세요.
🔒 개인정보 입력 시 주의하세요.
📋 저작권·AI 윤리 규정을 준수해 주세요.`

  const qrGuide = activeLinks.map(f => `${f.icon} ${f.label}: ${links[f.key]}`).join('\n')

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="section-title">🔗 LMS·챗봇 링크 관리</h2>
        <p className="text-sm text-slate-500 mb-5">수업에서 사용하는 링크를 등록하면 학생 안내문과 링크 카드를 자동으로 생성합니다. 입력 내용은 자동 저장됩니다.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">과목명</label>
            <input className="input-field" value={links.courseName} onChange={e => handleChange('courseName', e.target.value)} placeholder="예: 경영전략" />
          </div>
          <div>
            <label className="label">주차</label>
            <select className="input-field" value={links.week} onChange={e => handleChange('week', e.target.value)}>
              {Array.from({ length: 16 }, (_, i) => i + 1).map(w => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </div>
          {linkFields.map(f => (
            <div key={f.key} className="sm:col-span-2">
              <label className="label">
                <span className="mr-1">{f.icon}</span>{f.label}
              </label>
              <input
                className="input-field"
                value={links[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                type="url"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={handleSave} className="btn-primary">
            {saved ? '✅ 저장됨!' : '💾 저장하기'}
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

      {/* 링크 카드 */}
      {activeLinks.length > 0 && (
        <div className="card">
          <h3 className="section-title">
            📌 {links.courseName} {links.week}주차 링크 카드
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeLinks.map(f => (
              <div key={f.key} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{f.icon}</span>
                    <span className="font-medium text-sm text-slate-700">{f.label}</span>
                  </div>
                  <button
                    onClick={() => handleCopyLink(f.key, links[f.key])}
                    className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                      copied[f.key] ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {copied[f.key] ? '✅ 복사됨' : '📋 복사'}
                  </button>
                </div>
                <a
                  href={links[f.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline break-all"
                >
                  {links[f.key]}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 학생 안내문 */}
      {activeLinks.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title mb-0">📢 학생 안내문 자동 생성</h3>
            <CopyButton text={studentGuide} label="안내문 복사" />
          </div>
          <pre className="prompt-box text-white leading-relaxed">{studentGuide}</pre>
        </div>
      )}

      {/* 오늘 수업 링크 모음 */}
      {activeLinks.length > 0 && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-blue-800">📱 "오늘 수업에서 사용할 링크" QR/공유용</h3>
            <CopyButton text={qrGuide} label="링크 목록 복사" />
          </div>
          <div className="space-y-2">
            {activeLinks.map(f => (
              <div key={f.key} className="flex items-center gap-2 bg-white rounded-lg p-3 border border-blue-200">
                <span className="text-xl">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700">{f.label}</div>
                  <div className="text-xs text-blue-600 truncate">{links[f.key]}</div>
                </div>
                <button
                  onClick={() => handleCopyLink(f.key, links[f.key])}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg shrink-0"
                >
                  {copied[f.key] ? '✅' : '복사'}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-500 mt-3">💡 이 링크 목록을 LMS 공지사항이나 카카오톡 채팅방에 복사해서 학생들과 공유하세요.</p>
        </div>
      )}

      {activeLinks.length === 0 && (
        <div className="card text-center py-12 text-slate-400">
          <div className="text-4xl mb-3">🔗</div>
          <p className="text-sm">링크를 입력하면 카드와 학생 안내문이 자동으로 생성됩니다.</p>
        </div>
      )}
    </div>
  )
}
