import {
  Shield, Brain, Phone, MoveRight, Droplets,
  Heart, Zap, Eye, Activity, Wind,
  RefreshCw, PauseCircle, User, Truck, CheckCircle2, ChevronRight
} from 'lucide-react';

const ICON_MAP = {
  Shield, Brain, Phone, MoveRight, Droplets,
  Heart, Zap, Eye, Activity, Wind,
  RefreshCw, PauseCircle, User, Truck,
};

function getIcon(iconName) {
  return ICON_MAP[iconName] || Activity;
}

export default function ActionPanel({
  stage,
  stageData,
  performedActions,
  onAction,
  onNextStage,
  canAdvance,
  isLastStage,
  isLoading,
}) {
  const { title, actions } = stageData;

  return (
    <div className="bg-med-card border border-med-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">행동 선택</p>
          <h3 className="text-white font-semibold text-sm mt-0.5">{title}</h3>
        </div>
        <div className="text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded">
          {performedActions.length}/{actions.length} 수행
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {actions.map((action) => {
          const done = performedActions.includes(action.id);
          const Icon = getIcon(action.icon);

          return (
            <button
              key={action.id}
              onClick={() => !done && !isLoading && onAction(action)}
              disabled={done || isLoading}
              title={action.description}
              className={`
                relative group flex flex-col items-start gap-1.5 p-3 rounded-lg border text-left
                transition-all duration-200
                ${done
                  ? action.isCorrect
                    ? 'bg-med-green/10 border-med-green/30 opacity-80 cursor-default'
                    : 'bg-med-orange/10 border-med-orange/30 opacity-70 cursor-default'
                  : isLoading
                    ? 'bg-med-card border-med-border opacity-50 cursor-not-allowed'
                    : 'bg-med-bg border-med-border hover:border-med-cyan/40 hover:bg-med-cyan/5 cursor-pointer active:scale-95'
                }
              `}
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className={`
                    flex items-center justify-center w-7 h-7 rounded-md shrink-0
                    ${done
                      ? action.isCorrect ? 'bg-med-green/20 text-med-green' : 'bg-med-orange/20 text-med-orange'
                      : 'bg-slate-700/50 text-slate-400 group-hover:text-med-cyan group-hover:bg-med-cyan/10'
                    }
                  `}
                >
                  {done && action.isCorrect ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                </div>
                <span
                  className={`text-xs font-medium leading-tight
                    ${done ? action.isCorrect ? 'text-med-green' : 'text-med-orange' : 'text-slate-300 group-hover:text-white'}
                  `}
                >
                  {action.label}
                </span>
              </div>
              {done && (
                <span className={`text-xs ${action.isCorrect ? 'text-med-green' : 'text-med-orange'} opacity-70`}>
                  {action.isCorrect ? `+${action.score}점` : `${action.score}점`}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-med-border pt-3">
        <button
          onClick={onNextStage}
          disabled={isLoading}
          className={`
            w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
            text-sm font-semibold transition-all duration-200
            ${canAdvance
              ? 'bg-med-cyan/15 border border-med-cyan/40 text-med-cyan hover:bg-med-cyan/25 hover:border-med-cyan/60 active:scale-98'
              : 'bg-slate-800/50 border border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isLastStage ? (
            <>
              <CheckCircle2 size={16} />
              실습 완료 및 디브리핑
            </>
          ) : (
            <>
              다음 단계로 진행
              <ChevronRight size={16} />
            </>
          )}
        </button>
        {!canAdvance && !isLoading && (
          <p className="text-center text-xs text-slate-600 mt-1.5">
            핵심 처치를 더 수행하면 진행이 원활합니다
          </p>
        )}
      </div>
    </div>
  );
}
