import { useMemo, useState } from 'react'
import { useAppState } from '../context/AppStateContext'
import { getInvestorProfileResult } from '../utils/feedback'

const ASSET_LABELS: Record<string, string> = {
  largeCap: '대형 안정주',
  growth: '성장주',
  dividend: '배당주',
  etf: 'ETF',
  cash: '현금',
}

export default function ReportGenerator() {
  const {
    investorType,
    profileCompleted,
    allocation,
    portfolioMetrics,
    portfolioTouched,
    checklistScore,
    checklistTier,
    quizScore,
    quizCompleted,
    quizTier,
  } = useAppState()
  const [copied, setCopied] = useState(false)

  const reportText = useMemo(() => {
    const lines: string[] = []
    lines.push('====== AI 주식 투자 학습 코치 · 월간 학습 리포트 ======')
    lines.push('')
    lines.push('[투자 성향 요약]')
    if (profileCompleted && investorType) {
      const result = getInvestorProfileResult(investorType)
      lines.push(`유형: ${investorType}`)
      lines.push(result.summary)
    } else {
      lines.push('아직 투자 성향 진단을 완료하지 않았습니다.')
    }
    lines.push('')
    lines.push('[현재 모의 포트폴리오 특징]')
    if (portfolioTouched) {
      const allocationText = Object.entries(allocation)
        .map(([key, value]) => `${ASSET_LABELS[key]} ${value}%`)
        .join(', ')
      lines.push(`배분: ${allocationText}`)
      lines.push(
        `위험도 ${portfolioMetrics.riskLevel}(${portfolioMetrics.riskScore}/100), 분산투자 점수 ${portfolioMetrics.diversificationScore}/100`,
      )
    } else {
      lines.push('아직 모의 포트폴리오를 구성하지 않았습니다.')
    }
    lines.push('')
    lines.push('[강점]')
    if (profileCompleted && investorType) {
      getInvestorProfileResult(investorType).strengths.forEach((s) => lines.push(`- ${s}`))
    } else {
      lines.push('- 진단 완료 후 확인 가능합니다.')
    }
    lines.push('')
    lines.push('[주의할 점]')
    if (profileCompleted && investorType) {
      getInvestorProfileResult(investorType).cautions.forEach((c) => lines.push(`- ${c}`))
    }
    if (portfolioTouched && portfolioMetrics.concentratedAsset) {
      lines.push('- 특정 자산에 60% 이상 집중되어 있어 리스크가 커질 수 있습니다.')
    }
    lines.push(`- 체크리스트 ${checklistScore}/10 (${checklistTier}), 퀴즈 ${quizCompleted ? `${quizScore}/7 (${quizTier})` : '미응시'}`)
    lines.push('')
    lines.push('[더 공부해야 할 개념]')
    if (profileCompleted && investorType) {
      getInvestorProfileResult(investorType).studyDirection.forEach((s) => lines.push(`- ${s}`))
    } else {
      lines.push('- PER, PBR, ROE, 분산투자, 리스크 관리 기본 개념')
    }
    lines.push('')
    lines.push('[다음 학습 과제 3가지]')
    lines.push('1. 가상 종목 5개의 재무지표를 비교하고 차이를 설명해보기')
    lines.push('2. 포트폴리오 배분을 바꿔가며 위험도와 분산투자 점수 변화 관찰하기')
    lines.push('3. 초보자 퀴즈를 다시 풀어 취약한 개념 점검하기')
    lines.push('')
    lines.push('[교육용 안내]')
    lines.push(
      '본 리포트는 투자 권유가 아니라 학습 진행 상황을 정리한 교육용 시뮬레이션 결과입니다. 실제 투자 판단은 본인의 책임으로 충분히 검토해야 합니다.',
    )
    return lines.join('\n')
  }, [
    investorType,
    profileCompleted,
    allocation,
    portfolioMetrics,
    portfolioTouched,
    checklistScore,
    checklistTier,
    quizScore,
    quizCompleted,
    quizTier,
  ])

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">월간 학습 리포트</h2>
        <p className="mt-1 text-sm text-slate-500">
          진단 결과, 포트폴리오 구성, 체크리스트, 퀴즈 점수를 바탕으로 학습 리포트를 자동 생성합니다.
        </p>
      </div>

      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-navy-800">리포트 (복사 가능)</p>
          <button onClick={copyReport} className="btn-secondary">
            {copied ? '복사됨 ✓' : '텍스트 복사하기'}
          </button>
        </div>
        <textarea
          readOnly
          value={reportText}
          className="h-[420px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700"
        />
      </div>

      <div className="disclaimer">
        본 프로그램은 투자 권유가 아니라 교육용 시뮬레이션입니다. 리포트에 포함된 모든 데이터는
        브라우저 내에서만 계산되며 서버에 저장되지 않습니다.
      </div>
    </div>
  )
}
