import { motion } from 'motion/react';
import { GuidedCategory } from '../../constants/guidedPresets';
import { ChevronRight } from 'lucide-react';
import { GuidedHeader } from '../../components/ui/GuidedHeader';
import type { AppCtx } from '../../app/useAppCtx';

export function GuidedActivityChoiceStep({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, setGuidedActivity, resetToProfileSelection,
    getGuidedProgress,
  } = ctx;

  return (
    <motion.div 
      key="guided-activity"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
       <GuidedHeader
         onBack={resetToProfileSelection}
         step={getGuidedProgress()?.step}
         total={getGuidedProgress()?.total}
         appLanguage={appLanguage}
       />
       <div className="space-y-3">
        <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter text-center">
          {appLanguage === 'en' ? 'CHOOSE' : 'CHOISIR'} <span className="text-[var(--acc-primary)]">{appLanguage === 'en' ? 'DISCIPLINE' : 'DISCIPLINE'}</span>
        </h1>
        <div className="h-0.5 w-8 bg-white/20 mx-auto rounded-full" />
      </div>

      <div className="flex flex-col gap-4 px-6">
        {[
          { 
            id: 'BOXING', 
            label: appLanguage === 'en' ? 'BOXING' : 'BOXE',
            accent: 'from-red-500 to-rose-600',
            glow: 'shadow-red-500/20',
            icon: '🥊',
            desc: appLanguage === 'en' ? 'Strike as fast as possible' : 'Donne le bon coup le plus vite possible'
          },
          { 
            id: 'SPRINT', 
            label: 'SPRINT',
            accent: 'from-[var(--acc-primary)] to-orange-500',
            glow: 'shadow-[var(--acc-primary)]/20',
            icon: '⚡',
            desc: appLanguage === 'en' ? 'Change direction as fast as possible' : 'Change de direction le plus vite possible'
          },
        ].map(act => (
          <button 
            key={act.id}
            onClick={() => { 
              setGuidedActivity(act.id as GuidedCategory);
              setGuidedStep('ACTIVITY_EXPLAIN');
            }}
            className="group relative flex items-center gap-6 p-6 rounded-3xl transition-all duration-500 bg-zinc-950/50 border border-[var(--acc-primary)]/5 hover:border-[var(--acc-primary)]/20 hover:bg-white/5 active:scale-[0.98] text-left overflow-hidden"
          >
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${act.accent} blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${act.accent} flex items-center justify-center text-3xl shadow-2xl ${act.glow} relative z-10`}
            >
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
              {act.icon}
            </motion.div>
            <div className="flex flex-col flex-1 gap-1.5 relative z-10">
              <h3 className="text-2xl font-black italic tracking-tighter text-white leading-none group-hover:text-[var(--acc-primary)] transition-colors">
                {act.label}
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full bg-gradient-to-br ${act.accent}`} />
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.15em] leading-none">
                  {act.desc}
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ChevronRight className="w-5 h-5 text-[var(--acc-primary)]/60 group-hover:text-[var(--acc-primary)] transition-all group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
