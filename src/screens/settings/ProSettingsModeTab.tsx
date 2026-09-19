import { Mic, Eye, Zap } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function ProSettingsModeTab({ ctx }: { ctx: AppCtx }) {
  const {
    appMode, setAppMode, appLanguage, stopTraining,
  } = ctx;

  return (
    <div className="grid grid-cols-3 gap-2">
      {[
        { id: 'VOICE', label: appLanguage === 'en' ? 'AUDIO' : 'AUDIO', icon: <Mic className="w-3.5 h-3.5" /> },
        { id: 'COLOR', label: appLanguage === 'en' ? 'VISUAL' : 'VISUEL', icon: <Eye className="w-3.5 h-3.5" /> },
        { id: 'CHAOS', label: 'CHAOS', icon: <Zap className="w-3.5 h-3.5" /> }
      ].map(m => (
        <button 
          key={m.id}
          onClick={() => { stopTraining(); setAppMode(m.id as any); }}
          className={`py-3 px-1 rounded-2xl text-[8px] font-black uppercase transition-all border flex flex-col items-center gap-1.5 active:scale-95 ${
                          appMode === m.id
                            ? 'bg-[var(--acc-primary)]/10 text-[var(--acc-primary)] border-[var(--acc-primary)] shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--acc-primary)]/20'
                        }`}
        >
          {m.icon}
          <span className="truncate">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
