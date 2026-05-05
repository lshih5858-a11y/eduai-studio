import { useState, useEffect } from 'react'
import { Link, Copy, Check, Plus, Trash2, ExternalLink } from 'lucide-react'
import { copyToClipboard } from '../utils/promptTemplates'

const INITIAL_LINKS = {
  chatbot:   { label: '수업 챗봇 링크',       placeholder: 'https://chat.openai.com/g/...', icon: '🤖', color: 'bg-green-50 border-green-200 text-green-800' },
  lms:       { label: 'LMS 링크',             placeholder: 'https://eclass.university.ac.kr/...', icon: '🏫', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  gamma:     { label: 'Gamma 발표자료 링크',   placeholder: 'https://gamma.app/docs/...', icon: '🎨', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  drive:     { label: 'Google Drive 링크',    placeholder: 'https://drive.google.com/...', icon: '📁', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  submit:    { label: '과제 제출 링크',        placeholder: 'https://forms.gle/...', icon: '📤', color: 'bg-orange-50 border-orange-200 text-orange-800' },
  notice:    { label: '공지사항 링크',         placeholder: 'https://...', icon: '📢', color: 'bg-rose-50 border-rose-200 text-rose-800' },
}

const STORAGE_KEY = 'business_ai_studio_links'

export default function LinkManager() {
  const [links, setLinks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : Object.fromEntries(Object.keys(INITIAL_LINKS).map(k => [k, '']))
    } catch { return Object.fromEntries(Object.keys(INITIAL_LINKS).map(k => [k, ''])) }
  })

  const [customLinks, setCustomLinks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_custom')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const [copiedKey, setCopiedKey] = useState(null)
  const [copiedGuide, setCopiedGuide] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
  }, [links])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_custom', JSON.stringify(customLinks))
  }, [customLinks])

  const handleCopy = async (key, text) => {
    if (!text) return
    await copyToClipboard(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const generateGuide = () => {
    const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
    const activeLinks = Object.entries(INITIAL_LINKS)
      .filter(([k]) => links[k])
      .map(([k, v]) => `${v.icon} ${v.label}: ${links[k]}`)
      .join('\n')
    const customActive = customLinks.filter(l => l.url).map(l => `🔗 ${l.label}: ${l.url}`).join('\n')

    return `📚 오늘 수업에서 사용할 링크 모음
📅 ${today}

${activeLinks}${customActive ? '\n' + customActive : ''}

---
💡 안내사항:
${notice || '• 오늘 수업에서 위 링크를 활용합니다.\n• 문의사항은 LMS 쪽지 또는 이메일로 연락해 주세요.'}

⚠️ 이 플랫폼은 학생 개인정보를 서버에 저장하지 않습니다.`
  }

  const handleCopyGuide = async () => {
    await copyToClipboard(generateGuide())
    setCopiedGuide(true)
    setTimeout(() => setCopiedGuide(false), 2000)
  }

  const addCustomLink = () => {
    setCustomLinks(prev => [...prev, { id: Date.now(), label: '', url: '' }])
  }

  const updateCustomLink = (id, field, value) => {
    setCustomLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const removeCustomLink = (id) => {
    setCustomLinks(prev => prev.filter(l => l.id !== id))
  }

  const activeCount = Object.values(links).filter(Boolean).length + customLinks.filter(l => l.url).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-sky-100 p-2 rounded-xl"><Link size={22} className="text-sky-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">LMS·챗봇 링크 관리</h2>
          <p className="text-sm text-gray-500">수업 관련 링크를 정리하고 학생 안내문을 자동 생성합니다. 입력 내용은 자동 저장됩니다.</p>
        </div>
      </div>

      {/* 링크 입력 */}
      <div className="card">
        <h3 className="section-title">🔗 링크 입력</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(INITIAL_LINKS).map(([key, meta]) => (
            <div key={key}>
              <label className="label">{meta.icon} {meta.label}</label>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  value={links[key]}
                  onChange={e => setLinks(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={meta.placeholder}
                  type="url"
                />
                {links[key] && (
                  <button
                    onClick={() => handleCopy(key, links[key])}
                    className="btn-secondary px-3 py-2 text-xs"
                  >
                    {copiedKey === key ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 공지사항 */}
        <div className="mt-4">
          <label className="label">📢 추가 공지사항 (선택)</label>
          <textarea
            className="input-field"
            rows={2}
            value={notice}
            onChange={e => setNotice(e.target.value)}
            placeholder="예: 오늘 실습은 4인 1팀으로 진행합니다. 노트북 필참."
          />
        </div>
      </div>

      {/* 커스텀 링크 */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">➕ 추가 링크</h3>
          <button onClick={addCustomLink} className="btn-secondary text-sm">
            <Plus size={15} /> 링크 추가
          </button>
        </div>
        {customLinks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">추가 링크가 없습니다. 위 버튼을 눌러 추가하세요.</p>
        )}
        <div className="space-y-2">
          {customLinks.map(cl => (
            <div key={cl.id} className="flex gap-2">
              <input
                className="input-field w-32 flex-shrink-0"
                placeholder="링크 이름"
                value={cl.label}
                onChange={e => updateCustomLink(cl.id, 'label', e.target.value)}
              />
              <input
                className="input-field flex-1"
                placeholder="https://..."
                value={cl.url}
                onChange={e => updateCustomLink(cl.id, 'url', e.target.value)}
                type="url"
              />
              <button onClick={() => removeCustomLink(cl.id)} className="text-red-400 hover:text-red-600 p-2">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 링크 카드 미리보기 */}
      {activeCount > 0 && (
        <div className="card">
          <h3 className="section-title">📋 링크 카드 미리보기</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(INITIAL_LINKS).map(([key, meta]) => links[key] && (
              <div key={key} className={`border rounded-xl p-4 ${meta.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <span className="font-semibold text-sm">{meta.label.replace(' 링크', '')}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleCopy(key, links[key])} className="p-1.5 rounded-lg bg-white/60 hover:bg-white/90">
                      {copiedKey === key ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <a href={links[key]} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/60 hover:bg-white/90">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
                <p className="text-xs truncate opacity-70">{links[key]}</p>
              </div>
            ))}
            {customLinks.filter(l => l.url).map(cl => (
              <div key={cl.id} className="border rounded-xl p-4 bg-gray-50 border-gray-200 text-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔗</span>
                    <span className="font-semibold text-sm">{cl.label || '링크'}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleCopy(cl.id, cl.url)} className="p-1.5 rounded-lg bg-white/60 hover:bg-white/90">
                      {copiedKey === cl.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <a href={cl.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/60 hover:bg-white/90">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
                <p className="text-xs truncate opacity-70">{cl.url}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 학생 안내문 생성 */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">📣 오늘 수업 링크 안내문 생성</h3>
          <button onClick={handleCopyGuide} className="btn-primary text-sm">
            {copiedGuide ? <><Check size={14} /> 복사됨!</> : <><Copy size={14} /> 안내문 복사</>}
          </button>
        </div>
        <pre className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-mono">
          {generateGuide()}
        </pre>
        <p className="text-xs text-gray-500 mt-2">* 위 안내문을 LMS, 카카오톡, Slack 등에 붙여넣어 학생들과 공유하세요.</p>
      </div>
    </div>
  )
}
