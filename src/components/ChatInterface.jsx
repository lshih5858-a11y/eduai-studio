import { useEffect, useRef } from 'react';
import { MessageSquare, AlertTriangle, CheckCircle2, Info, User } from 'lucide-react';

const MSG_STYLES = {
  system: {
    icon: Info,
    bg: 'bg-med-cyan/10 border-med-cyan/20',
    iconColor: 'text-med-cyan',
    textColor: 'text-med-cyan',
    label: 'SYSTEM',
  },
  scenario: {
    icon: MessageSquare,
    bg: 'bg-slate-800/60 border-slate-700/50',
    iconColor: 'text-slate-400',
    textColor: 'text-slate-300',
    label: '상황 설명',
  },
  patient: {
    icon: User,
    bg: 'bg-slate-700/40 border-slate-600/40',
    iconColor: 'text-slate-300',
    textColor: 'text-slate-200',
    label: '환자 반응',
  },
  'feedback-good': {
    icon: CheckCircle2,
    bg: 'bg-med-green/10 border-med-green/25',
    iconColor: 'text-med-green',
    textColor: 'text-med-green',
    label: '평가',
  },
  'feedback-warn': {
    icon: AlertTriangle,
    bg: 'bg-med-orange/10 border-med-orange/25',
    iconColor: 'text-med-orange',
    textColor: 'text-med-orange',
    label: '주의',
  },
};

function ChatMessage({ message }) {
  const style = MSG_STYLES[message.type] || MSG_STYLES.scenario;
  const Icon = style.icon;

  return (
    <div className={`rounded-lg border p-3 animate-slide-up ${style.bg}`}>
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 shrink-0 ${style.iconColor}`}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold mb-1 opacity-70 ${style.iconColor}`}>
            {style.label}
          </div>
          <p className={`text-sm leading-relaxed ${style.textColor}`}>{message.content}</p>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="rounded-lg border bg-slate-700/40 border-slate-600/40 p-3">
      <div className="flex items-center gap-2.5">
        <User size={14} className="text-slate-300" />
        <div className="flex gap-1 items-center">
          <span className="text-xs text-slate-400 mr-1">환자 반응 중</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatInterface({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="bg-med-card border border-med-border rounded-xl flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-med-border shrink-0">
        <MessageSquare size={15} className="text-med-cyan" />
        <span className="text-xs font-semibold text-med-cyan tracking-wider uppercase">Simulation Feed</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-med-green animate-pulse" />
          <span className="text-xs text-med-green">LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 scrollbar-thin">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
