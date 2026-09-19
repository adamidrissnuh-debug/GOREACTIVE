/**
 * LOGIQUE — ZONE PROTÉGÉE (ne pas modifier pour du design).
 * Actions du parcours guidé, valeurs effectives (PRO ou GUIDED), fin de séance.
 * Code déplacé tel quel depuis l'ancien App.tsx.
 */
import { useRef, useCallback } from 'react';
import { stopNativeOrWebSpeech } from '../lib/nativeSpeech';
import { SPEED_TIERS, GUIDED_PRESETS } from '../constants/guidedPresets';
import type { useCoreState } from './useCoreState';
import type { useGuidedFlowState } from './useGuidedFlowState';
import type { useHistoryAndModalsState } from './useHistoryAndModalsState';
import type { useSettingsState } from './useSettingsState';

export function useGuidedActions(prev: ReturnType<typeof useCoreState> & ReturnType<typeof useGuidedFlowState> & ReturnType<typeof useHistoryAndModalsState> & ReturnType<typeof useSettingsState>) {
  const {
    setIsRunning, countdownTimerRef, workType, intermittentWorkDuration,
    intermittentRestDuration, intermittentRounds, intermittentSets, setSessionStartTime,
    appMode, visualStimuliIncludesColors, visualStimuliIncludesWords,
    activeRainbowColors, appLanguage, appProfile, setAppProfile, guidedStep,
    setGuidedStep, neuroFlowActive, guidedActivity, setTutorialStep, guidedAppMode,
    guidedSpeedTier, setGuidedSpeedTier, guidedStimuliCount, setGuidedStimuliCount,
    guidedStimuliPack, setGuidedStimuliPack, setPendingPackChoiceTier,
    setCountdownRemaining, setIsResumeCountdown, workDuration, setOnboardingStep, words,
    voiceMinInterval, movementErrorTrackingEnabled, errorMode, guidedWords,
    setGuidedWords, guidedVoiceMinInterval, setGuidedVoiceMinInterval,
    guidedVoiceMaxInterval, setGuidedVoiceMaxInterval, guidedColorMinInterval,
    setGuidedColorMinInterval, guidedColorMaxInterval, setGuidedColorMaxInterval,
    guidedChaosMinInterval, setGuidedChaosMinInterval, guidedChaosMaxInterval,
    setGuidedChaosMaxInterval, guidedChaosVisualMode, setGuidedChaosVisualMode,
    guidedChaosAudioMode, setGuidedChaosAudioMode, guidedChaosVisualWords,
    setGuidedChaosVisualWords, guidedChaosAudioWords, setGuidedChaosAudioWords,
    guidedActiveRainbowColors, setGuidedActiveRainbowColors, guidedWorkDuration,
    guidedWorkType, guidedIntermittentRestDuration, guidedIntermittentRounds,
    guidedIntermittentSets, guidedIntermittentWorkDuration,
    guidedMovementErrorTrackingEnabled, guidedErrorMode,
    guidedVisualStimuliIncludesWords, setGuidedVisualStimuliIncludesWords,
    guidedVisualStimuliIncludesColors, setGuidedVisualStimuliIncludesColors,
    voiceMaxInterval, colorMinInterval, colorMaxInterval, chaosVisualMode,
    chaosAudioMode, chaosVisualWords, chaosAudioWords, chaosMinInterval,
    chaosMaxInterval, setView, setNextActionTime,
  } = prev;


  const activeModeDataRef = useRef<any>(null);

  const stopTraining = useCallback(() => {
    setIsRunning(false);
    setCountdownRemaining(null);
    setIsResumeCountdown(false);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setSessionStartTime(null);
    setNextActionTime(null);
    stopNativeOrWebSpeech();
  }, []);

  const resetToProfileSelection = useCallback(() => {
    stopTraining();
    setAppProfile(null);
    localStorage.removeItem('goreactive_profile');
    setOnboardingStep('PROFILE_SELECTION');
    setView('training');
  }, [stopTraining]);

  // Tutorials always show — content depends on the chosen mode (Audio/
  // Visual/Chaos), so skipping them after the first time meant the other
  // modes' tutorials were never seen.
  const enterBoxingTutorial = useCallback(() => {
    setTutorialStep(0);
    setGuidedStep('BOXING_TUTORIAL');
  }, []);

  const enterSprintTutorial = useCallback(() => {
    setTutorialStep(0);
    setGuidedStep('SPRINT_TUTORIAL');
  }, []);

  // Directly apply a Standard-Levels Boxing level (intervals + stimuli pack
  // words) without going through the setup wizard screens — used by the
  // pause-menu level up/down controls so the person can adjust difficulty
  // mid-session.
  // Applique une vitesse + un nombre de stimulis pour les Niveaux Standards
  // (Boxe) — les deux réglages sont indépendants : le nombre de stimulis ne
  // change jamais le rythme, la vitesse ne change jamais la charge de
  // décision.
  const applyGuidedSpeedLevel = useCallback((speedTier: 1 | 2 | 3 | 4 | 5 | 6, stimuliCount: number, explicitPackId?: string) => {
    const tier = SPEED_TIERS.find(t => t.tier === speedTier) || SPEED_TIERS[0];
    // Aux vitesses 5-6, seuls les packs à mots courts (Chiffres/Tags)
    // tiennent dans l'intervalle — si le pack en cours est "Noms
    // Techniques" (mots longs) et qu'aucun choix explicite n'a été fait
    // (voir pendingPackChoiceTier plus bas, qui laisse la personne choisir
    // entre Chiffres et Tags), on bascule par défaut sur Chiffres pour ne
    // jamais risquer de couper la voix en pleine prononciation.
    const currentPack = GUIDED_PRESETS.BOXING.STIMULI_PACKS.find((p: any) => p.id === guidedStimuliPack);
    const packIsLongWords = currentPack?.id === 'FULL';
    const effectivePackId = explicitPackId || ((tier.shortWordsOnly && packIsLongWords) ? 'PRO' : (guidedStimuliPack || 'FULL'));
    if (effectivePackId !== guidedStimuliPack) setGuidedStimuliPack(effectivePackId);

    setGuidedSpeedTier(speedTier);
    setGuidedStimuliCount(stimuliCount);
    setGuidedVoiceMinInterval(tier.minInterval);
    setGuidedVoiceMaxInterval(tier.maxInterval);
    setGuidedColorMinInterval(tier.minInterval);
    setGuidedColorMaxInterval(tier.maxInterval);
    setGuidedChaosMinInterval(tier.minInterval);
    setGuidedChaosMaxInterval(tier.maxInterval);

    const pack = GUIDED_PRESETS.BOXING.STIMULI_PACKS.find((p: any) => p.id === effectivePackId);
    const availableStimuli = pack?.stimuli?.[appLanguage || 'fr'] || [];
    const stimuliForLevel = availableStimuli.slice(0, stimuliCount);
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
  }, [guidedAppMode, guidedStimuliPack, appLanguage]);

  // Where the person currently stands in the Guided setup flow, and how
  // many screens remain — the exact total depends on Boxing vs Sprint, and
  // for Boxing, Standard Levels vs Neuro-Flow (only known once that choice
  // is made, so the total can adjust by one screen right at that point).
  const getGuidedProgress = useCallback((): { step: number; total: number } | null => {
    if (!guidedStep) return null;
    if (guidedActivity === 'SPRINT') {
      const seq = ['ACTIVITY_CHOICE', 'ACTIVITY_EXPLAIN', 'SPRINT_TUTORIAL', 'SPRINT_TIME_CHOICE', 'LEVEL_CHOICE', 'ERROR_TRACKING_CHOICE'];
      const idx = seq.indexOf(guidedStep);
      if (idx === -1) return null;
      return { step: idx + 1, total: seq.length };
    }
    const seq = neuroFlowActive
      ? ['ACTIVITY_CHOICE', 'ACTIVITY_EXPLAIN', 'BOXING_SENSE_CHOICE', 'BOXING_TUTORIAL', 'BOXING_LEVEL_EXPLAIN', 'NEURO_FLOW_EXPLAIN', 'STIMULI_CHOICE']
      : ['ACTIVITY_CHOICE', 'ACTIVITY_EXPLAIN', 'BOXING_SENSE_CHOICE', 'BOXING_TUTORIAL', 'BOXING_LEVEL_EXPLAIN', 'LEVEL_CHOICE', 'STIMULI_CHOICE', 'ERROR_TRACKING_CHOICE'];
    const idx = seq.indexOf(guidedStep);
    if (idx === -1) return null;
    return { step: idx + 1, total: seq.length };
  }, [guidedStep, guidedActivity, neuroFlowActive]);

  // +/- de vitesse, utilisé par le menu pause pour ajuster en cours de
  // séance — le nombre de stimulis ne bouge jamais ici, seule la vitesse.
  const changeGuidedSpeedTier = useCallback((delta: number) => {
    const current = guidedSpeedTier || 1;
    const newTier = Math.max(1, Math.min(6, current + delta)) as 1 | 2 | 3 | 4 | 5 | 6;
    const tier = SPEED_TIERS.find(t => t.tier === newTier) || SPEED_TIERS[0];
    const currentPack = GUIDED_PRESETS.BOXING.STIMULI_PACKS.find((p: any) => p.id === guidedStimuliPack);
    const packIsLongWords = currentPack?.id === 'FULL';
    if (tier.shortWordsOnly && packIsLongWords) {
      // Ce palier ne tient qu'avec des mots courts : on laisse la personne
      // choisir entre Chiffres et Tags plutôt que de trancher pour elle.
      setPendingPackChoiceTier(newTier);
      return;
    }
    applyGuidedSpeedLevel(newTier, guidedStimuliCount);
  }, [guidedSpeedTier, guidedStimuliCount, guidedStimuliPack, applyGuidedSpeedLevel]);

  // +/- du nombre de stimulis, même principe que changeGuidedSpeedTier —
  // utilisé par le menu pause et les réglages pour ajuster la charge de
  // décision en cours de séance sans changer le rythme.
  const changeGuidedStimuliCount = useCallback((delta: number) => {
    const current = guidedStimuliCount || 1;
    const newCount = Math.max(1, Math.min(6, current + delta));
    setGuidedStimuliCount(newCount);
  }, [guidedStimuliCount]);

  // Re-applies the current level with a newly chosen command pack — used by
  // the Easy<->Medium pack-change prompt.

  // ── Effective config: which drawer is actually running right now ───────
  // Pro and Guided each own a complete, separate copy of every training
  // parameter (see the `guided*` state above). The engine itself, and
  // everything below that reflects "what's happening in this session",
  // reads from whichever one is actually in charge — resolved here, once,
  // early enough that endSessionWithStats (right below) can use it too.
  const isGuidedActive = appProfile === 'GUIDED';
  const effectiveAppMode = isGuidedActive ? guidedAppMode : appMode;
  const effectiveWords = isGuidedActive ? guidedWords : words;
  const effectiveVoiceMinInterval = isGuidedActive ? guidedVoiceMinInterval : voiceMinInterval;
  const effectiveVoiceMaxInterval = isGuidedActive ? guidedVoiceMaxInterval : voiceMaxInterval;
  const effectiveColorMinInterval = isGuidedActive ? guidedColorMinInterval : colorMinInterval;
  const effectiveColorMaxInterval = isGuidedActive ? guidedColorMaxInterval : colorMaxInterval;
  const effectiveChaosMinInterval = isGuidedActive ? guidedChaosMinInterval : chaosMinInterval;
  const effectiveChaosMaxInterval = isGuidedActive ? guidedChaosMaxInterval : chaosMaxInterval;
  const effectiveWorkDuration = isGuidedActive ? guidedWorkDuration : workDuration;
  const effectiveWorkType = isGuidedActive ? guidedWorkType : workType;
  const effectiveChaosVisualMode = isGuidedActive ? guidedChaosVisualMode : chaosVisualMode;
  const effectiveChaosAudioMode = isGuidedActive ? guidedChaosAudioMode : chaosAudioMode;
  const effectiveChaosVisualWords = isGuidedActive ? guidedChaosVisualWords : chaosVisualWords;
  const effectiveChaosAudioWords = isGuidedActive ? guidedChaosAudioWords : chaosAudioWords;
  const effectiveActiveRainbowColors = isGuidedActive ? guidedActiveRainbowColors : activeRainbowColors;
  const effectiveIntermittentRestDuration = isGuidedActive ? guidedIntermittentRestDuration : intermittentRestDuration;
  const effectiveIntermittentWorkDuration = isGuidedActive ? guidedIntermittentWorkDuration : intermittentWorkDuration;
  const effectiveIntermittentRounds = isGuidedActive ? guidedIntermittentRounds : intermittentRounds;
  const effectiveIntermittentSets = isGuidedActive ? guidedIntermittentSets : intermittentSets;
  const effectiveMovementErrorTrackingEnabled = isGuidedActive ? guidedMovementErrorTrackingEnabled : movementErrorTrackingEnabled;
  const effectiveErrorMode = isGuidedActive ? guidedErrorMode : errorMode;
  const effectiveVisualStimuliIncludesWords = isGuidedActive ? guidedVisualStimuliIncludesWords : visualStimuliIncludesWords;
  const effectiveVisualStimuliIncludesColors = isGuidedActive ? guidedVisualStimuliIncludesColors : visualStimuliIncludesColors;

  return {
    activeModeDataRef, stopTraining, resetToProfileSelection, enterBoxingTutorial,
    enterSprintTutorial, applyGuidedSpeedLevel, getGuidedProgress, changeGuidedSpeedTier,
    changeGuidedStimuliCount, isGuidedActive, effectiveAppMode, effectiveWords,
    effectiveVoiceMinInterval, effectiveVoiceMaxInterval, effectiveColorMinInterval,
    effectiveColorMaxInterval, effectiveChaosMinInterval, effectiveChaosMaxInterval,
    effectiveWorkDuration, effectiveWorkType, effectiveChaosVisualMode,
    effectiveChaosAudioMode, effectiveChaosVisualWords, effectiveChaosAudioWords,
    effectiveActiveRainbowColors, effectiveIntermittentRestDuration,
    effectiveIntermittentWorkDuration, effectiveIntermittentRounds,
    effectiveIntermittentSets, effectiveMovementErrorTrackingEnabled, effectiveErrorMode,
    effectiveVisualStimuliIncludesWords, effectiveVisualStimuliIncludesColors,
  };
}
