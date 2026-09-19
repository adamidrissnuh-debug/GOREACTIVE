import { motion } from 'motion/react';
import { BrainCircuit } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function GuidedFormatPickerModal({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, neuroFlowActive, setNeuroFlowActive,
    setShowGuidedFormatPicker, setView,
  } = ctx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="premium-card border border-[var(--acc-primary)]/10 rounded-3xl p-8 w-full max-w-sm flex flex-col gap-4"
      >
        <div className="text-center mb-2">
          <p className="text-[var(--acc-primary)] font-black uppercase tracking-widest text-sm">
            {appLanguage === 'en' ? 'Training Format' : 'Format d\'entraînement'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowGuidedFormatPicker(false);
            if (neuroFlowActive) {
              setNeuroFlowActive(false);
              setGuidedStep('LEVEL_CHOICE');
              setView('training');
            }
          }}
          className={`w-full p-5 rounded-2xl text-left font-black uppercase italic tracking-tighter transition-all ${!neuroFlowActive ? 'bg-white text-black' : 'bg-zinc-900 border border-[var(--acc-primary)]/10 text-[var(--text-primary)]/70 hover:bg-zinc-800'}`}
        >
          {appLanguage === 'en' ? 'STANDARD LEVELS' : 'NIVEAUX STANDARDS'}
          <span className="block text-[9px] opacity-50 font-bold not-italic normal-case tracking-widest mt-1">
            {appLanguage === 'en' ? 'Fixed difficulty progression' : 'Progression par paliers fixes'}
          </span>
        </button>

        <button
          onClick={() => {
            setShowGuidedFormatPicker(false);
            if (!neuroFlowActive) {
              setNeuroFlowActive(true);
              setGuidedStep('NEURO_FLOW_EXPLAIN');
              setView('training');
            }
          }}
          className={`w-full p-5 rounded-2xl text-left font-black uppercase italic tracking-tighter transition-all flex items-center gap-2 ${neuroFlowActive ? 'bg-[var(--acc-primary)] text-[var(--acc-on-primary)]' : 'bg-zinc-900 border border-[var(--acc-primary)]/10 text-[var(--text-primary)]/70 hover:bg-zinc-800'}`}
        >
          <BrainCircuit className="w-5 h-5 shrink-0" />
          <span>
            NEURO-FLOW
            <span className="block text-[9px] opacity-50 font-bold not-italic normal-case tracking-widest mt-1">
              {appLanguage === 'en' ? 'Real-time adaptive difficulty' : 'Difficulté adaptative en temps réel'}
            </span>
          </span>
        </button>

        <button
          onClick={() => setShowGuidedFormatPicker(false)}
          className="w-full py-3 text-[10px] font-black text-[var(--acc-primary)]/70 uppercase tracking-widest hover:text-[var(--acc-primary)] transition-colors"
        >
          {appLanguage === 'en' ? 'Cancel' : 'Annuler'}
        </button>
      </motion.div>
    </div>
  );
}
