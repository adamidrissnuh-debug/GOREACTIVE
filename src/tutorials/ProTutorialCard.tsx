import { motion } from 'motion/react';
import type { AppCtx } from '../app/useAppCtx';

export function ProTutorialCard({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, proTutorialStep, setProTutorialStep, proTutorialSteps,
    advanceProTutorial,
  } = ctx;

  return (
    <motion.div
      key="pro-tutorial-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="fixed left-4 right-4 z-[2800] premium-card rounded-[1.75rem] p-5 shadow-2xl border border-[var(--acc-primary)]/20"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {proTutorialSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                    i === proTutorialStep ? 'w-5 bg-[var(--acc-primary)]' : 'w-1.5 bg-white/15'
                  }`}
            />
          ))}
        </div>
        <button
          onClick={() => setProTutorialStep(null)}
          className="text-[9px] font-black text-[var(--acc-primary)] uppercase tracking-widest active:opacity-70 hover:opacity-80 transition-opacity"
        >
          {appLanguage === 'en' ? 'Skip' : 'Passer'}
        </button>
      </div>

      <h3 className="text-sm font-black text-[var(--text-primary)] uppercase italic tracking-tight mb-1.5">
        {proTutorialSteps[proTutorialStep].title}
      </h3>
      <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed mb-4">
        {proTutorialSteps[proTutorialStep].desc}
      </p>

      <div className="flex items-center gap-2">
        {proTutorialStep > 0 && (
          <button
            onClick={() => advanceProTutorial(-1)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-[var(--acc-primary)]/10 text-[var(--text-primary)] text-[10px] font-black uppercase tracking-widest active:scale-95 hover:bg-white/10 transition-all"
          >
            {appLanguage === 'en' ? 'Back' : 'Précédent'}
          </button>
        )}
        <button
          onClick={() => advanceProTutorial(1)}
          className="flex-1 py-2.5 rounded-xl bg-[var(--acc-primary)] text-[var(--acc-on-primary)] text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
        >
          {proTutorialStep === proTutorialSteps.length - 1
            ? (appLanguage === 'en' ? 'Done' : 'Terminé')
            : (appLanguage === 'en' ? 'Next' : 'Suivant')}
        </button>
      </div>
    </motion.div>
  );
}
