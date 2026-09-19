import { Zap, Activity, ChevronRight } from 'lucide-react';
import { SPEED_TIERS } from '../../constants/guidedPresets';
import { translateMode } from '../../lib/utils';
import { StepperButton } from '../../components/ui/StepperButton';
import type { AppCtx } from '../../app/useAppCtx';

export function GuidedSettingsPanel({ ctx }: { ctx: AppCtx }) {
  const {
    setAppMode, appLanguage, setGuidedStep, neuroFlowActive, neuroFlowLevel,
    guidedActivity, guidedAppMode, guidedDifficulty, guidedSubLevel, guidedSpeedTier,
    guidedStimuliCount, setShowGuidedModePicker, setShowGuidedFormatPicker,
    guidedWorkDuration, setGuidedWorkDuration, changeGuidedSpeedTier, setView,
  } = ctx;

  return (
    <div className="md:col-span-2 space-y-4">
       {/* Simplified Training Card for Guided */}
       <div className="premium-card p-6 rounded-[2rem] space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-32 h-32 text-[var(--acc-primary)]" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-[var(--acc-primary)]">
               {appLanguage === 'en' ? 'ACTIVE TRAINING' : 'ENTRAÎNEMENT ACTIF'}
            </h2>
            <Activity className="w-4 h-4 text-[var(--acc-primary)]" />
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="premium-card-quiet p-4 rounded-2xl">
               <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-1">
                  {appLanguage === 'en' ? 'Activity' : 'Activité'}
               </span>
               <span className="text-sm font-black text-[var(--text-primary)] uppercase">
                 {guidedActivity ? (guidedActivity === 'BOXING' ? (appLanguage === 'en' ? 'Boxing' : 'Boxe') : 'Sprint') : '--'}
               </span>
            </div>

            {guidedActivity === 'BOXING' ? (
              <button
                onClick={() => setShowGuidedFormatPicker(true)}
                className="premium-card-quiet p-4 rounded-2xl text-left active:scale-[0.97] transition-transform"
              >
                 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-1">
                    {appLanguage === 'en' ? 'Format' : 'Format'}
                 </span>
                 <span className="text-sm font-black text-[var(--acc-primary)] uppercase flex items-center gap-1.5">
                   {neuroFlowActive ? 'Neuro-Flow' : (appLanguage === 'en' ? 'Standard' : 'Standard')}
                   <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                 </span>
              </button>
            ) : (
              <div className="premium-card-quiet p-4 rounded-2xl">
                 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-1">
                    {appLanguage === 'en' ? 'Intensity' : 'Intensité'}
                 </span>
                 <span className="text-sm font-black text-[var(--text-primary)] uppercase">
                   {guidedDifficulty
                     ? `${guidedDifficulty === 'EASY' ? (appLanguage === 'en' ? 'Easy' : 'Facile') : guidedDifficulty === 'MEDIUM' ? (appLanguage === 'en' ? 'Medium' : 'Moyen') : (appLanguage === 'en' ? 'Hard' : 'Difficile')} ${guidedSubLevel}`
                     : '--'}
                 </span>
              </div>
            )}

            {guidedActivity === 'BOXING' && !neuroFlowActive && (
              <div className="premium-card-quiet p-4 rounded-2xl">
                 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-1">
                    {appLanguage === 'en' ? 'Speed' : 'Vitesse'}
                 </span>
                 <div className="flex items-center justify-between">
                   <StepperButton
                     onStep={() => changeGuidedSpeedTier(-1)}
                     className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-all font-bold text-xs shrink-0"
                   >
                     −
                   </StepperButton>
                   <span className="text-sm font-black text-[var(--text-primary)] uppercase">
                     {guidedSpeedTier
                       ? `${appLanguage === 'en' ? SPEED_TIERS[guidedSpeedTier - 1].label.en : SPEED_TIERS[guidedSpeedTier - 1].label.fr} · ${guidedStimuliCount}`
                       : '--'}
                   </span>
                   <StepperButton
                     onStep={() => changeGuidedSpeedTier(1)}
                     className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-all font-bold text-xs shrink-0"
                   >
                     +
                   </StepperButton>
                 </div>
              </div>
            )}

            {guidedActivity === 'BOXING' && neuroFlowActive && (
              <div className="premium-card-quiet p-4 rounded-2xl">
                 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-1">
                    {appLanguage === 'en' ? 'Level' : 'Niveau'}
                 </span>
                 <span className="text-sm font-black text-[var(--acc-primary)] uppercase">
                   {neuroFlowLevel}/18 — {appLanguage === 'en' ? 'Progressive' : 'Progressif'}
                 </span>
              </div>
            )}

            {guidedActivity === 'BOXING' ? (
              <button
                onClick={() => setShowGuidedModePicker(true)}
                className="premium-card-quiet p-4 rounded-2xl col-span-2 text-left active:scale-[0.97] transition-transform"
              >
                 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-1">
                    {appLanguage === 'en' ? 'Current Mode' : 'Mode actuel'}
                 </span>
                 <span className="text-sm font-black text-[var(--acc-primary)] uppercase flex items-center gap-1.5">
                   {guidedAppMode ? translateMode(guidedAppMode, appLanguage || 'fr') : '--'}
                   <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                 </span>
              </button>
            ) : (
              <div className="premium-card-quiet p-4 rounded-2xl col-span-2">
                 <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest block mb-1">
                    {appLanguage === 'en' ? 'Current Mode' : 'Mode actuel'}
                 </span>
                 <span className="text-sm font-black text-[var(--text-primary)] uppercase">
                   {guidedAppMode ? translateMode(guidedAppMode, appLanguage || 'fr') : '--'}
                 </span>
              </div>
            )}
          </div>

          <div className="pt-2 relative z-10">
             <button 
              onClick={() => {
                setAppMode(null);
                setGuidedStep('CLASS_CHOICE');
                setView('training');
              }}
              className="w-full py-4 bg-[var(--acc-primary)] text-[var(--acc-on-primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[var(--acc-primary)]/20"
             >
               {appLanguage === 'en' ? 'CHOOSE ANOTHER ACTIVITY' : 'CHOISIR UNE AUTRE ACTIVITÉ'}
             </button>
          </div>
       </div>

       {/* Crucial System Settings for Guided */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!neuroFlowActive && (
            <div className="premium-card p-5 rounded-3xl space-y-4">
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-[var(--acc-primary)]">
                 {appLanguage === 'en' ? 'Session' : 'Durée'}
              </h2>
              <div className="premium-card-quiet p-4 rounded-2xl space-y-3">
                 <div className="flex justify-between items-center text-[9px] font-black uppercase text-[var(--text-secondary)]">
                    <span>{appLanguage === 'en' ? 'Duration' : 'Durée'}</span>
                    <span className="text-[var(--acc-primary)] font-mono">{guidedWorkDuration}m</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <StepperButton
                      onStep={() => setGuidedWorkDuration(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold text-sm shrink-0"
                    >
                      −
                    </StepperButton>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--acc-primary)] transition-all"
                        style={{ width: `${((guidedWorkDuration - 1) / (60 - 1)) * 100}%` }}
                      />
                    </div>
                    <StepperButton
                      onStep={() => setGuidedWorkDuration(prev => Math.min(60, prev + 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold text-sm shrink-0"
                    >
                      +
                    </StepperButton>
                 </div>
              </div>
            </div>
          )}
       </div>
    </div>
  );
}
