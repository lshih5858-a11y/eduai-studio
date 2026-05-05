import { useState } from 'react'
import { BarChart2, Wand2, AlertTriangle } from 'lucide-react'
import { generateDataPrompt } from '../utils/promptTemplates'
import PromptCard from './PromptCard'

const DATA_TYPES = ['설문조사', '매출 데이터', '고객만족도', 'SERVQUAL', '재무 데이터', '마케팅 성과', '팀 프로젝트 조사']
const TOOLS = ['ChatGPT', 'Gemini', 'Python (Pandas)', 'Excel', 'Google Colab', 'R', 'Tableau']
const METHODS = ['기술통계', '상관분석', '회귀분석', '시각화', '클러스터링', '텍스트 분석', '빈도분석']

const DEFAULT = {
  dataType: '고객만족도', goal: '서비스 품질과 재구매 의도의 관계 분석', tool: 'Python (Pandas)', method: '상관분석'
}

export default function DataAnalysis() {
  const [form, setForm] = useState(DEFAULT)
  const [prompts, setPrompts] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const generate = () => setPrompts(generateDataPrompt(form))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-100 p-2 rounded-xl"><BarChart2 size={22} className="text-emerald-700" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">데이터 분석·코딩 보조</h2>
          <p className="text-sm text-gray-500">경영학 데이터 분석을 위한 프롬프트와 Python 코드 생성을 지원합니다.</p>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="card">
        <h3 className="section-title"><Wand2 size={18} className="text-emerald-600" /> 분석 정보 입력</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">데이터 유형</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {DATA_TYPES.map(t => (
                <button key={t} onClick={() => set('dataType', t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.dataType === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">분석 방식</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {METHODS.map(m => (
                <button key={m} onClick={() => set('method', m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    form.method === m ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">분석 목표</label>
            <textarea className="input-field" rows={2} value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="예: 서비스 품질과 재구매 의도의 관계 분석" />
          </div>
          <div>
            <label className="label">사용 도구</label>
            <select className="input-field" value={form.tool} onChange={e => set('tool', e.target.value)}>
              {TOOLS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button onClick={generate} className="btn-primary mt-5 bg-emerald-600 hover:bg-emerald-700">
          <Wand2 size={16} /> 분석 프롬프트 생성하기
        </button>
      </div>

      {/* 출력 */}
      {prompts && (
        <div className="space-y-4">
          <div className="warning-box">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p>AI 분석 결과는 반드시 원자료, 통계 기준, 표본 수, 이상치 여부를 확인한 뒤 해석해야 합니다. 통계 결과의 최종 해석은 교수자가 확인해야 합니다.</p>
          </div>

          <PromptCard title="🧹 데이터 정리·전처리 프롬프트" prompt={prompts.cleaning} color="green" />
          <PromptCard title="📊 Excel 분석 프롬프트" prompt={prompts.excel} color="indigo" />
          <PromptCard title="🐍 Python 코드 생성 프롬프트" prompt={prompts.python} color="blue" />
          <PromptCard title="📝 분석 결과 해석 프롬프트" prompt={prompts.interpretation} color="purple" />
          <PromptCard title="📄 보고서 문장 변환 프롬프트" prompt={prompts.report} color="orange" />

          {/* Python 코드 예시 */}
          <div className="card border-2 border-emerald-200">
            <h3 className="section-title text-emerald-700">🐍 Python 코드 기본 구조 예시</h3>
            <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed">
{`import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# 데이터 로드
df = pd.read_csv('data.csv')

# 기술통계
print(df.describe())

# 결측치 확인
print(df.isnull().sum())

# 상관분석
corr_matrix = df.corr()
print(corr_matrix)

# 히트맵 시각화
plt.figure(figsize=(10, 8))
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt='.2f')
plt.title('${form.dataType} 상관분석 히트맵')
plt.tight_layout()
plt.savefig('correlation_heatmap.png', dpi=150)
plt.show()

# 회귀분석 예시
from sklearn.linear_model import LinearRegression
# slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">* 위 코드를 Google Colab에 붙여넣기하여 실행하세요.</p>
          </div>
        </div>
      )}
    </div>
  )
}
