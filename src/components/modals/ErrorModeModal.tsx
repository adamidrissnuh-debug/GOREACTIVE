import { motion } from 'motion/react';
import { Headphones, ClipboardList, Play } from 'lucide-react';
import { earphonesRequiredWarning } from '../../lib/utils';
import type { AppCtx } from '../../app/useAppCtx';

export function ErrorModeModal({ ctx }: { ctx: AppCtx }) {
  const {
    hasMovementCalibrationPassed, appLanguage, setMovementErrorTrackingEnabled,
    setErrorMode, setShowErrorModeModal, setGuidedMovementErrorTrackingEnabled,
    setGuidedErrorMode, isGuidedActive, setShowMovementCalibrationModal,
    setMovementCalibrationCount, movementCalibrationCountRef, startTrainingFlow,
  } = ctx;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="premium-card border border-[var(--acc-primary)]/10 rounded-3xl p-8 w-full max-w-sm flex flex-col gap-6"
      >
        <div className="text-center">
          <p className="text-[var(--acc-primary)] font-black uppercase tracking-widest text-sm mb-2">
            {appLanguage === 'en' ? 'Error Tracking Mode' : 'Mode de suivi des erreurs'}
          </p>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">
            {appLanguage === 'en' ? 'How do you want to track your errors?' : 'Comment veux-tu comptabiliser tes erreurs ?'}
          </p>
        </div>

        {/* Option live */}
        <button
          onClick={() => {
            if (isGuidedActive) { setGuidedErrorMode('live'); setGuidedMovementErrorTrackingEnabled(true); } else { setErrorMode('live'); setMovementErrorTrackingEnabled(true); }
            setShowErrorModeModal(false);
            if (!hasMovementCalibrationPassed) {
              movementCalibrationCountRef.current = 0;
              setMovementCalibrationCount(0);
              setShowMovementCalibrationModal(true);
            } else {
              startTrainingFlow();
            }
          }}
          className="group flex flex-col gap-2 p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--acc-primary)]/50 hover:bg-[var(--acc-primary)]/5 text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 flex items-center justify-center text-[var(--acc-primary)] shrink-0 group-hover:bg-[var(--acc-primary)] group-hover:text-[var(--acc-on-primary)] transition-colors">
              <Headphones className="w-4.5 h-4.5" />
            </div>
            <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-xs">
              {appLanguage === 'en' ? 'Live errors' : 'Erreurs en direct'}
            </p>
          </div>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            {appLanguage === 'en' ? 'Say "No" or "False" during training. ' : 'Dis "Faux" ou "Non" pendant l\'entraînement. '}
            {earphonesRequiredWarning(appLanguage)}
          </p>
        </button>

        {/* Option post */}
        <button
          onClick={() => {
            if (isGuidedActive) { setGuidedErrorMode('post'); setGuidedMovementErrorTrackingEnabled(true); } else { setErrorMode('post'); setMovementErrorTrackingEnabled(true); }
            setShowErrorModeModal(false);
            startTrainingFlow();
          }}
          className="group flex flex-col gap-2 p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--acc-primary)]/50 hover:bg-[var(--acc-primary)]/5 text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 flex items-center justify-center text-[var(--acc-primary)] shrink-0 group-hover:bg-[var(--acc-primary)] group-hover:text-[var(--acc-on-primary)] transition-colors">
              <ClipboardList className="w-4.5 h-4.5" />
            </div>
            <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-xs">
              {appLanguage === 'en' ? 'Errors after session' : 'Erreurs après la séance'}
            </p>
          </div>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            {appLanguage === 'en'
              ? 'Count your errors mentally, then enter the total at the end. No earphones needed.'
              : 'Compte tes erreurs mentalement, puis saisis le total à la fin. Aucun écouteur nécessaire.'}
          </p>
        </button>

        {/* Option none */}
        <button
          onClick={() => {
            if (isGuidedActive) { setGuidedErrorMode('none'); setGuidedMovementErrorTrackingEnabled(false); } else { setErrorMode('none'); setMovementErrorTrackingEnabled(false); }
            setShowErrorModeModal(false);
            startTrainingFlow();
          }}
          className="group flex flex-col gap-2 p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--acc-primary)]/50 hover:bg-[var(--acc-primary)]/5 text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--acc-primary)]/10 border border-[var(--acc-primary)]/20 flex items-center justify-center text-[var(--acc-primary)] shrink-0 group-hover:bg-[var(--acc-primary)] group-hover:text-[var(--acc-on-primary)] transition-colors">
              <Play className="w-4.5 h-4.5" />
            </div>
            <p className="text-[var(--text-primary)] font-black uppercase tracking-widest text-xs">
              {appLanguage === 'en' ? 'No errors' : 'Pas d\'erreurs'}
            </p>
          </div>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            {appLanguage === 'en'
              ? 'Just train freely — nothing to say or count, no error stats for this session.'
              : 'Entraîne-toi librement — rien à dire ni à compter, aucune statistique d\'erreur pour cette séance.'}
          </p>
        </button>
      </motion.div>
    </div>
  );
}
