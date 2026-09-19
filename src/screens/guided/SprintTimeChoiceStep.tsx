import { motion } from 'motion/react';
import { GUIDED_PRESETS } from '../../constants/guidedPresets';
import { GuidedHeader } from '../../components/ui/GuidedHeader';
import type { AppCtx } from '../../app/useAppCtx';

export function SprintTimeChoiceStep({ ctx }: { ctx: AppCtx }) {
  const {
    appLanguage, setGuidedStep, setSelectedSprintTime, setGuidedWorkDuration,
    getGuidedProgress,
  } = ctx;

  return (
    <motion.div 
      key="sprint-time-choice"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col items-center justify-center min-h-full py-10 px-6 gap-8 bg-black"
    >
      <div className="w-full max-w-md">
        <GuidedHeader
          onBack={() => { setSelectedSprintTime(null); setGuidedStep('ACTIVITY_EXPLAIN'); }}
          step={getGuidedProgress()?.step}
          total={getGuidedProgress()?.total}
          appLanguage={appLanguage}
        />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black italic tracking-tighter text-[var(--text-primary)] uppercase">
          {appLanguage === 'en' ? 'CHOOSE DURATION' : 'CHOISIR LA DURÉE'}
        </h2>
        <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.3em]">
          {appLanguage === 'en' ? 'Select your sprint module' : 'Sélectionne ton module de sprint'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {GUIDED_PRESETS.SPRINT.TIME_MODULES.map((mod: any) => (
          <button
            key={mod.id}
            onClick={() => {
              setSelectedSprintTime(mod.id);
              setGuidedWorkDuration(mod.seconds);
              setGuidedStep('LEVEL_CHOICE');
            }}
            className="group relative flex flex-col items-center gap-3 p-6 rounded-3xl transition-all duration-500 bg-zinc-950/50 border border-[var(--acc-primary)]/5 hover:border-[var(--acc-primary)]/20 hover:bg-white/5 active:scale-[0.98] text-center overflow-hidden"
          >
            <div className="text-3xl font-black italic text-white group-hover:scale-110 transition-transform">
              {mod.label}
            </div>
            <div className="absolute inset-0 bg-[var(--acc-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
