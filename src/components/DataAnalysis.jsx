import { useState } from 'react'
import CopyButton from './CopyButton'
import GuideBox from './GuideBox'

export default function DataAnalysis() {
  const [dataType, setDataType] = useState('설문')
  const [goal, setGoal] = useState('고객 만족도 영향 요인 파악 및 서비스 개선 방향 도출')
  const [tool, setTool] = useState('Python')
  const [method, setMethod] = useState(['기술통계', '상관분석', '시각화'])
  const [generated, setGenerated] = useState(false)

  const dataTypes = ['설문', '매출', '고객만족', 'SERVQUAL', '재무', '마케팅 성과', '팀 프로젝트 조사']
  const tools = ['ChatGPT', 'Gemini', 'Python', 'Excel', 'Colab']
  const methods = ['기술통계', '상관분석', '회귀분석', '시각화', '클러스터링', '빈도분석', 't-검정', 'ANOVA']

  const toggleMethod = (m) => setMethod(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  const methodStr = method.join(', ')

  const prompts = {
    clean: `다음은 ${dataType} 데이터입니다. 데이터 품질 점검 및 정리를 도와주세요.
분석 목표: ${goal}

수행 작업:
1. 결측치(Missing Value) 현황 파악 및 처리 방법 3가지 제안
2. 이상치(Outlier) 탐지 방법 (IQR, Z-score)
3. 데이터 유형 확인 (명목·서열·등간·비율 척도 구분)
4. 리코딩이 필요한 변수 파악 및 방법
5. 분석에 적합한 형태로 구조 재정리 방법
6. 기술통계 요약표 생성 (평균·표준편차·최솟값·최댓값·왜도)`,

    excel: `Excel을 사용하여 ${dataType} 데이터를 분석하는 방법을 단계별로 안내해 주세요.
분석 목표: ${goal}
분석 방법: ${methodStr}

단계별 안내:
1. 피벗테이블로 ${methodStr} 수행 방법 (메뉴 경로 포함)
2. 분석에 필요한 Excel 함수 목록 및 수식 예시
3. 권장 차트·그래프 종류 및 생성 방법
4. 결과 해석 기준 및 보고서 표 형식
5. 분석결과 슬라이드 1페이지 구성 방법
초보자 기준으로 단계마다 핵심 포인트를 강조해 주세요.`,

    python: `다음 ${dataType} 데이터를 Python pandas로 분석하는 완전한 코드를 작성해 주세요.
분석 목표: ${goal}
분석 방법: ${methodStr}
실행 환경: ${tool}

요구사항:
- CSV 파일 읽기부터 완전한 코드
- 각 단계에 한국어 주석 포함
- 결측치 처리 → ${methodStr} → 시각화 순서
- matplotlib/seaborn 시각화 (한글 폰트 설정 포함)
- 결과 해석 print 출력 포함
- Google Colab 즉시 실행 가능한 형태
- 샘플 데이터 자동 생성 코드 포함`,

    interpret: `${dataType} 데이터 분석 결과를 경영학적 관점에서 해석해 주세요.
분석 방법: ${methodStr} / 목표: ${goal}

[분석 결과를 여기에 붙여 넣으세요]

해석 내용:
1. 핵심 발견사항 3~5가지 (수치 포함)
2. 경영학 이론 연결 해석 (관련 이론명 명시)
3. 실무적 시사점 및 개선 방안
4. 분석의 한계점 (표본 수·설계 등)
5. 추가 분석 제안 2가지`,

    report: `다음 ${dataType} 분석 결과를 경영학 보고서 문장으로 변환해 주세요.
[분석 결과 붙여 넣기]

작성 기준:
- 학술 보고서 문체 (3인칭·수동태)
- 통계 수치를 포함한 객관적 서술
- "~것으로 나타났다", "~를 보이는 것으로 확인되었다" 등 학술 표현
- 결과의 의미와 시사점 연결
- APA 유사 인용 형식 (연도·출처 포함)`,
  }

  const sampleCode = `# ✅ 경영학 수업용 고객만족도 분석 샘플 코드 (Google Colab 즉시 실행)
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
import seaborn as sns
from scipy import stats
import numpy as np

# 한글 폰트 설정 (Colab)
# !pip install koreanize-matplotlib -q
# import koreanize_matplotlib

matplotlib.rcParams['axes.unicode_minus'] = False
np.random.seed(42)

# ── 1. 샘플 데이터 생성 ──────────────────────────────
df = pd.DataFrame({
    '만족도':    np.random.randint(1, 6, 150),
    '재구매의향': np.random.randint(1, 6, 150),
    '추천의향':  np.random.randint(1, 6, 150),
    '가격만족':  np.random.randint(1, 6, 150),
    '서비스품질': np.random.randint(1, 6, 150),
    '연령대':    np.random.choice(['20대','30대','40대','50대'], 150),
})
print("✅ 데이터 로드 완료:", df.shape)

# ── 2. 결측치 확인 ────────────────────────────────────
print("\n📊 결측치 현황:")
print(df.isnull().sum())

# ── 3. 기술통계 ───────────────────────────────────────
print("\n📈 기술통계:")
print(df.describe().round(2))

# ── 4. 상관분석 ───────────────────────────────────────
numeric_df = df.select_dtypes(include='number')
print("\n🔗 상관계수 행렬:")
print(numeric_df.corr().round(3))

# ── 5. 시각화 (4개 차트) ──────────────────────────────
fig, axes = plt.subplots(2, 2, figsize=(12, 9))
fig.suptitle('고객만족도 분석 결과', fontsize=16, fontweight='bold')

# 5-1. 만족도 분포
df['만족도'].value_counts().sort_index().plot(
    kind='bar', ax=axes[0,0], color='steelblue', edgecolor='white'
)
axes[0,0].set_title('만족도 분포')
axes[0,0].set_xlabel('점수')

# 5-2. 상관 히트맵
sns.heatmap(numeric_df.corr(), annot=True, fmt='.2f',
            ax=axes[0,1], cmap='Blues', linewidths=0.5)
axes[0,1].set_title('상관관계 히트맵')

# 5-3. 연령대별 만족도
df.groupby('연령대')['만족도'].mean().plot(
    kind='bar', ax=axes[1,0], color='coral', edgecolor='white'
)
axes[1,0].set_title('연령대별 평균 만족도')
axes[1,0].set_ylabel('평균 점수')

# 5-4. 산점도 (만족도 vs 재구매의향)
axes[1,1].scatter(df['만족도'], df['재구매의향'], alpha=0.4, color='purple')
axes[1,1].set_xlabel('만족도')
axes[1,1].set_ylabel('재구매의향')
axes[1,1].set_title('만족도 × 재구매의향 산점도')

plt.tight_layout()
plt.show()

# ── 6. 핵심 결과 출력 ─────────────────────────────────
corr_val = numeric_df.corr()['만족도']['재구매의향']
print(f"\n✅ 만족도-재구매의향 상관계수: {corr_val:.3f}")
if abs(corr_val) >= 0.7:
    print("   → 강한 양의 상관관계: 만족도 향상이 재구매 의향을 크게 높입니다.")
elif abs(corr_val) >= 0.4:
    print("   → 보통 상관관계: 만족도가 재구매 의향에 유의미한 영향을 미칩니다.")`

  return (
    <div className="space-y-5">

      <GuideBox
        mode="student"
        steps={['데이터 유형 선택', '분석 목표 입력', '프롬프트 복사', 'Excel·Python에 실행', '결과 보고서 작성']}
        tip="설문 데이터가 있다면 '설문' 유형을 선택하고 Python 프롬프트를 ChatGPT에 붙여 넣으세요. 생성된 코드를 Google Colab에서 바로 실행할 수 있습니다."
      />

      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl shrink-0">📊</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">데이터 분석·코딩 보조</h2>
            <p className="text-xs text-slate-500">데이터 유형과 분석 목표 선택 → Excel·Python·GPT 분석 프롬프트 생성</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label">데이터 유형</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {dataTypes.map(t => (
                <button key={t} onClick={() => setDataType(t)}
                  className={`chip ${dataType === t ? 'bg-orange-500 text-white border-orange-500' : 'chip-inactive'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">사용 도구</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {tools.map(t => (
                <button key={t} onClick={() => setTool(t)}
                  className={`chip ${tool === t ? 'chip-active' : 'chip-inactive'}`}>
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
            <label className="label">분석 방식 (복수 선택)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {methods.map(m => (
                <button key={m} onClick={() => toggleMethod(m)}
                  className={`chip ${method.includes(m) ? 'bg-emerald-600 text-white border-emerald-600' : 'chip-inactive'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => setGenerated(true)} className="btn-primary mt-5">
          📊 분석 프롬프트 생성하기
        </button>
      </div>

      {generated && (
        <div className="space-y-4">
          {[
            { key: 'clean',     badge: '데이터 정리', badgeColor: 'bg-slate-100 text-slate-700' },
            { key: 'excel',     badge: 'Excel 분석',  badgeColor: 'bg-green-100 text-green-700' },
            { key: 'python',    badge: 'Python 코드', badgeColor: 'bg-yellow-100 text-yellow-800' },
            { key: 'interpret', badge: '결과 해석',   badgeColor: 'bg-blue-100 text-blue-700' },
            { key: 'report',    badge: '보고서 변환', badgeColor: 'bg-purple-100 text-purple-700' },
          ].map(({ key, badge, badgeColor }) => (
            <div key={key} className="card">
              <div className="prompt-header">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <span className={`badge ${badgeColor}`}>{badge}</span>
                  {badge} 프롬프트
                </h3>
                <CopyButton text={prompts[key]} label="복사" />
              </div>
              <pre className="prompt-box">{prompts[key]}</pre>
            </div>
          ))}

          <div className="card">
            <div className="prompt-header">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <span className="badge bg-yellow-100 text-yellow-800">샘플 코드</span>
                Python 분석 샘플 코드 (Google Colab 즉시 실행)
              </h3>
              <CopyButton text={sampleCode} label="코드 복사" />
            </div>
            <pre className="prompt-box text-yellow-200 text-xs leading-relaxed">{sampleCode}</pre>
          </div>

          <div className="card bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">
              ⚠️ <strong>분석 주의사항:</strong> AI 분석 결과는 반드시 원자료, 통계 기준, 표본 수, 이상치 여부를 확인한 뒤 해석해야 합니다.
              통계 해석은 담당 교수 또는 통계 전문가의 검토를 받으세요.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
