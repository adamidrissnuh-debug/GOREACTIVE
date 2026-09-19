import { motion } from 'motion/react';
import type { AppCtx } from '../../app/useAppCtx';

export function PendingGuidedModeModal({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedAppMode, setGuidedSignalMode, pendingGuidedMode,
    setPendingGuidedMode, enterBoxingTutorial, setView,
  } = ctx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="premium-card border border-[var(--acc-primary)]/10 rounded-3xl p-8 w-full max-w-sm flex flex-col gap-4"
      >
        <div className="text-center">
          <p className="text-[var(--acc-primary)] font-black uppercase tracking-widest text-sm mb-2">
            {appLanguage === 'en' ? 'Review the tutorial?' : 'Revoir le tutoriel ?'}
          </p>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">
            {appLanguage === 'en'
              ? 'Would you like to see how this mode works before continuing?'
              : 'Tu veux revoir comment fonctionne ce mode avant de continuer ?'}
          </p>
        </div>

        <button
          onClick={() => {
            const mode = pendingGuidedMode;
            setPendingGuidedMode(null);
            setGuidedAppMode(mode);
            setGuidedSignalMode(mode === 'VOICE' ? 'AUDIO' : mode === 'COLOR' ? 'VISUAL' : 'CHAOS');
            enterBoxingTutorial();
            setView('training');
          }}
          className="w-full py-4 rounded-2xl bg-[var(--acc-primary)] text-[var(--acc-on-primary)] font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
        >
          {appLanguage === 'en' ? 'Yes, show tutorial' : 'Oui, revoir le tutoriel'}
        </button>
        <button
          onClick={() => {
            const mode = pendingGuidedMode;
            setPendingGuidedMode(null);
            setGuidedAppMode(mode);
            setGuidedSignalMode(mode === 'VOICE' ? 'AUDIO' : mode === 'COLOR' ? 'VISUAL' : 'CHAOS');
          }}
          className="w-full py-4 rounded-2xl bg-white/5 border border-[var(--acc-primary)]/10 text-[var(--text-secondary)] font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
        >
          {appLanguage === 'en' ? 'No, just switch' : 'Non, juste changer'}
        </button>
      </motion.div>
    </div>
  );
}
