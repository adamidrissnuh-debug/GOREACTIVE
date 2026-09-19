import { PackageX } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function NoStimuliWarningModal({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setShowNoStimuliWarning, setView,
  } = ctx;

  return (
    <div
      className="fixed inset-0 z-[3300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
      onClick={() => setShowNoStimuliWarning(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="premium-card border border-[var(--acc-primary)]/10 rounded-3xl p-8 w-full max-w-sm flex flex-col gap-6 text-center"
      >
        <div className="space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <PackageX className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-lg font-black text-[var(--text-primary)] uppercase italic">
            {appLanguage === 'en' ? 'No stimuli configured' : 'Aucun stimulus configuré'}
          </h2>
          <p className="text-[var(--text-secondary)] text-[11px] font-bold uppercase tracking-widest leading-relaxed">
            {appLanguage === 'en'
              ? 'Add at least one word, letter or color in Stimuli before you can start a session.'
              : 'Ajoute au moins un mot, une lettre ou une couleur dans Stimuli avant de pouvoir lancer une séance.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNoStimuliWarning(false)}
            className="flex-1 py-4 rounded-2xl bg-white/5 border border-[var(--acc-primary)]/10 text-[var(--text-primary)] font-black uppercase tracking-widest text-xs active:scale-95 hover:bg-white/10 transition-all"
          >
            {appLanguage === 'en' ? 'Close' : 'Fermer'}
          </button>
          <button
            onClick={() => { setShowNoStimuliWarning(false); setView('library'); }}
            className="flex-1 py-4 rounded-2xl bg-[var(--acc-primary)] text-[var(--acc-on-primary)] font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
          >
            {appLanguage === 'en' ? 'Add stimuli' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
