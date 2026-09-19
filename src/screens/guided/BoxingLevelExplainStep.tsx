import { motion } from 'motion/react';
import { ChevronRight, BrainCircuit } from 'lucide-react';
import { GuidedHeader } from '../../components/ui/GuidedHeader';
import type { AppCtx } from '../../app/useAppCtx';

export function BoxingLevelExplainStep({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, setNeuroFlowActive, getGuidedProgress,
  } = ctx;

  return (
    <motion.div
      key="guided-boxing-level-explain"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <GuidedHeader
        onBack={() => setGuidedStep('BOXING_SENSE_CHOICE')}
        step={getGuidedProgress()?.step}
        total={getGuidedProgress()?.total}
        appLanguage={appLanguage}
      />
      <div className="space-y-6">
        <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter text-center leading-tight">
          {appLanguage === 'en' ? 'CHOOSE YOUR' : 'CHOISIS TON'} <br/>
          <span className="text-[var(--acc-primary)]">{appLanguage === 'en' ? 'EXPERIENCE' : 'PARCOURS'}</span>
        </h1>
        <div className="h-1 w-12 bg-[var(--acc-primary)] mx-auto rounded-full" />
        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed text-center px-12 uppercase font-bold tracking-[0.3em]">
          {appLanguage === 'en' 
            ? 'Select how you want to progress today.'
            : 'Sélectionne la manière dont tu souhaites progresser aujourd\'hui.'}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 pt-4 px-4 w-full max-w-sm mx-auto">
        <button 
          onClick={() => {
            setNeuroFlowActive(false);
            setGuidedStep('LEVEL_CHOICE');
          }} 
          className="w-full bg-white text-black font-black uppercase italic tracking-tighter p-5 rounded-2xl hover:bg-[var(--acc-primary)] active:scale-[0.97] transition-all shadow-xl flex flex-col items-center justify-center gap-1 group"
        >
          <div className="flex items-center gap-2 text-lg">
            {appLanguage === 'en' ? 'STANDARD LEVELS' : 'NIVEAUX STANDARDS'}
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] opacity-40 lowercase font-bold tracking-widest leading-none">
            {appLanguage === 'en' ? 'Fixed difficulty progression' : 'Progression par paliers fixes'}
          </span>
        </button>

        <button 
          onClick={() => {
            setNeuroFlowActive(true);
            setGuidedStep('NEURO_FLOW_EXPLAIN');
          }} 
          className="w-full bg-zinc-900 border-2 border-[var(--acc-primary)]/20 text-[var(--acc-primary)] font-black uppercase italic tracking-tighter p-5 rounded-2xl hover:bg-[var(--acc-primary)]/10 hover:border-[var(--acc-primary)] active:scale-[0.97] transition-all shadow-xl flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
        >
          <div className="relative z-10 flex items-center gap-3 text-lg">
            <BrainCircuit className="w-6 h-6" />
            {appLanguage === 'en' ? 'NEURO-FLOW' : 'NEURO-FLOW'}
          </div>
          <span className="relative z-10 text-[10px] opacity-40 lowercase font-bold tracking-widest leading-none">
            {appLanguage === 'en' ? 'Real-time adaptive difficulty' : 'Difficulté adaptative en temps réel'}
          </span>
          <div className="absolute inset-0 bg-[var(--acc-primary)]/5 animate-pulse" />
        </button>
      </div>
    </motion.div>
  );
}
