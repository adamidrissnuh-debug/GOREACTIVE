import { AnimatePresence, motion } from 'motion/react';
import type { AppCtx } from '../../app/useAppCtx';

export function CountdownOverlay({ ctx }: { ctx: AppCtx }) {
  const {
    setIsPaused, appLanguage, countdownDuration, countdownRemaining,
    setCountdownRemaining, isResumeCountdown, setIsResumeCountdown, stopTraining,
  } = ctx;

  return (
    <div
      className="fixed inset-0 z-[3000] bg-black flex flex-col items-center justify-center p-8"
    >
      <div className="relative flex items-center justify-center mb-3">
        <AnimatePresence mode="wait">
          <motion.span
            key={countdownRemaining}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="text-9xl font-black text-[var(--text-primary)] italic tracking-tighter tabular-nums"
          >
            {countdownRemaining}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-1.5 mb-4">
        {Array.from({ length: Math.max(1, countdownDuration) }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
                        i < (countdownDuration - Math.max(0, countdownRemaining))
                          ? 'w-6 bg-[var(--acc-primary)]'
                          : 'w-3 bg-[var(--acc-primary)]/15'
                      }`}
          />
        ))}
      </div>
      <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.5em]">
        {appLanguage === 'en' ? 'GET READY' : 'PRÉPARE-TOI'}
      </span>
      <button 
        onClick={() => {
          if (isResumeCountdown) {
            // Cancel a resume-after-pause countdown: go back to the
            // pause screen instead of ending the whole session.
            setCountdownRemaining(null);
            setIsResumeCountdown(false);
            setIsPaused(true);
          } else {
            stopTraining();
          }
        }}
        className="mt-12 text-[10px] font-black text-red-500/40 uppercase tracking-[0.3em] hover:text-red-500 transition-colors"
      >
        {appLanguage === 'en' ? 'CANCEL' : 'ANNULER'}
      </button>
    </div>
  );
}
