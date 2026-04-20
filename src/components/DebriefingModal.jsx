import { X, Star, TrendingUp, HelpCircle, Award, Clock, CheckCircle2, XCircle } from 'lucide-react';

function ScoreRing({ percentage, grade }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1a2740" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={percentage >= 70 ? '#10b981' : percentage >= 50 ? '#eab308' : '#ef4444'}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center">
        <div className={`text-3xl font-bold ${grade.color}`}>{grade.label}</div>
        <div className="text-xs text-slate-400">{percentage}점</div>
      </div>
    </div>
  );
}

function GlowItem({ item }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-med-green/5 border border-med-green/20">
      <CheckCircle2 size={15} className="text-med-green mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-white">{item.actionLabel}</p>
        <p className="text-xs text-slate-400 mt-0.5">{item.stageTitle} · {item.timing}</p>
        <p className="text-xs text-med-green mt-1">{item.feedback}</p>
      </div>
      <span className="ml-auto text-xs font-mono text-med-green shrink-0">+{item.score}</span>
    </div>
  );
}

function GrowItem({ item }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-med-orange/5 border border-med-orange/20">
      <XCircle size={15} className="text-med-orange mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-white">{item.actionLabel}</p>
        <p className="text-xs text-slate-400 mt-0.5">{item.stageTitle} · {item.importance}</p>
        <p className="text-xs text-med-orange mt-1">{item.description}</p>
      </div>
    </div>
  );
}

function WonderingItem({ question, idx }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-med-purple/5 border border-med-purple/20">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-med-purple/20 shrink-0 mt-0.5">
        <span className="text-xs text-med-purple font-bold">{idx + 1}</span>
      </div>
      <p className="text-sm text-slate-300">{question}</p>
    </div>
  );
}

export default function DebriefingModal({ isOpen, onClose, data, patientName }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-med-border bg-med-card shadow-2xl animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-med-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-med-purple/20 border border-med-purple/30">
              <Award size={18} className="text-med-purple" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Glow & Grow 디브리핑</h2>
              <p className="text-slate-400 text-xs">{patientName} CPR 실습 결과 분석</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Score Summary */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-med-bg border border-med-border">
            <ScoreRing percentage={data.percentage} grade={data.grade} />
            <div className="flex-1">
              <p className={`text-2xl font-bold ${data.grade.color}`}>{data.grade.desc}</p>
              <p className="text-slate-400 text-sm mt-1">{data.score} / {data.maxScore}점</p>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{data.actionCount}</p>
                  <p className="text-xs text-slate-500">총 처치</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-med-green">{data.correctCount}</p>
                  <p className="text-xs text-slate-500">올바른 처치</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    <p className="text-sm font-bold text-white">{data.totalTime}</p>
                  </div>
                  <p className="text-xs text-slate-500">실습 시간</p>
                </div>
              </div>
            </div>
          </div>

          {/* Glow */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-med-green" />
              <h3 className="text-med-green font-bold">Glow — 잘한 점</h3>
              <span className="text-xs text-med-green/60 bg-med-green/10 px-2 py-0.5 rounded-full">
                {data.glows.length}개
              </span>
            </div>
            {data.glows.length > 0 ? (
              <div className="space-y-2">
                {data.glows.map((item, i) => <GlowItem key={i} item={item} />)}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic p-3 bg-slate-800/30 rounded-lg">
                이번 실습에서 수행한 핵심 처치가 없습니다. 다시 시도해 보세요.
              </p>
            )}
          </div>

          {/* Grow */}
          {data.grows.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-med-orange" />
                <h3 className="text-med-orange font-bold">Grow — 보완할 점</h3>
                <span className="text-xs text-med-orange/60 bg-med-orange/10 px-2 py-0.5 rounded-full">
                  {data.grows.length}개
                </span>
              </div>
              <div className="space-y-2">
                {data.grows.map((item, i) => <GrowItem key={i} item={item} />)}
              </div>
            </div>
          )}

          {/* Wondering */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle size={16} className="text-med-purple" />
              <h3 className="text-med-purple font-bold">Wondering — 심화 질문</h3>
            </div>
            <div className="space-y-2">
              {data.wonderings.map((q, i) => <WonderingItem key={i} question={q} idx={i} />)}
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <p className="text-xs text-slate-500 leading-relaxed">
              💡 이 실습의 모든 데이터는 세션 내에서만 처리되며 저장되지 않습니다.
              실제 환자 데이터는 사용되지 않았습니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-med-border shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-med-cyan/15 border border-med-cyan/40 text-med-cyan text-sm font-semibold hover:bg-med-cyan/25 transition-colors"
          >
            다시 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
