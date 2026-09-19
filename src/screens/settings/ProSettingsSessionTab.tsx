import { StepperButton } from '../../components/ui/StepperButton';
import type { AppCtx } from '../../app/useAppCtx';

export function ProSettingsSessionTab({ ctx }: { ctx: AppCtx }) {
  const {
    workType, setWorkType, intermittentWorkDuration, setIntermittentWorkDuration,
    intermittentRestDuration, setIntermittentRestDuration, intermittentRounds,
    setIntermittentRounds, intermittentSets, setIntermittentSets, intermittentSetRest,
    setIntermittentSetRest, appLanguage, countdownDuration, setCountdownDuration,
    workDuration, setWorkDuration,
  } = ctx;

  return (
    <div className="space-y-4">
      <div className="flex premium-card-quiet p-1.5 rounded-2xl shadow-inner">
        <button 
          onClick={() => { setWorkType('CONTINUOUS'); }}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          workType === 'CONTINUOUS' ? 'bg-[var(--acc-primary)] text-[var(--acc-on-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-white'
                        }`}
        >
          {appLanguage === 'en' ? 'Continuous' : 'Continu'}
        </button>
        <button 
          onClick={() => { setWorkType('INTERMITTENT'); }}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          workType === 'INTERMITTENT' ? 'bg-[var(--acc-primary)] text-[var(--acc-on-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-white'
                        }`}
        >
          {appLanguage === 'en' ? 'Intermittent' : 'Intermittent'}
        </button>
      </div>

      {workType === 'CONTINUOUS' ? (
        <>
          <div className="premium-card-quiet p-4 rounded-2xl space-y-3 shadow-inner">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tight text-[var(--text-primary)]">
              <span>{appLanguage === 'en' ? 'Preparation' : 'Préparation'}</span>
              <span className="text-[var(--acc-primary)] font-mono">{countdownDuration}s</span>
            </div>
            <div className="flex items-center gap-2">
              <StepperButton onStep={() => setCountdownDuration(prev => Math.max(0, prev - 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold text-sm shrink-0">−</StepperButton>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[var(--acc-primary)] transition-all" style={{ width: `${(countdownDuration / 10) * 100}%` }} /></div>
              <StepperButton onStep={() => setCountdownDuration(prev => Math.min(10, prev + 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold text-sm shrink-0">+</StepperButton>
            </div>
          </div>
          <div className="premium-card-quiet p-4 rounded-2xl space-y-3 shadow-inner">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tight text-[var(--text-primary)]">
              <span>{appLanguage === 'en' ? 'Session Duration' : 'Durée de Séance'}</span>
              <span className="text-[var(--acc-primary)] font-mono">{workDuration}m</span>
            </div>
            <div className="flex items-center gap-2">
              <StepperButton onStep={() => setWorkDuration(prev => Math.max(1, prev - 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold text-sm shrink-0">−</StepperButton>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[var(--acc-primary)] transition-all" style={{ width: `${((workDuration - 1) / (60 - 1)) * 100}%` }} /></div>
              <StepperButton onStep={() => setWorkDuration(prev => Math.min(60, prev + 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold text-sm shrink-0">+</StepperButton>
            </div>
          </div>
        </>
      ) : (
        <div className="premium-card-quiet p-4 rounded-2xl space-y-4 shadow-inner">
          <div className="flex justify-around text-center">
            <div><div className="text-lg font-black font-mono text-[var(--acc-primary)]">{intermittentRounds}</div><div className="text-[7px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{appLanguage === 'en' ? 'Rounds' : 'Rounds'}</div></div>
            <div><div className="text-lg font-black font-mono text-[var(--acc-primary)]">{intermittentSets}</div><div className="text-[7px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{appLanguage === 'en' ? 'Sets' : 'Séries'}</div></div>
            <div><div className="text-lg font-black font-mono text-[var(--acc-primary)]">{Math.round((intermittentWorkDuration + intermittentRestDuration) * intermittentRounds / 60 * 10) / 10}m</div><div className="text-[7px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{appLanguage === 'en' ? 'Total' : 'Total'}</div></div>
          </div>
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div className="bg-[var(--acc-primary)] flex items-center justify-center text-[8px] font-black text-[var(--acc-on-primary)]" style={{ flex: intermittentWorkDuration }}>{intermittentWorkDuration}s</div>
            <div className="bg-white/10 flex items-center justify-center text-[8px] font-black text-[var(--text-secondary)]" style={{ flex: intermittentRestDuration }}>{intermittentRestDuration}s</div>
          </div>
          {[
            { label: appLanguage === 'en' ? 'Preparation (s)' : 'Préparation (s)', val: countdownDuration, set: setCountdownDuration, min: 0, max: 10, step: 1 },
            { label: appLanguage === 'en' ? 'Work (s)' : 'Travail (s)', val: intermittentWorkDuration, set: setIntermittentWorkDuration, min: 5, max: 600, step: 5 },
            { label: appLanguage === 'en' ? 'Rest (s)' : 'Repos (s)', val: intermittentRestDuration, set: setIntermittentRestDuration, min: 5, max: 600, step: 5 },
            { label: appLanguage === 'en' ? 'Rounds' : 'Rounds', val: intermittentRounds, set: setIntermittentRounds, min: 1, max: 100, step: 1 },
            { label: appLanguage === 'en' ? 'Sets' : 'Séries', val: intermittentSets, set: setIntermittentSets, min: 1, max: 50, step: 1 },
            { label: appLanguage === 'en' ? 'Set rest (s)' : 'Repos série (s)', val: intermittentSetRest, set: setIntermittentSetRest, min: 5, max: 900, step: 10 },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">{item.label}</span>
              <div className="flex items-center gap-2">
                <StepperButton onStep={() => item.set((prev: number) => Math.max(item.min, prev - item.step))} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold text-sm shrink-0">−</StepperButton>
                <span className="text-sm font-black font-mono text-white w-9 text-center">{item.val}</span>
                <StepperButton onStep={() => item.set((prev: number) => Math.min(item.max, prev + item.step))} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold text-sm shrink-0">+</StepperButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
