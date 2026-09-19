import { motion } from 'motion/react';
import { ClipboardList } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function PostSessionErrorModal({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setShowEvaluation, lastSessionStats, setLastSessionStats, setErrorMode,
    setGuidedErrorMode, setShowPostSessionErrorModal, postSessionErrorCount,
    setPostSessionErrorCount, isGuidedActive,
  } = ctx;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0d0d0d] border border-[var(--acc-primary)]/10 rounded-3xl p-8 w-full max-w-xs flex flex-col gap-7 shadow-2xl"
      >
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-[var(--acc-primary)]" />
          </div>
          <p className="text-white font-black uppercase tracking-widest text-sm">
            {appLanguage === 'en' ? 'How many errors?' : "Combien d'erreurs ?"}
          </p>
          <p className="text-[var(--text-secondary)] text-[9px] font-black uppercase tracking-widest mt-1">
            {appLanguage === 'en' ? 'Enter your self-declared errors' : 'Saisis tes erreurs déclarées'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setPostSessionErrorCount(Math.max(0, postSessionErrorCount - 1))}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-[var(--acc-primary)]/10 text-white text-2xl font-black flex items-center justify-center active:scale-90 transition-all hover:bg-white/10"
          >−</button>
          <span className="text-white font-black text-6xl w-16 text-center font-mono tabular-nums">{postSessionErrorCount}</span>
          <button
            onClick={() => setPostSessionErrorCount(postSessionErrorCount + 1)}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-[var(--acc-primary)]/10 text-white text-2xl font-black flex items-center justify-center active:scale-90 transition-all hover:bg-white/10"
          >+</button>
        </div>

        <button
          onClick={() => {
            if (lastSessionStats) {
              setLastSessionStats((prev: any) => prev ? { ...prev, failures: postSessionErrorCount } : prev);
            }
            setShowPostSessionErrorModal(false);
            if (isGuidedActive) setGuidedErrorMode(null); else setErrorMode(null);
            setShowEvaluation(true);
          }}
          className="w-full py-4 rounded-2xl bg-[var(--acc-primary)] text-[var(--acc-on-primary)] font-black uppercase tracking-widest text-xs active:scale-95 transition-transform shadow-lg shadow-[var(--acc-primary)]/20"
        >
          {appLanguage === 'en' ? 'Confirm' : 'Confirmer'}
        </button>
      </motion.div>
    </div>
  );
}
