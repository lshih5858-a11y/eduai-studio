import { useState } from 'react'
import { BarChart2, Wand2, AlertTriangle } from 'lucide-react'
import { generateDataPrompt } from '../utils/promptTemplates'
import PromptCard from './PromptCard'
import UsageGuide from './UsageGuide'

const DATA_TYPES = ['설문조사', '매출 데이터', '고객만족도', 'SERVQUAL', '재무 데이터', '마케팅 성과', '팀 프로젝트 조사']
const TOOLS      = ['ChatGPT', 'Gemini', 'Python (Pandas)', 'Excel', 'Google Colab', 'R', 'Tableau']
const METHODS    = ['기술통계', '상관분석', '회귀분석', '시각화', '클러스터링', '텍스트 분석', '빈도분석']

/* 시연용 샘플 데이터 */
const SAMPLE = {
  dataType: '고객만족도',
  goal:     '서비스 품질 5개 차원(SERVQUAL)과 재구매 의도의 관계 분석 — 온라인 쇼핑몰 대상 n=150',
  tool:     'Python (Pandas)',
  method:   '상관분석',
}

const USAGE_STEPS = [
  { icon: '📂', text: '데이터 유형을 선택합니다 (설문조사·매출·고객만족도 등).' },
  { icon: '🎯', text: '분석 목표를 구체적으로 입력합니다 (변수명, 표본 수 포함).' },
  { icon: '🔧', text: '사용할 도구(Python·Excel·GPT)와 분석 방식을 선택합니다.' },
  { icon: '📋', text: '"분석 프롬프트 생성하기"를 클릭해 5종류의 프롬프트를 생성합니다.' },
  { icon: '💻', text: 'Python 프롬프트는 Google Colab에, Excel 프롬프트는 ChatGPT에 붙여넣습니다.' },
]

export default function DataAnalysis() {
  const [form, setForm] = useState(SAMPLE)
  const [prompts, setPrompts] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const generate = () => setPrompts(generateDataPrompt(form))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-xl shadow-sm"><BarChart2 size={22} className="text-emerald-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">데이터 분석·코딩 보조</h2>
          <p className="text-sm text-gray-500">경영학 데이터 분석을 위한 Python 코드·Excel 가이드·보고서 프롬프트를 생성합니다.</p>
        </div>
      </div>

      <UsageGuide
        steps={USAGE_STEPS}
        tip="수업 시연 팁: Python 코드 예시를 Google Colab에 열어 두고, 학생들이 직접 데이터를 바꿔 실행해 보게 하세요."
      />

      {/* 입력 폼 */}
      <div className="card !p-6">
        <h3 className="section-title"><Wand2 size={18} className="text-emerald-600" /> 분석 정보 입력</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">데이터 유형</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {DATA_TYPES.map(t => (
                <button key={t} onClick={() => set('dataType', t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    form.dataType === t ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">분석 방식</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {METHODS.map(m => (
                <button key={m} onClick={() => set('method', m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    form.method === m ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">분석 목표 <span className="text-gray-400 font-normal">(변수명·표본 수 포함 시 더 정확한 프롬프트 생성)</span></label>
            <textarea className="input-field" rows={2} value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="예: 서비스 품질 5개 차원과 재구매 의도의 관계 분석 (n=150)" />
          </div>
          <div>
            <label className="label">사용 도구</label>
            <select className="input-field" value={form.tool} onChange={e => set('tool', e.target.value)}>
              {TOOLS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button onClick={generate} className="btn-primary mt-5 bg-emerald-600 hover:bg-emerald-700 shadow-md">
          <Wand2 size={16} /> 분석 프롬프트 생성하기
        </button>
      </div>

      {/* 출력 */}
      {prompts && (
        <div className="space-y-4">
          <div className="warning-box">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p>AI 분석 결과는 원자료·통계 기준·표본 수·이상치 여부를 확인한 뒤 해석해야 합니다. 통계 결과의 최종 해석은 반드시 교수자가 검토해야 합니다.</p>
          </div>

          <PromptCard title="🧹 데이터 정리·전처리 프롬프트" prompt={prompts.cleaning} color="green" />
          <PromptCard title="📊 Excel 분석 프롬프트" prompt={prompts.excel} color="indigo" />
          <PromptCard title="🐍 Python 코드 생성 프롬프트 (Google Colab 사용)" prompt={prompts.python} color="blue" />
          <PromptCard title="📝 분석 결과 해석 프롬프트" prompt={prompts.interpretation} color="purple" />
          <PromptCard title="📄 보고서 문장 변환 프롬프트" prompt={prompts.report} color="orange" />

          {/* Python 예시 코드 */}
          <div className="card border-2 border-emerald-200 !p-5">
            <h3 className="section-title text-emerald-700">🐍 Python 코드 기본 구조 예시 (Google Colab 복붙용)</h3>
            <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
{`import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# 한글 폰트 설정 (Colab)
import matplotlib
matplotlib.rcParams['font.family'] = 'NanumGothic'

# 데이터 로드
df = pd.read_csv('data.csv')
print("데이터 형태:", df.shape)
print("\\n기술통계:\\n", df.describe())
print("\\n결측치:\\n", df.isnull().sum())

# 상관분석
corr = df.corr(numeric_only=True)

# 히트맵 시각화
plt.figure(figsize=(10, 8))
sns.heatmap(corr, annot=True, cmap='coolwarm',
            fmt='.2f', linewidths=0.5)
plt.title('${form.dataType} 상관분석 히트맵')
plt.tight_layout()
plt.savefig('heatmap.png', dpi=150)
plt.show()

# 회귀분석 (변수 수정 후 사용)
# from sklearn.linear_model import LinearRegression
# slope, intercept, r, p, se = stats.linregress(x, y)
# print(f"R²={r**2:.3f}, p={p:.4f}")`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">* Google Colab에서 파일 탭 → 샘플 CSV 업로드 후 실행하세요.</p>
          </div>
        </div>
      )}
    </div>
  )
}
