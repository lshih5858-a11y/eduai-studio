const WONDERING_QUESTIONS = [
  '고품질 CPR의 4가지 핵심 요소(압박 위치, 깊이, 속도, 완전 이완)를 기억하고 있나요? 어떤 부분이 가장 어려웠나요?',
  'VF(심실세동)와 PEA(무맥박 전기활동)는 AED 처치가 어떻게 다를까요? 두 상황을 어떻게 감별할 수 있을까요?',
  'ROSC 후 목표 체온 관리(TTM, 32-36°C)의 적응증과 기대 효과는 무엇인가요?',
  '5H(저혈량증, 저산소증, 수소이온과다, 저·고칼륨혈증, 저체온) 5T(긴장성 기흉, 심낭압전, 중독, 혈전—폐, 혈전—관상동맥) 가역 원인을 기억하고 있나요?',
  'CPR 중 팀 리더의 역할과 팀 커뮤니케이션 방법(Closed-loop communication)에 대해 생각해 보세요.',
  '심정지 후 뇌 보호를 위한 초기 처치에는 어떤 것들이 포함되나요?',
];

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}분 ${s % 60}초` : `${s}초`;
}

function calculateGrade(pct) {
  if (pct >= 90) return { label: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: '탁월한 수행' };
  if (pct >= 80) return { label: 'A', color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: '우수한 수행' };
  if (pct >= 70) return { label: 'B+', color: 'text-blue-400', bg: 'bg-blue-400/10', desc: '양호한 수행' };
  if (pct >= 60) return { label: 'B', color: 'text-blue-400', bg: 'bg-blue-400/10', desc: '보통 수행' };
  if (pct >= 50) return { label: 'C', color: 'text-yellow-400', bg: 'bg-yellow-400/10', desc: '개선 필요' };
  return { label: 'F', color: 'text-red-400', bg: 'bg-red-400/10', desc: '재실습 필요' };
}

export function analyzeActionLog(actionLog, scenario) {
  const performedIds = actionLog.map((a) => a.id);

  const glows = [];
  const grows = [];

  const stageOrder = ['DISCOVERY', 'ASSESSMENT', 'INTERVENTION', 'OUTCOME'];

  for (const stageName of stageOrder) {
    const stage = scenario.stages[stageName];
    for (const action of stage.actions) {
      if (!action.isCritical || !action.isCorrect) continue;

      if (performedIds.includes(action.id)) {
        const logEntry = actionLog.find((a) => a.id === action.id);
        glows.push({
          actionLabel: action.label,
          stageTitle: stage.title,
          feedback: action.feedback.replace(/^[✓⚠⛔]\s*/, ''),
          score: action.score,
          timing: logEntry ? formatTime(logEntry.timestamp) : '-',
        });
      } else {
        grows.push({
          actionLabel: action.label,
          stageTitle: stage.title,
          description: action.description,
          score: action.score,
          importance: '필수',
        });
      }
    }
  }

  const rawScore = actionLog.reduce((sum, a) => sum + (a.score || 0), 0);
  const maxScore = stageOrder.reduce((sum, stageName) => {
    const stage = scenario.stages[stageName];
    return sum + stage.actions
      .filter((a) => a.isCritical && a.isCorrect)
      .reduce((s, a) => s + a.score, 0);
  }, 0);

  const clampedScore = Math.max(0, rawScore);
  const percentage = Math.min(100, Math.round((clampedScore / maxScore) * 100));
  const grade = calculateGrade(percentage);
  const totalTime = actionLog.length > 0 ? actionLog[actionLog.length - 1].timestamp : 0;

  const selectedWonders = WONDERING_QUESTIONS.sort(() => 0.5 - Math.random()).slice(0, 3);

  return {
    score: clampedScore,
    maxScore,
    percentage,
    grade,
    glows,
    grows,
    wonderings: selectedWonders,
    totalTime: formatTime(totalTime),
    actionCount: actionLog.length,
    correctCount: actionLog.filter((a) => a.isCorrect).length,
  };
}
