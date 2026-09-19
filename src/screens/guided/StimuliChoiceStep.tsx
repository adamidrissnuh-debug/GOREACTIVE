import { motion } from 'motion/react';
import { GUIDED_PRESETS, SPEED_TIERS } from '../../constants/guidedPresets';
import { ChevronRight, ShieldAlert } from 'lucide-react';
import { GuidedHeader } from '../../components/ui/GuidedHeader';
import type { AppCtx } from '../../app/useAppCtx';

export function StimuliChoiceStep({ ctx }: { ctx: AppCtx }) {
  const {
    hasMovementCalibrationPassed, appLanguage, setGuidedStep, neuroFlowActive,
    setNeuroFlowLevel, setNeuroFlowLives, setNeuroFlowSuccessStreak, guidedAppMode,
    guidedSpeedTier, guidedStimuliCount, setGuidedStimuliPack, setCountdownDuration,
    setGuidedWords, setGuidedVoiceMinInterval, setGuidedVoiceMaxInterval,
    setGuidedColorMinInterval, setGuidedColorMaxInterval, setGuidedChaosMinInterval,
    setGuidedChaosMaxInterval, setGuidedChaosVisualMode, setGuidedChaosAudioMode,
    setGuidedChaosVisualWords, setGuidedChaosAudioWords, setGuidedActiveRainbowColors,
    setGuidedWorkDuration, setGuidedWorkType, setGuidedVisualStimuliIncludesWords,
    setGuidedVisualStimuliIncludesColors, getGuidedProgress, setView,
    setShowMicTestModal, setShowMovementCalibrationModal, setMovementCalibrationCount,
    movementCalibrationCountRef, startTrainingFlow,
  } = ctx;

  return (
    <motion.div 
       key="guided-stimuli"
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       className="space-y-12"
    >
       <GuidedHeader
         onBack={() => setGuidedStep(neuroFlowActive ? 'NEURO_FLOW_EXPLAIN' : 'LEVEL_CHOICE')}
         step={getGuidedProgress()?.step}
         total={getGuidedProgress()?.total}
         appLanguage={appLanguage}
       />
       <div className="space-y-4">
        <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase italic tracking-tighter text-center">
          {appLanguage === 'en' ? 'COMMAND PACK' : 'PACK DE COMMANDES'}
        </h1>
        <div className="h-1 w-12 bg-[var(--acc-primary)] mx-auto rounded-full" />
        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed text-center px-12 uppercase font-bold tracking-[0.3em]">
          {appLanguage === 'en' 
            ? 'Select a command pack. Numeric or short packs are faster!'
            : 'Choisis un pack de commandes. Les chiffres ou abrégés sont plus rapides !'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 px-2">
        {GUIDED_PRESETS.BOXING.STIMULI_PACKS.filter((pack: any) => {
           const speedTierData = guidedSpeedTier ? SPEED_TIERS.find(t => t.tier === guidedSpeedTier) : null;
           const needsShortWords = neuroFlowActive || speedTierData?.shortWordsOnly;
           if (needsShortWords && pack.id === 'FULL') return false;
           return true;
        }).map((pack: any) => {
           return (
            <button 
             key={pack.id}
             onClick={() => { 
               setGuidedStimuliPack(pack.id); 

               // Finalize words based on level AND pack
               const activityPresets = GUIDED_PRESETS.BOXING;
               const modeKey = (guidedAppMode && activityPresets.MODES[guidedAppMode]) ? guidedAppMode : 'VOICE';
               const preset = neuroFlowActive
                 ? (activityPresets.MODES[modeKey]['EASY'].find((p: any) => p.level === 1) || activityPresets.MODES[modeKey]['EASY'][0])
                 : null;
               const stimuliCountToUse = neuroFlowActive ? preset.stimuliCount : guidedStimuliCount;

               const availableStimuli = pack?.stimuli?.[appLanguage || 'fr'] || [];
               const stimuliForLevel = availableStimuli.slice(0, stimuliCountToUse);

               setGuidedWords(stimuliForLevel);
               setGuidedChaosAudioWords(stimuliForLevel);
               if (guidedAppMode === 'CHAOS') {
                  setGuidedChaosAudioMode('WORDS');
                  setGuidedChaosVisualMode('COLORS');
                  setGuidedChaosVisualWords([]);
                  setGuidedActiveRainbowColors(['red', 'green']);
                  setGuidedVisualStimuliIncludesWords(false);
                  setGuidedVisualStimuliIncludesColors(true);
               } else {
                  setGuidedChaosVisualWords(stimuliForLevel);
                  setGuidedChaosVisualMode('WORDS');
                  setGuidedChaosAudioMode('WORDS');
                  if (guidedAppMode === 'COLOR') {
                    setGuidedVisualStimuliIncludesWords(true);
                    setGuidedVisualStimuliIncludesColors(false); 
                  }
               }

               if (neuroFlowActive) {
                 // Start Neuro-Flow session
                 setGuidedStep(null);
                 setView('training');
                 setNeuroFlowLevel(1);
                 setNeuroFlowLives(3);
                 setNeuroFlowSuccessStreak(0);

                 // Set initial settings based on level 1 (Easy 1)
                 const p = preset;
                 setGuidedVoiceMinInterval(p.minInterval);
                 setGuidedVoiceMaxInterval(p.maxInterval);
                 setGuidedColorMinInterval(p.minInterval);
                 setGuidedColorMaxInterval(p.maxInterval);
                 setGuidedChaosMinInterval(p.minInterval);
                 setGuidedChaosMaxInterval(p.maxInterval);
                 setCountdownDuration(3);
                 setGuidedWorkDuration(10); 
                 setGuidedWorkType('CONTINUOUS');

                 if (!hasMovementCalibrationPassed) {
                   setShowMicTestModal(false);
                   movementCalibrationCountRef.current = 0;
                   setMovementCalibrationCount(0);
                   setShowMovementCalibrationModal(true);
                 } else {
                   startTrainingFlow();
                 }
               } else {
                 setGuidedStep('ERROR_TRACKING_CHOICE'); 
               }
             }}
             className="w-full p-5 rounded-[1.75rem] text-left flex flex-col gap-3 transition-all group relative bg-zinc-900 border border-[var(--acc-primary)]/5 hover:border-[var(--acc-primary)]/20"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-[var(--text-primary)] uppercase italic group-hover:text-[var(--acc-primary)] transition-colors leading-none tracking-tight">
                  {pack.name[appLanguage || 'fr']}
                </h3>
                <ChevronRight className="w-5 h-5 text-[var(--acc-primary)]/60 group-hover:text-[var(--acc-primary)] group-hover:translate-x-1 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {pack?.mapping?.[appLanguage || 'fr']?.map((m: { signal: string; meaning: string }, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-black/30 rounded-lg px-2.5 py-1.5">
                    <span className="font-mono font-black text-[var(--acc-primary)] text-[11px] shrink-0 min-w-[1.5rem] text-center">
                      {m.signal}
                    </span>
                    <span className="text-[8px] text-[var(--text-secondary)] uppercase font-bold tracking-tight truncate">
                      {m.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </button>
           );
        })}
      </div>

      {(guidedAppMode === 'VOICE' || guidedAppMode === 'CHAOS') && guidedSpeedTier && guidedSpeedTier >= 5 && (
        <div className="mx-4 p-5 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
          <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest leading-relaxed">
            {appLanguage === 'en' 
                ? 'Technical pack disabled for high intensity: word length affects signal processing speed.' 
                : 'Pack technique désactivé en intensité moyenne/difficile : la longueur des mots impacte la réactivité.'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
