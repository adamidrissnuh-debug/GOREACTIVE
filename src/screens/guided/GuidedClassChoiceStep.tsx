import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import type { AppCtx } from '../../app/useAppCtx';

export function GuidedClassChoiceStep({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, setSelectedClass, resetToProfileSelection,
  } = ctx;

  return (
    <motion.div 
      key="guided-class"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter">
          {appLanguage === 'en' ? 'CHOOSE YOUR CLASS' : 'CHOISIS TA CLASSE'}
        </h1>
        <p className="text-[10px] font-bold text-[var(--acc-primary)] uppercase tracking-widest opacity-60">
          {appLanguage === 'en' ? 'STEP 1: SELECT CATEGORY' : 'ÉTAPE 1 : CHOIX DE LA CATÉGORIE'}
        </p>
      </div>
      <button 
        onClick={() => { setSelectedClass('MOTION'); setGuidedStep('ACTIVITY_CHOICE'); }}
        className="group w-full aspect-video bg-[var(--acc-primary)]/10 border-2 border-[var(--acc-primary)]/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all hover:border-[var(--acc-primary)]/60 hover:bg-[var(--acc-primary)]/20 active:scale-[0.98]"
      >
        <div className="w-20 h-20 rounded-3xl bg-[var(--acc-primary)] flex items-center justify-center text-black shadow-lg shadow-[var(--acc-primary)]/20 group-hover:scale-110 transition-transform">
          <Activity className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-[var(--acc-primary)] uppercase italic tracking-tighter">
            {appLanguage === 'en' ? 'In Motion' : 'Mouvement'}
          </h2>
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">
            {appLanguage === 'en' ? 'Reactivity Training' : 'Réactivité pure'}
          </p>
          <p className="text-[9px] font-medium text-[var(--text-secondary)] uppercase tracking-wide mt-1">
            {appLanguage === 'en' ? 'Choice reaction & attention' : 'Temps de réaction, attention'}
          </p>
        </div>
      </button>

      <button 
        onClick={resetToProfileSelection}
        className="w-full text-[var(--acc-primary)]/70 text-[10px] font-bold uppercase tracking-widest hover:text-[var(--acc-primary)] transition-colors mt-4 text-center"
      >
        {appLanguage === 'en' ? '← Back to experiences' : '← Retour aux expériences'}
      </button>
    </motion.div>
  );
}
