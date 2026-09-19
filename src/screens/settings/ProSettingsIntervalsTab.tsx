import { StepperButton } from '../../components/ui/StepperButton';
import { TempoPreview } from '../../components/ui/TempoPreview';
import type { AppCtx } from '../../app/useAppCtx';

export function ProSettingsIntervalsTab({ ctx }: { ctx: AppCtx }) {
  const {
    appMode, appLanguage, voiceMinInterval, setVoiceMinInterval, voiceMaxInterval,
    setVoiceMaxInterval, colorMinInterval, setColorMinInterval, colorMaxInterval,
    setColorMaxInterval, chaosMinInterval, setChaosMinInterval, chaosMaxInterval,
    setChaosMaxInterval, PRESETS,
  } = ctx;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {PRESETS.map(p => {
          const curMin = appMode === 'COLOR' ? colorMinInterval : appMode === 'CHAOS' ? chaosMinInterval : voiceMinInterval;
          const curMax = appMode === 'COLOR' ? colorMaxInterval : appMode === 'CHAOS' ? chaosMaxInterval : voiceMaxInterval;
          return (
          <button
            key={p.name}
            onClick={() => {
              if (appMode === 'COLOR') { setColorMinInterval(p.min); setColorMaxInterval(p.max); }
              else if (appMode === 'CHAOS') { setChaosMinInterval(p.min); setChaosMaxInterval(p.max); }
              else { setVoiceMinInterval(p.min); setVoiceMaxInterval(p.max); }
            }}
            className={`px-3 py-2.5 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${
                            curMin === p.min && curMax === p.max 
                              ? 'bg-[var(--acc-primary)] text-[var(--acc-on-primary)] border-[var(--acc-primary)] shadow-lg shadow-[var(--acc-primary)]/20' 
                              : 'bg-white/5 border-[var(--acc-primary)]/10 text-[var(--text-secondary)] hover:bg-white/10'
                          }`}
          >
            {p.name}
          </button>
          );
        })}
      </div>
      <div className="space-y-4 pt-2">
        {[
          { label: appLanguage === 'en' ? 'MIN' : 'MINIMUM', val: appMode === 'COLOR' ? colorMinInterval : appMode === 'CHAOS' ? chaosMinInterval : voiceMinInterval, set: appMode === 'COLOR' ? setColorMinInterval : appMode === 'CHAOS' ? setChaosMinInterval : setVoiceMinInterval, min: 0.2, max: 10, step: 0.1 },
          { label: appLanguage === 'en' ? 'MAX' : 'MAXIMUM', val: appMode === 'COLOR' ? colorMaxInterval : appMode === 'CHAOS' ? chaosMaxInterval : voiceMaxInterval, set: appMode === 'COLOR' ? setColorMaxInterval : appMode === 'CHAOS' ? setChaosMaxInterval : setVoiceMaxInterval, min: 0.5, max: 20, step: 0.1 }
        ].map((it, idx) => (
          <div key={idx} className="premium-card-quiet p-4 rounded-2xl flex flex-col gap-3 group transition-all">
            <div className="flex justify-between items-center">
               <span className="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-widest">{it.label}</span>
               <span className="text-sm font-black text-white font-mono">{it.val}s</span>
            </div>
            <div className="flex items-center gap-2">
              <StepperButton onStep={() => it.set((prev: number) => Math.max(it.min, Number((prev - it.step).toFixed(1))))} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold">-</StepperButton>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[var(--acc-primary)] transition-all" style={{ width: `${((it.val - it.min) / (it.max - it.min)) * 100}%` }} /></div>
              <StepperButton onStep={() => it.set((prev: number) => Math.min(it.max, Number((prev + it.step).toFixed(1))))} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/10 active:scale-90 transition-all font-bold">+</StepperButton>
            </div>
          </div>
        ))}
      </div>
      <TempoPreview
        minInterval={appMode === 'COLOR' ? colorMinInterval : appMode === 'CHAOS' ? chaosMinInterval : voiceMinInterval}
        maxInterval={appMode === 'COLOR' ? colorMaxInterval : appMode === 'CHAOS' ? chaosMaxInterval : voiceMaxInterval}
        appLanguage={appLanguage}
      />
    </div>
  );
}
