import { useEffect, useState } from 'react';
import { Activity, RotateCcw, ClipboardList } from 'lucide-react';
import StageProgress from './StageProgress';

function formatTimer(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function Header({ stage, isCompleted, startTime, onReset, onShowDebriefing, hasResults }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isCompleted) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime), 500);
    return () => clearInterval(id);
  }, [startTime, isCompleted]);

  return (
    <header className="bg-med-card border-b border-med-border px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-med-cyan/10 border border-med-cyan/30">
          <Activity size={20} className="text-med-cyan" />
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm leading-tight">스마트 간호 실습 에이전트</h1>
          <p className="text-slate-500 text-xs">CPR 시뮬레이션 · 심정지 응급처치</p>
        </div>
      </div>

      <div className="flex-1 max-w-md">
        <StageProgress currentStage={stage} isCompleted={isCompleted} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="font-mono text-sm px-3 py-1.5 rounded-lg bg-med-bg border border-med-border text-med-cyan">
          {formatTimer(elapsed)}
        </div>
        {hasResults && (
          <button
            onClick={onShowDebriefing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-med-purple/20 border border-med-purple/40 text-med-purple text-xs font-medium hover:bg-med-purple/30 transition-colors"
          >
            <ClipboardList size={14} />
            결과 보기
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-med-border/50 border border-med-border text-slate-400 text-xs hover:text-white hover:bg-med-border transition-colors"
        >
          <RotateCcw size={14} />
          초기화
        </button>
      </div>
    </header>
  );
}
