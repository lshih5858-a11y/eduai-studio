import { CheckCircle2, Circle } from 'lucide-react';

const STAGES = [
  { key: 'DISCOVERY', label: '환자 발견', shortLabel: '발견' },
  { key: 'ASSESSMENT', label: '초기 사정', shortLabel: '사정' },
  { key: 'INTERVENTION', label: '간호 중재', shortLabel: '중재' },
  { key: 'OUTCOME', label: '결과 확인', shortLabel: '결과' },
];

export default function StageProgress({ currentStage, isCompleted }) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center justify-center gap-0">
      {STAGES.map((stage, idx) => {
        const isDone = isCompleted ? true : idx < currentIndex;
        const isActive = !isCompleted && idx === currentIndex;

        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300
                  ${isDone ? 'bg-med-green border-med-green' : ''}
                  ${isActive ? 'bg-med-cyan/20 border-med-cyan shadow-[0_0_12px_rgba(0,212,255,0.4)]' : ''}
                  ${!isDone && !isActive ? 'bg-med-card border-med-border' : ''}
                `}
              >
                {isDone ? (
                  <CheckCircle2 size={16} className="text-white" />
                ) : isActive ? (
                  <span className="text-med-cyan text-xs font-bold">{idx + 1}</span>
                ) : (
                  <span className="text-slate-500 text-xs">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block
                  ${isDone ? 'text-med-green' : ''}
                  ${isActive ? 'text-med-cyan' : ''}
                  ${!isDone && !isActive ? 'text-slate-500' : ''}
                `}
              >
                {stage.shortLabel}
              </span>
            </div>
            {idx < STAGES.length - 1 && (
              <div
                className={`w-10 sm:w-16 h-0.5 mx-1 transition-all duration-500
                  ${idx < currentIndex || isCompleted ? 'bg-med-green' : 'bg-med-border'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
