import { motion } from 'motion/react';
import { AppMode } from '../../types';
import { Mic, Eye, Zap } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function GuidedModePickerModal({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, guidedAppMode, setShowGuidedModePicker, setPendingGuidedMode,
  } = ctx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="premium-card border border-[var(--acc-primary)]/10 rounded-3xl p-8 w-full max-w-sm flex flex-col gap-3"
      >
        <div className="text-center mb-2">
          <p className="text-[var(--acc-primary)] font-black uppercase tracking-widest text-sm">
            {appLanguage === 'en' ? 'Training Mode' : 'Mode d\'entraînement'}
          </p>
        </div>

        {[
          { id: 'VOICE' as AppMode, label: appLanguage === 'en' ? 'AUDIO' : 'AUDIO', icon: <Mic className="w-5 h-5" /> },
          { id: 'COLOR' as AppMode, label: appLanguage === 'en' ? 'VISUAL' : 'VISUEL', icon: <Eye className="w-5 h-5" /> },
          { id: 'CHAOS' as AppMode, label: 'CHAOS', icon: <Zap className="w-5 h-5" /> },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => {
              setShowGuidedModePicker(false);
              if (m.id === guidedAppMode) return;
              setPendingGuidedMode(m.id);
            }}
            className={`w-full p-4 rounded-2xl text-left font-black uppercase italic tracking-tighter transition-all flex items-center gap-3 ${m.id === guidedAppMode ? 'bg-[var(--acc-primary)] text-[var(--acc-on-primary)]' : 'bg-zinc-900 border border-[var(--acc-primary)]/10 text-[var(--text-primary)]/70 hover:bg-zinc-800'}`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}

        <button
          onClick={() => setShowGuidedModePicker(false)}
          className="w-full py-3 text-[10px] font-black text-[var(--acc-primary)]/70 uppercase tracking-widest hover:text-[var(--acc-primary)] transition-colors"
        >
          {appLanguage === 'en' ? 'Cancel' : 'Annuler'}
        </button>
      </motion.div>
    </div>
  );
}
