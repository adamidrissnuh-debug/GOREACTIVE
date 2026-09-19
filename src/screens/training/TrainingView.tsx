import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PauseMenuOverlay } from '../../components/PauseMenuOverlay';
import { SPEED_TIERS } from '../../constants/guidedPresets';
import { Play } from 'lucide-react';
import { NeuroFlowHUD } from '../../components/ui/NeuroFlowHUD';
import type { AppCtx } from '../../app/useAppCtx';
import { TrainingHeader } from './TrainingHeader';
import { TrainingStage } from './TrainingStage';
import { CountdownOverlay } from './CountdownOverlay';

export function TrainingView({ ctx }: { ctx: AppCtx }) {
  const {
    isRunning, isPaused, setIsPaused, appMode, appLanguage, appProfile, neuroFlowActive,
    neuroFlowLevel, neuroFlowLives, neuroFlowSuccessStreak, neuroFlowLevelUpGlow,
    neuroFlowHitPulse, guidedActivity, guidedSpeedTier, guidedStimuliCount,
    countdownRemaining, voiceMinInterval, setVoiceMinInterval, voiceMaxInterval,
    setVoiceMaxInterval, colorMinInterval, setColorMinInterval, colorMaxInterval,
    setColorMaxInterval, chaosMinInterval, setChaosMinInterval, chaosMaxInterval,
    setChaosMaxInterval, changeGuidedSpeedTier, changeGuidedStimuliCount,
    effectiveWorkType, endSessionWithStats, displayPhase, displayTime, displayRound,
    displaySet, displayTotalRounds, displayTotalSets, resumeTraining,
    bestNeuroFlowLevelEver, toggleTraining,
  } = ctx;

  return (
    <React.Fragment key="training-view">
        <motion.div 
          key="training" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-primary)]`}
        >
          {/* Ambient class identity: a faint, consistent tint for Motion.
              In Neuro-Flow, this same tint escalates with the level — cool
              and calm at the start, hot and intense near level 18 — a
              purely visual, physical sense of "this is getting real". */}
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-700" 
            style={
              neuroFlowActive
                ? {
                    opacity: 0.14 + (Math.min(18, neuroFlowLevel) / 18) * 0.24,
                    background: `radial-gradient(circle at 50% 0%, hsl(${210 - (Math.min(18, neuroFlowLevel) / 18) * 210}, 85%, 55%), transparent 60%)`,
                  }
                : { opacity: 0.16, background: 'radial-gradient(circle at 50% 0%, #fbbf24, transparent 60%)' }
            } 
          />

          {/* Pulse satisfaisant à chaque bonne réaction — bref, discret,
              mais un vrai retour sensoriel immédiat plutôt qu'un simple
              chiffre qui change. */}
          {neuroFlowActive && (
            <AnimatePresence>
              <motion.div
                key={neuroFlowHitPulse}
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0 pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.5), transparent 65%)' }}
              />
            </AnimatePresence>
          )}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden">

              {/* Header: Mode Name and Pause Button */}
              <TrainingHeader ctx={ctx} />

              {/* Neuro-Flow HUD: lives + belt-style level progress */}
              {neuroFlowActive && isRunning && (
                <div className="w-full flex justify-center pt-2">
                  <NeuroFlowHUD
                    level={neuroFlowLevel}
                    lives={neuroFlowLives}
                    streak={neuroFlowSuccessStreak}
                    appLanguage={appLanguage}
                    bestLevel={bestNeuroFlowLevelEver}
                  />
                </div>
              )}

              {/* "Bien joué" — un vrai rendu enfin donné à ce signal de
                  passage de niveau, qui existait déjà mais ne s'affichait
                  jamais nulle part. */}
              <AnimatePresence>
                {neuroFlowLevelUpGlow && (
                  <motion.div
                    key="neuro-flow-well-done"
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-1"
                  >
                    <span
                      className="text-3xl font-black italic uppercase tracking-tighter"
                      style={{
                        color: '#fbbf24',
                        textShadow: '0 0 30px rgba(251,191,36,0.6), 0 4px 12px rgba(0,0,0,0.4)',
                      }}
                    >
                      {appLanguage === 'en' ? 'WELL DONE!' : 'BIEN JOUÉ !'}
                    </span>
                    <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                      {appLanguage === 'en' ? `Level ${neuroFlowLevel}` : `Niveau ${neuroFlowLevel}`}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content Area: Hidden during REST/SET_REST for Intermittent mode */}
              <TrainingStage ctx={ctx} />

              {/* Full screen Rest Overlay */}
              <AnimatePresence>
                {effectiveWorkType === 'INTERMITTENT' && (displayPhase === 'REST' || displayPhase === 'SET_REST') && (
                  <motion.div 
                    key="rest-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[1000] bg-black/60 backdrop-blur-sm pointer-events-none flex flex-col items-center justify-center p-8"
                  >
                     <div className="bg-[#0a0d14]/80 border border-[var(--acc-primary)]/10 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-2">
                        <h2 className="text-white font-black italic text-4xl uppercase tracking-tighter text-center">
                          {displayPhase === 'REST' ? (appLanguage === 'en' ? 'REST' : 'REPOS') : (appLanguage === 'en' ? 'SET REST' : 'REPOS ENTRE SÉRIES')}
                        </h2>
                        <div className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mt-2">
                          {displayPhase === 'REST' 
                            ? (appLanguage === 'en' ? `ROUND ${displayRound} / ${displayTotalRounds}` : `ROUND ${displayRound} / ${displayTotalRounds}`)
                            : (appLanguage === 'en' ? `SET ${displaySet} / ${displayTotalSets} COMPLETE` : `SÉRIE ${displaySet} / ${displayTotalSets} TERMINÉE`)
                          }
                        </div>
                        <div className="text-7xl font-mono font-black text-white mt-4">
                           {Math.max(0, Math.ceil(displayTime || 0))}
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pause Overlay - Standard Mode */}
              <PauseMenuOverlay 
                isOpen={isPaused}
                appLanguage={appLanguage}
                variant="premium"
                onResume={resumeTraining}
                onStop={() => {
                  setIsPaused(false);
                  endSessionWithStats();
                }}
                levelControls={
                  appProfile === 'GUIDED' && guidedActivity === 'BOXING' && !neuroFlowActive && guidedSpeedTier
                    ? (() => {
                        const tier = SPEED_TIERS.find(t => t.tier === guidedSpeedTier) || SPEED_TIERS[0];
                        return {
                          label: appLanguage === 'en' ? tier.label.en : tier.label.fr,
                          onLevelUp: () => changeGuidedSpeedTier(1),
                          onLevelDown: () => changeGuidedSpeedTier(-1),
                          canLevelUp: guidedSpeedTier < 6,
                          canLevelDown: guidedSpeedTier > 1,
                        };
                      })()
                    : undefined
                }
                stimuliControls={
                  appProfile === 'GUIDED' && guidedActivity === 'BOXING' && !neuroFlowActive && guidedSpeedTier
                    ? {
                        label: `${guidedStimuliCount}`,
                        onIncrease: () => changeGuidedStimuliCount(1),
                        onDecrease: () => changeGuidedStimuliCount(-1),
                        canIncrease: guidedStimuliCount < 6,
                        canDecrease: guidedStimuliCount > 1,
                      }
                    : undefined
                }
                intervalControls={
                  appProfile === 'PRO' && (appMode === 'VOICE' || appMode === 'COLOR' || appMode === 'CHAOS')
                    ? {
                        appLanguage: appLanguage || 'fr',
                        min: appMode === 'COLOR' ? colorMinInterval : appMode === 'CHAOS' ? chaosMinInterval : voiceMinInterval,
                        max: appMode === 'COLOR' ? colorMaxInterval : appMode === 'CHAOS' ? chaosMaxInterval : voiceMaxInterval,
                        step: 0.1,
                        minBound: 0.2,
                        maxBound: 20,
                        onMinChange: (v: number) => {
                          if (appMode === 'COLOR') setColorMinInterval(v);
                          else if (appMode === 'CHAOS') setChaosMinInterval(v);
                          else setVoiceMinInterval(v);
                        },
                        onMaxChange: (v: number) => {
                          if (appMode === 'COLOR') setColorMaxInterval(v);
                          else if (appMode === 'CHAOS') setChaosMaxInterval(v);
                          else setVoiceMaxInterval(v);
                        },
                      }
                    : undefined
                }
              />

              {/* Initial Start Button (When not running) */}
              {!isRunning && countdownRemaining === null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-20">
                  <div className="flex flex-col items-center gap-6">
                    <motion.button 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={toggleTraining}
                      className="w-36 h-36 rounded-full bg-[var(--acc-primary)] text-[var(--acc-on-primary)] shadow-[0_0_60px_rgba(251,191,36,0.4)] flex flex-col items-center justify-center gap-2 relative"
                    >
                      <div className="absolute inset-0 rounded-full bg-[var(--acc-primary)] animate-ping opacity-20" />
                      <Play className="w-12 h-12 fill-current relative z-10" />
                      <span className="text-[11px] font-black uppercase tracking-[0.25em] relative z-10">{appLanguage === 'en' ? 'START' : 'LANCER'}</span>
                    </motion.button>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                      {appLanguage === 'en' ? 'Tap to begin' : 'Appuyer pour commencer'}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </motion.div>

        {/* Preparation Countdown Overlay - GLOBAL POSITIONED */}
        {countdownRemaining !== null && (
            <CountdownOverlay ctx={ctx} />
          )}
        </React.Fragment>
  );
}
