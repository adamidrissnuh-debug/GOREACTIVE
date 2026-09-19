import { ClipboardList, Trash2 } from 'lucide-react';
import { translateMode } from '../../lib/utils';
import type { AppCtx } from '../../app/useAppCtx';

export function ProSettingsProtocolsTab({ ctx }: { ctx: AppCtx }) {
  const {
    appMode, appLanguage, savedProtocols, setShowProtocolRecap, loadProtocol,
    deleteProtocol,
  } = ctx;

  return (
    <div className="space-y-3">
      {savedProtocols.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[var(--acc-primary)] opacity-70" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
              {appLanguage === 'en' ? 'No protocol saved yet' : 'Aucun protocole enregistré'}
            </p>
            <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-tight max-w-[220px] mx-auto leading-relaxed">
              {appLanguage === 'en' ? 'Save your setup once to relaunch the exact same test later.' : 'Sauvegarde ta config une fois pour relancer exactement le même test plus tard.'}
            </p>
          </div>
        </div>
      ) : (
        savedProtocols.map(p => (
          <div key={p.id} className="flex items-center gap-3 bg-white/5 border border-[var(--acc-primary)]/10 rounded-2xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-[var(--text-primary)] uppercase italic truncate">{p.name}</p>
              <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-tight">
                {translateMode(p.mode, appLanguage || 'fr')} · {p.minInterval.toFixed(1)}-{p.maxInterval.toFixed(1)}s · {p.workDuration}min
              </p>
            </div>
            <button onClick={() => loadProtocol(p)} className="px-3 py-2 rounded-xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 text-[var(--acc-primary)] text-[9px] font-black uppercase tracking-widest active:scale-95 hover:bg-[var(--acc-primary)]/20 transition-all shrink-0">
              {appLanguage === 'en' ? 'Load' : 'Charger'}
            </button>
            <button onClick={() => deleteProtocol(p.id)} className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center active:scale-90 hover:bg-red-500/20 transition-all shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))
      )}
      <button
        onClick={() => setShowProtocolRecap(true)}
        disabled={!appMode}
        className="w-full py-3.5 rounded-2xl bg-[var(--acc-primary)] text-[var(--acc-on-primary)] font-black uppercase italic tracking-tight text-xs active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        {appLanguage === 'en' ? '+ Save current setup' : '+ Sauvegarder la config actuelle'}
      </button>
    </div>
  );
}
