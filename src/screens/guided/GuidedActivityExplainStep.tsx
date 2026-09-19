import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { GuidedHeader } from '../../components/ui/GuidedHeader';
import type { AppCtx } from '../../app/useAppCtx';

export function GuidedActivityExplainStep({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, guidedActivity, setGuidedAppMode, enterSprintTutorial,
    getGuidedProgress,
  } = ctx;

  return (
    <motion.div 
       key="guided-explain"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <GuidedHeader
        onBack={() => setGuidedStep('ACTIVITY_CHOICE')}
        step={getGuidedProgress()?.step}
        total={getGuidedProgress()?.total}
        appLanguage={appLanguage}
      />
      <div className="space-y-8 flex flex-col items-center">
        <div className="relative">
          <motion.div 
            initial={{ rotate: -15, scale: 0.8 }}
            animate={{ rotate: [0, 5, -5, 0], scale: 1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className={`w-32 h-32 rounded-[2rem] bg-gradient-to-br ${guidedActivity === 'BOXING' ? 'from-red-500 to-rose-700 shadow-red-500/40' : 'from-[var(--acc-primary)] to-orange-600 shadow-[var(--acc-primary)]/40'} flex items-center justify-center text-6xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/30 blur-2xl rounded-full" />
            {guidedActivity === 'BOXING' ? '🥊' : '⚡'}
          </motion.div>
          {/* Decorative rings */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`absolute -inset-4 border-2 border-dashed ${guidedActivity === 'BOXING' ? 'border-red-500/30' : 'border-[var(--acc-primary)]/30'} rounded-[2.5rem]`} 
          />
        </div>

        <div className="space-y-4 text-center">
          <div className="space-y-1">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter leading-none"
            >
              {guidedActivity === 'BOXING' 
                ? (appLanguage === 'en' ? 'BOXING ELITE' : 'L\'ÉLITE BOXE') 
                : (appLanguage === 'en' ? 'NEURAL SPRINT' : 'SPRINT NEURAL')}
            </motion.h1>
            <div className={`h-1.5 w-20 mx-auto rounded-full bg-gradient-to-r ${guidedActivity === 'BOXING' ? 'from-red-500 to-transparent' : 'from-[var(--acc-primary)] to-transparent'}`} />
          </div>

          <p className="text-xs font-black text-[var(--text-secondary)] max-w-[280px] mx-auto uppercase tracking-[0.2em] leading-relaxed italic">
            {guidedActivity === 'BOXING'
              ? (appLanguage === 'en' ? 'Your brain learns to react, not to guess.' : 'Le cerveau apprend à réagir, pas à deviner.')
              : (appLanguage === 'en' ? 'Your body redirects before you consciously decide.' : 'Le corps change de cap avant que tu y penses.')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {(guidedActivity === 'BOXING'
              ? [
                  appLanguage === 'en' ? 'No predictable rhythm' : 'Zéro rythme prévisible',
                  appLanguage === 'en' ? 'Pure reaction, no anticipation' : 'Réaction pure, sans anticipation',
                ]
              : [
                  appLanguage === 'en' ? 'Unpredictable direction changes' : 'Changements de direction imprévisibles',
                  appLanguage === 'en' ? 'Pure reflex, no routine' : 'Réflexe pur, sans routine',
                ]
            ).map((fact, i) => (
              <span
                key={i}
                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${guidedActivity === 'BOXING' ? 'text-red-400 border-red-500/25 bg-red-500/5' : 'text-[var(--acc-primary)] border-[var(--acc-primary)]/25 bg-[var(--acc-primary)]/5'}`}
              >
                {fact}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full space-y-4 pt-4 px-4">
          {guidedActivity === 'BOXING' ? (
            <button 
              onClick={() => setGuidedStep('BOXING_SENSE_CHOICE')}
              className="w-full py-6 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-[var(--acc-primary)] hover:text-[var(--acc-on-primary)] active:scale-[0.98] transition-all shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] text-xl flex items-center justify-center gap-3 group"
            >
              {appLanguage === 'en' ? 'CONTINUE' : 'CONTINUER'}
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={() => {
                setGuidedAppMode('VOICE');
                enterSprintTutorial();
              }}
              className="w-full py-6 bg-white text-black font-black uppercase italic rounded-2xl hover:bg-[var(--acc-primary)] hover:text-[var(--acc-on-primary)] active:scale-[0.98] transition-all shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] text-xl flex items-center justify-center gap-3 group"
            >
              {appLanguage === 'en' ? 'ENTER TRAINING' : 'LANCER LA SESSION'}
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
