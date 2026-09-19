/**
 * LOGIQUE — ZONE PROTÉGÉE (ne pas modifier pour du design).
 * Moteur d’entraînement : modes Voix / Couleur / Chaos / Intermittent, Neuro-Flow, valeurs d’affichage.
 * Code déplacé tel quel depuis l'ancien App.tsx.
 */
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { getAppModeClass } from '../lib/utils';
import { useVoiceMode } from '../hooks/useVoiceMode';
import { RAINBOW_COLORS } from '../constants/colors';
import { useColorMode } from '../hooks/useColorMode';
import { GUIDED_PRESETS, NEURO_FLOW_LEVELS, SPEED_TIERS } from '../constants/guidedPresets';
import { useChaosMode } from '../hooks/useChaosMode';
import { useIntermittentMode } from '../hooks/useIntermittentMode';
import type { useCoreState } from './useCoreState';
import type { useGuidedFlowState } from './useGuidedFlowState';
import type { useHistoryAndModalsState } from './useHistoryAndModalsState';
import type { useSettingsState } from './useSettingsState';
import type { useGuidedActions } from './useGuidedActions';

export function useTrainingEngine(prev: ReturnType<typeof useCoreState> & ReturnType<typeof useGuidedFlowState> & ReturnType<typeof useHistoryAndModalsState> & ReturnType<typeof useSettingsState> & ReturnType<typeof useGuidedActions>) {
  const {
    isRunning, setIsRunning, isPaused, setIsPaused, intermittentSetRest, currentPhase,
    currentRound, currentSet, phaseTimeRemaining, sessionStartTime, accumulatedPauseTime,
    appLanguage, appProfile, neuroFlowActive, neuroFlowLevel, setNeuroFlowLevel,
    setNeuroFlowLives, setNeuroFlowSuccessStreak, neuroFlowHighestLevel,
    setNeuroFlowHighestLevel, setNeuroFlowLevelUpGlow, setNeuroFlowHitPulse,
    guidedActivity, guidedAppMode, prevSuccessRef, prevErrorsRef, guidedSignalMode,
    guidedSpeedTier, guidedStimuliCount, guidedStimuliPack, countdownRemaining,
    setCountdownRemaining, setIsResumeCountdown, setShowEvaluation, setLastSessionStats,
    voiceRecordings, setErrorMode, setGuidedWords, setGuidedVoiceMinInterval,
    setGuidedVoiceMaxInterval, setGuidedColorMinInterval, setGuidedColorMaxInterval,
    setGuidedChaosMinInterval, setGuidedChaosMaxInterval, setGuidedChaosVisualWords,
    setGuidedChaosAudioWords, setGuidedActiveRainbowColors, setGuidedErrorMode,
    setGuidedVisualStimuliIncludesWords, setGuidedVisualStimuliIncludesColors,
    setShowPostSessionErrorModal, setPostSessionErrorCount, isSpeakGlobal, speak,
    activeModeDataRef, stopTraining, isGuidedActive, effectiveAppMode, effectiveWords,
    effectiveVoiceMinInterval, effectiveVoiceMaxInterval, effectiveColorMinInterval,
    effectiveColorMaxInterval, effectiveChaosMinInterval, effectiveChaosMaxInterval,
    effectiveWorkDuration, effectiveWorkType, effectiveChaosVisualMode,
    effectiveChaosAudioMode, effectiveChaosVisualWords, effectiveChaosAudioWords,
    effectiveActiveRainbowColors, effectiveIntermittentRestDuration,
    effectiveIntermittentWorkDuration, effectiveIntermittentRounds,
    effectiveIntermittentSets, effectiveMovementErrorTrackingEnabled, effectiveErrorMode,
    effectiveVisualStimuliIncludesWords, effectiveVisualStimuliIncludesColors,
  } = prev;


  const endSessionWithStats = useCallback(() => {
    const isMovement = effectiveAppMode ? getAppModeClass(effectiveAppMode) === 'MOVEMENT' : false;
    const shouldShowPostModal = isMovement && effectiveErrorMode === 'post' && effectiveMovementErrorTrackingEnabled;
    if (!isRunning || !sessionStartTime) return;
    
    const activeData = activeModeDataRef.current;
    const isTrackingEnabled = effectiveMovementErrorTrackingEnabled;
    const finalStats = (activeData?.stats && isTrackingEnabled) ? activeData.stats : { success: 0, errors: 0, bestStreak: 0 };
    const finalVolume = (activeData as any)?.stimuliCount || 0;

    const finalDurationSeconds = Math.round((Date.now() - (sessionStartTime || Date.now()) - accumulatedPauseTime) / 1000);

    setLastSessionStats({
      mode: effectiveAppMode || 'VOICE',
      volume: finalVolume,
      duration: finalDurationSeconds,
      successes: finalStats.success,
      failures: finalStats.errors,
      bestStreak: finalStats.bestStreak,
      errorTrackingEnabled: isTrackingEnabled,
      errorMode: effectiveErrorMode,
      neuroFlowActive: neuroFlowActive,
      neuroFlowFinalLevel: neuroFlowLevel,
      neuroFlowHighestLevelReached: neuroFlowHighestLevel,
      guidedActivity: guidedActivity || undefined,
      ...(guidedActivity === 'SPRINT' ? {
        sprintWorkSeconds: effectiveWorkDuration,
        sprintRestSeconds: effectiveIntermittentRestDuration,
        sprintRounds: effectiveIntermittentRounds,
        sprintSets: effectiveIntermittentSets,
      } : {})
    });

    stopTraining();

    // Neuro-Flow always restarts from scratch — otherwise relaunching after
    // a session that ended mid-way (e.g. 2 lives lost) would silently carry
    // that state into the next attempt instead of a clean Level 1 / 3 lives.
    if (neuroFlowActive) {
      setNeuroFlowLevel(1);
      setNeuroFlowLives(3);
      setNeuroFlowSuccessStreak(0);
      setNeuroFlowHighestLevel(1);
    }

    // En mode post-session, afficher le modal de saisie d'erreurs avant les stats
    if (shouldShowPostModal) {
      setPostSessionErrorCount(0);
      setShowPostSessionErrorModal(true);
    } else {
      if (isGuidedActive) setGuidedErrorMode(null); else setErrorMode(null);
      setShowEvaluation(true);
    }
  }, [isRunning, sessionStartTime, effectiveAppMode, effectiveErrorMode, effectiveMovementErrorTrackingEnabled, effectiveWorkDuration, effectiveIntermittentRestDuration, effectiveIntermittentRounds, effectiveIntermittentSets, isGuidedActive, accumulatedPauseTime, stopTraining, neuroFlowActive, neuroFlowLevel, neuroFlowHighestLevel, guidedActivity, appLanguage]);

  // Voice commands for Neuro-Flow (Stopping/Errors)
  useEffect(() => {
    if (!isRunning || !neuroFlowActive || !isPaused || appProfile !== 'GUIDED' || guidedActivity !== 'BOXING') return;
  }, [isRunning, neuroFlowActive, isPaused, appProfile, guidedActivity]);

  const voiceSettings = React.useMemo(() => ({
    words: effectiveWords,
    minInterval: effectiveVoiceMinInterval,
    maxInterval: effectiveVoiceMaxInterval,
    language: appLanguage || 'fr',
    recordings: voiceRecordings,
    errorTrackingEnabled: effectiveMovementErrorTrackingEnabled,
    includesWords: effectiveVisualStimuliIncludesWords
  }), [effectiveWords, effectiveVoiceMinInterval, effectiveVoiceMaxInterval, appLanguage, voiceRecordings, effectiveMovementErrorTrackingEnabled, effectiveVisualStimuliIncludesWords]);

  const shouldRunContinuousStimuli = isRunning && !isPaused && countdownRemaining === null && effectiveWorkType === 'CONTINUOUS';
  const shouldRunIntermittentStimuli = isRunning && !isPaused && countdownRemaining === null && effectiveWorkType === 'INTERMITTENT';

  const voiceMode = useVoiceMode(shouldRunContinuousStimuli && effectiveAppMode === 'VOICE', voiceSettings, sessionStartTime);

  const colorSettings = React.useMemo(() => ({
    words: effectiveWords,
    activeRainbowColors: effectiveActiveRainbowColors,
    rainbowColors: RAINBOW_COLORS,
    minInterval: effectiveColorMinInterval,
    maxInterval: effectiveColorMaxInterval,
    language: appLanguage || 'fr',
    includesWords: effectiveVisualStimuliIncludesWords,
    includesColors: effectiveVisualStimuliIncludesColors,
    recordings: voiceRecordings,
    errorTrackingEnabled: effectiveMovementErrorTrackingEnabled
  }), [effectiveWords, effectiveActiveRainbowColors, effectiveColorMinInterval, effectiveColorMaxInterval, appLanguage, effectiveVisualStimuliIncludesWords, effectiveVisualStimuliIncludesColors, voiceRecordings, effectiveMovementErrorTrackingEnabled]);

  const colorMode = useColorMode(shouldRunContinuousStimuli && effectiveAppMode === 'COLOR', colorSettings, sessionStartTime);
  
  const chaosSettings = React.useMemo(() => {
    const pack = GUIDED_PRESETS.BOXING.STIMULI_PACKS.find((p: any) => p.id === guidedStimuliPack);
    return {
      visualMode: effectiveChaosVisualMode,
      visualWords: effectiveChaosVisualWords,
      activeRainbowColors: effectiveActiveRainbowColors,
      rainbowColors: RAINBOW_COLORS,
      audioMode: effectiveChaosAudioMode,
      audioWords: effectiveChaosAudioWords,
      minInterval: effectiveChaosMinInterval,
      maxInterval: effectiveChaosMaxInterval,
      language: appLanguage || 'fr',
      recordings: voiceRecordings,
      errorTrackingEnabled: effectiveMovementErrorTrackingEnabled,
      switchingMode: guidedActivity === 'BOXING',
      opposites: pack?.opposites
    };
  }, [
    effectiveChaosVisualMode, effectiveChaosVisualWords, effectiveActiveRainbowColors,
    effectiveChaosAudioMode, effectiveChaosAudioWords,
    effectiveChaosMinInterval, effectiveChaosMaxInterval,
    appLanguage, voiceRecordings, effectiveMovementErrorTrackingEnabled,
    guidedActivity, guidedStimuliPack
  ]);
  
  const chaosMode = useChaosMode(shouldRunContinuousStimuli && effectiveAppMode === 'CHAOS', chaosSettings, sessionStartTime);
  
  // LOGS FOR DEBUGGING
  useEffect(() => {
    if (effectiveAppMode === 'CHAOS') {
      console.log("[CHAOS CONTINUOUS ACTIVE]", shouldRunContinuousStimuli && effectiveAppMode === 'CHAOS');
      console.log("[INTERMITTENT ACTIVE]", shouldRunIntermittentStimuli && effectiveAppMode === 'CHAOS');
    }
  }, [shouldRunContinuousStimuli, shouldRunIntermittentStimuli, effectiveAppMode]);
  
  const onIntermittentComplete = useCallback(() => {
    setIsRunning(false);
    endSessionWithStats();
    speak(appLanguage === 'en' ? 'Session completed' : 'Session terminée');
  }, [appLanguage, endSessionWithStats, speak]);

  const intermittentSettings = React.useMemo(() => {
    const pack = GUIDED_PRESETS.BOXING.STIMULI_PACKS.find((p: any) => p.id === guidedStimuliPack);
    return {
      words: effectiveWords,
      chaosVisualMode: effectiveChaosVisualMode,
      chaosVisualWords: effectiveChaosVisualWords,
      chaosAudioMode: effectiveChaosAudioMode,
      chaosAudioWords: effectiveChaosAudioWords,
      activeRainbowColors: effectiveActiveRainbowColors,
      rainbowColors: RAINBOW_COLORS,
      workPhaseDuration: effectiveIntermittentWorkDuration,
      restPhaseDuration: effectiveIntermittentRestDuration,
      totalRounds: effectiveIntermittentRounds,
      totalSets: effectiveIntermittentSets,
      interRoundRestDuration: intermittentSetRest,
      stimuliType: (effectiveAppMode === 'CHAOS' ? 'CHAOS' : effectiveAppMode === 'COLOR' ? 'COLOR' : 'VOICE') as any,
      language: appLanguage || 'fr',
      includesWords: effectiveVisualStimuliIncludesWords,
      includesColors: effectiveVisualStimuliIncludesColors,
      minInterval: effectiveAppMode === 'CHAOS' ? effectiveChaosMinInterval : effectiveVoiceMinInterval,
      maxInterval: effectiveAppMode === 'CHAOS' ? effectiveChaosMaxInterval : effectiveVoiceMaxInterval,
      recordings: voiceRecordings,
      errorTrackingEnabled: effectiveMovementErrorTrackingEnabled,
      switchingMode: guidedActivity === 'BOXING',
      opposites: pack?.opposites
    };
  }, [
    effectiveWords, effectiveChaosVisualMode, effectiveChaosVisualWords, effectiveChaosAudioMode, effectiveChaosAudioWords, 
    effectiveActiveRainbowColors, effectiveIntermittentWorkDuration, effectiveIntermittentRestDuration, 
    effectiveIntermittentRounds, effectiveIntermittentSets, intermittentSetRest, effectiveAppMode, appLanguage, 
    effectiveVisualStimuliIncludesWords, effectiveVisualStimuliIncludesColors, voiceRecordings, 
    effectiveChaosMinInterval, effectiveChaosMaxInterval, effectiveVoiceMinInterval, effectiveVoiceMaxInterval, 
    effectiveMovementErrorTrackingEnabled, guidedActivity, guidedStimuliPack,
    appProfile, guidedSpeedTier, guidedStimuliCount, guidedSignalMode
  ]);

  const intermittentMode = useIntermittentMode(shouldRunIntermittentStimuli && (effectiveAppMode === 'VOICE' || effectiveAppMode === 'COLOR' || effectiveAppMode === 'CHAOS'), intermittentSettings, onIntermittentComplete, sessionStartTime);

  // Unified State Access
  const activeModeData = 
    effectiveWorkType === 'INTERMITTENT' && (effectiveAppMode === 'VOICE' || effectiveAppMode === 'COLOR' || effectiveAppMode === 'CHAOS') ? intermittentMode :
    effectiveAppMode === 'VOICE' ? voiceMode :
    effectiveAppMode === 'COLOR' ? colorMode :
    effectiveAppMode === 'CHAOS' ? chaosMode :
    null;

  activeModeDataRef.current = activeModeData;

  // Neuro-Flow Adaptation Logic
  useEffect(() => {
    if (!isRunning || !neuroFlowActive || !activeModeData) {
      prevSuccessRef.current = 0;
      prevErrorsRef.current = 0;
      return;
    }

    const { success, errors } = activeModeData.stats;
    
    // Detect new success
    if (success > prevSuccessRef.current) {
      const diff = success - prevSuccessRef.current;
      prevSuccessRef.current = success;

      // Retour immédiat et satisfaisant à CHAQUE bonne réaction, pas
      // seulement au palier de 5 — un pulse bref, discret mais net.
      setNeuroFlowHitPulse(p => p + 1);

      setNeuroFlowSuccessStreak(prev => {
        const next = prev + diff;
        if (next >= 10) {
          // LEVEL UP (Strictly 1 by 1)
          setNeuroFlowLevel(l => {
            const nextL = Math.min(18, l + 1);
            if (nextL > l) {
              setNeuroFlowLives(3);
              setNeuroFlowHighestLevel(h => Math.max(h, nextL));
              setNeuroFlowLevelUpGlow(true);
              setTimeout(() => setNeuroFlowLevelUpGlow(false), 2000);
            }
            return nextL;
          });
          return 0;
        }
        return next;
      });
    }

    // Detect new error
    if (errors > prevErrorsRef.current) {
      const diff = errors - prevErrorsRef.current;
      prevErrorsRef.current = errors;
      
      setNeuroFlowSuccessStreak(0);
      setNeuroFlowLives(prev => {
        const next = prev - diff;
        if (next <= 0) {
          // LEVEL DOWN
          setNeuroFlowLevel(l => {
            const nextL = Math.max(1, l - 1);
            if (nextL < l) {
              speak(appLanguage === 'en' ? 'RETRY LEVEL' : 'NIVEAU PRÉCÉDENT');
            }
            return nextL;
          });
          return 3;
        }
        return next;
      });
    }
  }, [isRunning, neuroFlowActive, activeModeData?.stats.success, activeModeData?.stats.errors, appLanguage, speak]);

  // Update Settings based on Neuro-Flow Level — 18 niveaux, toujours 6
  // stimulis actifs (une vraie séance de sparring, pas un tutoriel
  // progressif) : seule la vitesse augmente, avec le niveau 18 qui tombe
  // exactement sur l'intervalle du palier 6 des Niveaux Standards.
  useEffect(() => {
    if (!neuroFlowActive) return;

    const def = NEURO_FLOW_LEVELS.find(l => l.level === neuroFlowLevel) || NEURO_FLOW_LEVELS[0];

    // Apply complexity
    setGuidedVoiceMinInterval(def.minInterval);
    setGuidedVoiceMaxInterval(def.maxInterval);
    setGuidedColorMinInterval(def.minInterval);
    setGuidedColorMaxInterval(def.maxInterval);
    setGuidedChaosMinInterval(def.minInterval);
    setGuidedChaosMaxInterval(def.maxInterval);
    
    // Toujours les 6 stimulis du pack choisi (Chiffres ou Tags)
    const basePacks = GUIDED_PRESETS.BOXING.STIMULI_PACKS;
    const pack = basePacks.find((bp: any) => bp.id === (guidedStimuliPack || 'PRO')) || basePacks[0];
    const lang = appLanguage === 'en' ? 'en' : 'fr';
    const allWords = pack?.stimuli?.[lang] || [];
    
    if (allWords.length > 0) {
      setGuidedWords(allWords);

      // For Chaos
      setGuidedChaosVisualWords(allWords);
      setGuidedChaosAudioWords(allWords);
    }

  }, [neuroFlowLevel, neuroFlowActive, guidedAppMode, appLanguage, guidedStimuliPack]);

  // Même principe que ci-dessus, mais pour les Niveaux Standards : si le
  // mode change (Audio/Visuel/Chaos) en dehors de l'assistant — depuis les
  // Réglages, par exemple — les intervalles et stimulis du niveau en cours
  // sont recalculés pour le nouveau mode, sans repasser par le choix de niveau.
  useEffect(() => {
    if (neuroFlowActive || guidedActivity !== 'BOXING' || !guidedSpeedTier) return;
    const tier = SPEED_TIERS.find(t => t.tier === guidedSpeedTier) || SPEED_TIERS[0];

    setGuidedVoiceMinInterval(tier.minInterval);
    setGuidedVoiceMaxInterval(tier.maxInterval);
    setGuidedColorMinInterval(tier.minInterval);
    setGuidedColorMaxInterval(tier.maxInterval);
    setGuidedChaosMinInterval(tier.minInterval);
    setGuidedChaosMaxInterval(tier.maxInterval);

    const pack = GUIDED_PRESETS.BOXING.STIMULI_PACKS.find((bp: any) => bp.id === guidedStimuliPack) || GUIDED_PRESETS.BOXING.STIMULI_PACKS[0];
    const lang = appLanguage === 'en' ? 'en' : 'fr';
    const availableStimuli = pack?.stimuli?.[lang] || [];
    const stimuliForLevel = availableStimuli.slice(0, guidedStimuliCount);
    setGuidedWords(stimuliForLevel);
    setGuidedChaosAudioWords(stimuliForLevel);
    if (guidedAppMode === 'CHAOS') {
      setGuidedChaosVisualWords([]);
      setGuidedActiveRainbowColors(['red', 'green']);
      setGuidedVisualStimuliIncludesWords(false);
      setGuidedVisualStimuliIncludesColors(true);
    } else {
      setGuidedChaosVisualWords(stimuliForLevel);
      if (guidedAppMode === 'COLOR') {
        setGuidedVisualStimuliIncludesWords(true);
        setGuidedVisualStimuliIncludesColors(false);
      }
    }
  }, [guidedAppMode, neuroFlowActive, guidedActivity, guidedSpeedTier, guidedStimuliCount, guidedStimuliPack, appLanguage]);

  const isIAPlaying = !!(activeModeData as any)?.isSpeaking || isSpeakGlobal;

  // Local helper for training display to unify continuous/intermittent
  const displayPhase = effectiveWorkType === 'INTERMITTENT' ? (activeModeData as any)?.currentPhase : currentPhase;
  const displayTime = effectiveWorkType === 'INTERMITTENT' ? (activeModeData as any)?.phaseTimeRemaining : phaseTimeRemaining;
  const displayRound = effectiveWorkType === 'INTERMITTENT' ? (activeModeData as any)?.currentRound : currentRound;
  const displaySet = effectiveWorkType === 'INTERMITTENT' ? (activeModeData as any)?.currentSet : currentSet;
  const displayTotalRounds = effectiveWorkType === 'INTERMITTENT' ? (activeModeData as any)?.totalRounds : 1;
  const displayTotalSets = effectiveWorkType === 'INTERMITTENT' ? (activeModeData as any)?.totalSets : 1;

  const playError = useCallback((ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, []);

  const resumeTraining = useCallback(() => {
    setIsPaused(false);
    setIsResumeCountdown(true);
    setCountdownRemaining(3);
  }, []);

  return {
    endSessionWithStats, voiceSettings, shouldRunContinuousStimuli,
    shouldRunIntermittentStimuli, voiceMode, colorSettings, colorMode, chaosSettings,
    chaosMode, onIntermittentComplete, intermittentSettings, intermittentMode,
    activeModeData, isIAPlaying, displayPhase, displayTime, displayRound, displaySet,
    displayTotalRounds, displayTotalSets, playError, resumeTraining,
  };
}
