import { useState } from 'react'
import CopyButton from './CopyButton'

export default function DataAnalysis() {
  const [dataType, setDataType] = useState('설문')
  const [goal, setGoal] = useState('고객 만족도 요인 파악')
  const [tool, setTool] = useState('Python')
  const [method, setMethod] = useState(['기술통계', '상관분석'])
  const [generated, setGenerated] = useState(false)

  const dataTypes = ['설문', '매출', '고객만족', 'SERVQUAL', '재무', '마케팅 성과', '팀 프로젝트 조사']
  const tools = ['GPT', 'Gemini', 'Python', 'Excel', 'Colab']
  const methods = ['기술통계', '상관분석', '회귀분석', '시각화', '클러스터링', '빈도분석', 't-검정', 'ANOVA']

  const toggleMethod = (m) => {
    setMethod(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  const methodStr = method.join(', ')

  const prompts = {
    clean: `다음은 ${dataType} 데이터입니다. 데이터 품질 점검과 정리를 도와주세요.
분석 목표: ${goal}

수행할 작업:
1. 결측치(Missing Value) 현황 파악 및 처리 방법 제안
2. 이상치(Outlier) 탐지 방법
3. 데이터 유형 확인 (명목, 서열, 등간, 비율 척도)
4. 리코딩이 필요한 변수 파악
5. 분석에 적합한 형태로 데이터 구조 재정리 방법
6. 기술통계 요약표 생성`,

    excel: `Excel을 사용하여 ${dataType} 데이터를 분석하는 방법을 단계별로 안내해 주세요.
분석 목표: ${goal}
분석 방법: ${methodStr}

다음을 포함해 주세요:
1. 피벗테이블 활용 방법
2. ${methodStr} 분석을 위한 Excel 함수 및 수식
3. 차트/그래프 생성 방법 (종류 추천 포함)
4. 분석 결과 해석 기준
5. 경영학 보고서에 적합한 표 형식 제안
초보자도 따라할 수 있게 스크린샷 설명 없이 텍스트로 상세히 안내해 주세요.`,

    python: `다음 ${dataType} 데이터를 Python pandas를 사용하여 분석하는 코드를 작성해 주세요.
분석 목표: ${goal}
분석 방법: ${methodStr}
도구: ${tool}

요구사항:
- CSV 파일 읽기부터 시작하는 완전한 코드
- 각 단계에 초보자도 이해할 수 있는 한국어 주석 포함
- 결측치 처리, ${methodStr} 분석 코드 포함
- matplotlib/seaborn을 사용한 시각화 코드
- 분석 결과를 해석하는 print 출력 포함
- Google Colab에서 실행 가능한 형태`,

    interpret: `다음 ${dataType} 데이터 분석 결과를 경영학적 관점에서 해석해 주세요.
분석 방법: ${methodStr}
분석 목표: ${goal}

요청사항:
1. 핵심 발견사항 3~5가지 (숫자와 함께)
2. 경영학 이론과 연결한 해석
3. 실무적 시사점
4. 분석의 한계점
5. 추가 분석 제안`,

    report: `다음 ${dataType} 분석 결과를 경영학 보고서 문장으로 변환해 주세요.
[분석 결과를 여기에 붙여 넣으세요]

작성 기준:
- 학술 보고서 문체 (3인칭, 수동태)
- 통계 수치를 포함한 객관적 서술
- 결과의 의미와 시사점 연결
- 경영학 용어 적절히 활용
- APA 또는 APA 유사 인용 형식`,
  }

  const samplePythonCode = `# 샘플 Python 분석 코드 (Google Colab 실행 가능)
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import matplotlib
matplotlib.rcParams['font.family'] = 'NanumGothic'  # 한글 폰트

# 1. 데이터 불러오기
# df = pd.read_csv('data.csv', encoding='utf-8-sig')
# 샘플 데이터 생성
import numpy as np
np.random.seed(42)
df = pd.DataFrame({
    '만족도': np.random.randint(1, 6, 100),
    '재구매의향': np.random.randint(1, 6, 100),
    '추천의향': np.random.randint(1, 6, 100),
    '연령': np.random.choice([20,30,40,50], 100)
})

# 2. 기술통계
print("=== 기술통계 ===")
print(df.describe())

# 3. 상관분석
print("\\n=== 상관계수 ===")
print(df.corr())

# 4. 시각화
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
df['만족도'].hist(ax=axes[0], bins=5, color='steelblue')
axes[0].set_title('만족도 분포')
sns.heatmap(df.corr(), annot=True, ax=axes[1], cmap='Blues')
axes[1].set_title('상관관계 히트맵')
plt.tight_layout()
plt.show()`

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="section-title">📊 데이터 분석·코딩 보조</h2>
        <p className="text-sm text-slate-500 mb-5">데이터 유형과 분석 목표를 선택하면 Excel, Python, GPT용 분석 프롬프트를 생성합니다.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">데이터 유형</label>
            <div className="flex flex-wrap gap-2">
              {dataTypes.map(t => (
                <button key={t} onClick={() => setDataType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    dataType === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-300 hover:border-orange-400'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">사용 도구</label>
            <div className="flex flex-wrap gap-2">
              {tools.map(t => (
                <button key={t} onClick={() => setTool(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    tool === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">분석 목표</label>
            <input className="input-field" value={goal} onChange={e => setGoal(e.target.value)} placeholder="예: 고객 만족도 영향 요인 파악" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">원하는 분석 방식 (복수 선택)</label>
            <div className="flex flex-wrap gap-2">
              {methods.map(m => (
                <button key={m} onClick={() => toggleMethod(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    method.includes(m) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => setGenerated(true)} className="btn-primary mt-5 w-full sm:w-auto">
          📊 분석 프롬프트 생성하기
        </button>
      </div>

      {generated && (
        <div className="space-y-4">
          {[
            { key: 'clean', label: '데이터 정리', color: 'bg-slate-100 text-slate-700', prompt: prompts.clean },
            { key: 'excel', label: 'Excel 분석', color: 'bg-green-100 text-green-700', prompt: prompts.excel },
            { key: 'python', label: 'Python 코드', color: 'bg-yellow-100 text-yellow-800', prompt: prompts.python },
            { key: 'interpret', label: '결과 해석', color: 'bg-blue-100 text-blue-700', prompt: prompts.interpret },
            { key: 'report', label: '보고서 문장 변환', color: 'bg-purple-100 text-purple-700', prompt: prompts.report },
          ].map(({ key, label, color, prompt }) => (
            <div key={key} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{label}</span>
                  {label} 프롬프트
                </h3>
                <CopyButton text={prompt} label="복사" />
              </div>
              <pre className="prompt-box">{prompt}</pre>
            </div>
          ))}

          {/* 샘플 코드 */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">샘플</span>
                Python 분석 샘플 코드 (Colab 실행용)
              </h3>
              <CopyButton text={samplePythonCode} label="코드 복사" />
            </div>
            <pre className="prompt-box text-yellow-200">{samplePythonCode}</pre>
          </div>

          <div className="card bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">
              ⚠️ <strong>분석 주의사항:</strong> AI 분석 결과는 반드시 원자료, 통계 기준, 표본 수, 이상치 여부를 확인한 뒤 해석해야 합니다.
              통계 해석은 과목 담당 교수 또는 통계 전문가의 검토를 받으세요.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
