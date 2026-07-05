const POINTS = [
  'AI는 복잡한 금융 개념을 초보자 눈높이로 쉽게 설명할 수 있다.',
  'AI는 투자 판단을 대신하는 것이 아니라 학습과 점검을 돕는 도구이다.',
  'AI는 모의 데이터와 시뮬레이션을 통해 리스크 관리 교육에 활용될 수 있다.',
  '교육 현장에서는 AI를 개념 학습, 퀴즈, 진단, 포트폴리오 시뮬레이션, 리포트 생성 도구로 사용할 수 있다.',
  '실제 투자는 반드시 본인의 책임과 충분한 검토가 필요하다.',
]

export default function TeacherDemoPoints() {
  return (
    <div className="rounded-card border border-navy-800 bg-navy-900 p-6 text-white">
      <p className="text-xs font-semibold uppercase tracking-wide text-mint-300">
        교수자 시연 포인트
      </p>
      <ul className="mt-3 space-y-2 text-sm text-navy-100">
        {POINTS.map((point) => (
          <li key={point} className="flex gap-2">
            <span className="text-mint-400">▸</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
