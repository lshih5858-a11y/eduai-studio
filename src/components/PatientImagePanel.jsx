import { User, AlertCircle, CheckCircle2 } from 'lucide-react';

function PatientSvg({ stage, consciousness }) {
  const isConscious = consciousness && !consciousness.includes('GCS 3');
  const isROSC = stage === 'OUTCOME';

  return (
    <svg viewBox="0 0 120 200" className="w-full max-w-[120px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body glow */}
      {isROSC && (
        <ellipse cx="60" cy="100" rx="40" ry="80" fill="rgba(16,185,129,0.06)" />
      )}
      {/* Head */}
      <circle cx="60" cy="35" r="22" fill="#374151" stroke="#4B5563" strokeWidth="1.5" />
      {/* Face */}
      <ellipse cx="60" cy="36" rx="15" ry="17" fill="#4B5563" />
      {/* Eyes */}
      {isConscious ? (
        <>
          <circle cx="54" cy="32" r="3" fill="#1F2937" />
          <circle cx="66" cy="32" r="3" fill="#1F2937" />
          <circle cx="55" cy="31" r="1" fill="white" opacity="0.8" />
          <circle cx="67" cy="31" r="1" fill="white" opacity="0.8" />
        </>
      ) : (
        <>
          <line x1="51" y1="32" x2="57" y2="32" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="63" y1="32" x2="69" y2="32" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {/* Mouth */}
      {isROSC ? (
        <path d="M54 42 Q60 46 66 42" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      ) : (
        <line x1="55" y1="43" x2="65" y2="43" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" />
      )}

      {/* Body */}
      <rect x="35" y="56" width="50" height="75" rx="8" fill="#374151" stroke="#4B5563" strokeWidth="1.5" />

      {/* Chest compression ripple (INTERVENTION stage) */}
      {stage === 'INTERVENTION' && (
        <>
          <circle cx="60" cy="80" r="12" stroke="#00d4ff" strokeWidth="1" opacity="0.3" />
          <circle cx="60" cy="80" r="8" stroke="#00d4ff" strokeWidth="1" opacity="0.5" />
          <circle cx="60" cy="80" r="4" fill="#00d4ff" opacity="0.3" />
        </>
      )}

      {/* AED pads indicator */}
      {stage === 'INTERVENTION' && (
        <>
          <rect x="38" y="62" width="12" height="8" rx="2" fill="#EAB308" opacity="0.7" />
          <rect x="67" y="75" width="12" height="8" rx="2" fill="#EAB308" opacity="0.7" />
        </>
      )}

      {/* Arms */}
      <rect x="16" y="58" width="20" height="55" rx="8" fill="#374151" stroke="#4B5563" strokeWidth="1.5" />
      <rect x="84" y="58" width="20" height="55" rx="8" fill="#374151" stroke="#4B5563" strokeWidth="1.5" />

      {/* Legs */}
      <rect x="36" y="128" width="20" height="58" rx="8" fill="#374151" stroke="#4B5563" strokeWidth="1.5" />
      <rect x="64" y="128" width="20" height="58" rx="8" fill="#374151" stroke="#4B5563" strokeWidth="1.5" />

      {/* Oxygen mask (OUTCOME) */}
      {isROSC && (
        <ellipse cx="60" cy="42" rx="10" ry="7" fill="#3B82F6" opacity="0.5" stroke="#60A5FA" strokeWidth="1" />
      )}

      {/* Status glow overlay */}
      {stage === 'OUTCOME' && (
        <ellipse cx="60" cy="100" rx="38" ry="78" stroke="#10B981" strokeWidth="1" opacity="0.3" fill="none" />
      )}
    </svg>
  );
}

const STAGE_STATUS = {
  DISCOVERY: { label: '심정지 의심', color: 'text-med-red bg-med-red/10 border-med-red/30', icon: AlertCircle },
  ASSESSMENT: { label: '사정 중', color: 'text-med-yellow bg-med-yellow/10 border-med-yellow/30', icon: AlertCircle },
  INTERVENTION: { label: 'CPR 시행 중', color: 'text-med-cyan bg-med-cyan/10 border-med-cyan/30', icon: AlertCircle },
  OUTCOME: { label: 'ROSC 달성', color: 'text-med-green bg-med-green/10 border-med-green/30', icon: CheckCircle2 },
};

export default function PatientImagePanel({ stage, vitals }) {
  const status = STAGE_STATUS[stage] || STAGE_STATUS.DISCOVERY;
  const StatusIcon = status.icon;

  return (
    <div className="bg-med-card border border-med-border rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <User size={15} className="text-med-cyan" />
        <span className="text-xs font-semibold text-med-cyan tracking-wider uppercase">Patient View</span>
      </div>

      {/* 환자 이미지 영역 (나노바나나 생성 이미지 자리) */}
      <div className="relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-lg border border-med-border flex flex-col items-center justify-center p-4 gap-2 min-h-[220px]">
        <div className="absolute top-2 right-2 text-xs text-slate-600 bg-slate-800/80 px-2 py-0.5 rounded">
          Nano Banana Image
        </div>

        <PatientSvg stage={stage} consciousness={vitals.consciousness} />

        <div className="text-center mt-1">
          <p className="text-white text-sm font-semibold">김철수 (65세, 남성)</p>
          <p className="text-slate-400 text-xs">고혈압 · 당뇨병</p>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${status.color}`}>
        <StatusIcon size={13} />
        {status.label}
      </div>

      <div className="bg-black/30 rounded-lg border border-med-border p-2.5">
        <p className="text-xs text-slate-500 font-semibold mb-1.5">현재 리듬</p>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              vitals.heartRate === 0 ? 'bg-med-red animate-blink-dot' : 'bg-med-green animate-pulse'
            }`}
          />
          <span className={`text-xs font-mono font-semibold ${vitals.heartRate === 0 ? 'text-med-red' : 'text-med-green'}`}>
            {vitals.heartRate === 0 ? 'VF / Flatline' : vitals.rhythm || 'Sinus Rhythm'}
          </span>
        </div>
      </div>
    </div>
  );
}
