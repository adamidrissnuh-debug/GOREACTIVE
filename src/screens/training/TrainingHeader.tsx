import { Timer, Lock, Pause } from 'lucide-react';
import { formatTime } from '../../lib/utils';
import { ContextSwitcher } from '../../components/ContextSwitcher';
import { stopNativeOrWebSpeech } from '../../lib/nativeSpeech';
import type { AppCtx } from '../../app/useAppCtx';

export function TrainingHeader({ ctx }: { ctx: AppCtx }) {
  const {
    isRunning, setIsPaused, phaseTimeRemaining, appLanguage, appProfile, neuroFlowActive,
    countdownRemaining, currentTrainingClass, setIsLocked, resetToProfileSelection,
    effectiveAppMode, effectiveWorkType,
  } = ctx;

  return (
    <div className="w-full h-14 flex justify-between items-center z-30">
      <div className="flex flex-col gap-1">
        <div className="px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md text-[var(--acc-primary)] border-[var(--acc-primary)]/20 bg-[var(--acc-primary)]/5">
          {appLanguage === 'en' ? 'MODE ' : 'MODE '}
          {effectiveAppMode === 'VOICE' ? (appLanguage === 'en' ? 'AUDIO' : 'AUDIO') :
           effectiveAppMode === 'COLOR' ? (appLanguage === 'en' ? 'VISUAL' : 'VISUEL') :
           (appLanguage === 'en' ? 'CHAOS' : 'CHAOS')}
          {effectiveWorkType === 'INTERMITTENT' && (appLanguage === 'en' ? ' · INTERMITTENT' : ' · INTERMITTENT')}
        </div>

        {/* Time Remaining in Header — sans objet en Neuro-Flow, qui n'a pas de durée fixe (progression jusqu'à l'échec, pas de compte à rebours) */}
        {isRunning && countdownRemaining === null && !neuroFlowActive && (
          <div className="flex items-center gap-2 px-4 py-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] backdrop-blur-md">
            <Timer className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span className="text-[10px] font-black text-[var(--text-primary)] font-mono tabular-nums tracking-widest">
              {formatTime(phaseTimeRemaining)}
            </span>
          </div>
        )}
        {!isRunning && (
          <ContextSwitcher
            profile={appProfile}
            trainingClass={currentTrainingClass}
            appLanguage={appLanguage}
            onChangeProfile={resetToProfileSelection}
          />
        )}
      </div>

      {isRunning && (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setIsLocked(true); }}
            className="w-10 h-10 rounded-xl bg-white/5 border border-[var(--acc-primary)]/10 flex items-center justify-center active:scale-95 transition-all backdrop-blur-md"
          >
            <Lock className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setIsPaused(true); 
              stopNativeOrWebSpeech();
            }}
            className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center active:scale-95 transition-all backdrop-blur-md hover:bg-red-500/20 shadow-lg shadow-red-500/10"
          >
            <Pause className="w-4 h-4 text-red-500 fill-current" />
          </button>
        </div>
      )}
    </div>
  );
}
