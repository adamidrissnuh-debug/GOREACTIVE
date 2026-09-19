import { motion } from 'motion/react';
import {
  ChevronLeft,
  Ear,
  Eye,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { AppMode } from '../../types';
import type { AppCtx } from '../../app/useAppCtx';

export function ProModeChoiceStep({ ctx }: { ctx: AppCtx }) {
  const {
    setAppMode, appLanguage, setSelectedClass, resetToProfileSelection, setView,
  } = ctx;

  return (
    <>
    <div className="space-y-4">
      <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
        GO<span className="text-[var(--acc-primary)]">REACTIVE</span>
      </h1>
      <p className="text-[var(--acc-primary)] text-[10px] tracking-[0.4em] uppercase font-bold opacity-80">
        {appLanguage === 'en' ? 'TRAINING SUPPORT' : 'SUPPORT D\'ENTRAÎNEMENT'}
      </p>
    </div>
      <motion.div 
        key="motion-modes"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <button 
          onClick={resetToProfileSelection}
          className="flex items-center gap-2 text-[var(--acc-primary)]/70 hover:text-[var(--acc-primary)] transition-colors uppercase font-black text-[10px] tracking-widest mb-1"
        >
          <ChevronLeft className="w-4 h-4" />
          {appLanguage === 'en' ? 'Back' : 'Retour'}
        </button>
        <div className="flex flex-col gap-3">
          {[
            { id: 'VOICE', icon: <Ear className="w-5 h-5"/>, label: appLanguage === 'en' ? 'Audio' : 'Audio', desc: appLanguage === 'en' ? 'Sound Reflexes' : 'Réflexe Sonore' },
            { id: 'COLOR', icon: <Eye className="w-5 h-5"/>, label: appLanguage === 'en' ? 'Visual' : 'Visuel', desc: appLanguage === 'en' ? 'Visual Cues' : 'Signaux Visuels' },
            { id: 'CHAOS', icon: <Zap className="w-5 h-5"/>, label: appLanguage === 'en' ? 'Mixed' : 'Mixte', desc: appLanguage === 'en' ? 'Dual Task' : 'Double Tâche' },
          ].map(m => (
            <button 
              key={m.id}
              onClick={() => { setSelectedClass('MOTION'); setAppMode(m.id as AppMode); setView('training'); }}
              className="group w-full flex items-center gap-4 px-5 py-4 bg-white/5 border border-[var(--acc-primary)]/8 rounded-2xl transition-all hover:bg-[var(--acc-primary)]/10 hover:border-[var(--acc-primary)]/30 active:scale-[0.98]"
            >
              <div className="w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--acc-primary)] group-hover:text-black transition-all shrink-0">
                {m.icon}
              </div>
              <div className="text-left flex-1">
                <h3 className="text-sm font-black uppercase italic group-hover:text-[var(--acc-primary)] transition-colors tracking-tight">
                  {m.label}
                </h3>
                <p className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] mt-0.5">
                  {m.desc}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--acc-primary)]/60 group-hover:text-[var(--acc-primary)] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>
      </>
  );
}
