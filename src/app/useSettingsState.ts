/**
 * LOGIQUE — ZONE PROTÉGÉE (ne pas modifier pour du design).
 * Réglages PRO et GUIDED (mots, intervalles, chaos), tutoriel PRO, fonction speak.
 * Code déplacé tel quel depuis l'ancien App.tsx.
 */
import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { WorkType } from '../types';
import { stopNativeOrWebSpeech, speakNativeOrWeb } from '../lib/nativeSpeech';
import type { useCoreState } from './useCoreState';
import type { useGuidedFlowState } from './useGuidedFlowState';
import type { useHistoryAndModalsState } from './useHistoryAndModalsState';

export function useSettingsState(prev: ReturnType<typeof useCoreState> & ReturnType<typeof useGuidedFlowState> & ReturnType<typeof useHistoryAndModalsState>) {
  const {
    appMode, appLanguage, appProfile, neuroFlowActive, guidedActivity, guidedSpeedTier,
    isVoiceEnabled,
  } = prev;


  const [vocalThreshold, setVocalThreshold] = useState(0.01);

  const [words, setWords] = useState<string[]>([]);
  const [voiceMinInterval, setVoiceMinInterval] = useState(2);
  const [movementErrorTrackingEnabled, setMovementErrorTrackingEnabled] = useState(true);
  const [errorMode, setErrorMode] = useState<'live' | 'post' | 'none' | null>(null);
  const [showErrorModeModal, setShowErrorModeModal] = useState(false);

  // ── Guided's own, fully separate config ─────────────────────────────────
  // Guided used to configure these same variables Pro edits by hand — one
  // shared drawer for both. This is Guided's own drawer: every guided-flow
  // screen and pause-menu control below writes here instead, so nothing it
  // does can ever leave a trace in Pro's Stimuli/Settings, or vice versa.
  // The training engine itself doesn't change — see `effective*` below,
  // where whichever profile is active hands the engine its own config.
  const [guidedWords, setGuidedWords] = useState<string[]>([]);
  const [guidedVoiceMinInterval, setGuidedVoiceMinInterval] = useState(2);
  const [guidedVoiceMaxInterval, setGuidedVoiceMaxInterval] = useState(5);
  const [guidedColorMinInterval, setGuidedColorMinInterval] = useState(2);
  const [guidedColorMaxInterval, setGuidedColorMaxInterval] = useState(5);
  const [guidedChaosMinInterval, setGuidedChaosMinInterval] = useState(2);
  const [guidedChaosMaxInterval, setGuidedChaosMaxInterval] = useState(5);
  const [guidedChaosVisualMode, setGuidedChaosVisualMode] = useState<'NONE' | 'COLORS' | 'WORDS' | 'BOTH'>('BOTH');
  const [guidedChaosAudioMode, setGuidedChaosAudioMode] = useState<'NONE' | 'WORDS'>('WORDS');
  const [guidedChaosVisualWords, setGuidedChaosVisualWords] = useState<string[]>([]);
  const [guidedChaosAudioWords, setGuidedChaosAudioWords] = useState<string[]>([]);
  const [guidedActiveRainbowColors, setGuidedActiveRainbowColors] = useState<string[]>(['red', 'green']);
  const [guidedWorkDuration, setGuidedWorkDuration] = useState(5);
  const [guidedWorkType, setGuidedWorkType] = useState<WorkType>('CONTINUOUS');
  const [guidedIntermittentRestDuration, setGuidedIntermittentRestDuration] = useState(15);
  const [guidedIntermittentRounds, setGuidedIntermittentRounds] = useState(8);
  const [guidedIntermittentSets, setGuidedIntermittentSets] = useState(1);
  const [guidedIntermittentWorkDuration, setGuidedIntermittentWorkDuration] = useState(30);
  const [guidedMovementErrorTrackingEnabled, setGuidedMovementErrorTrackingEnabled] = useState(true);
  const [guidedErrorMode, setGuidedErrorMode] = useState<'live' | 'post' | 'none' | null>(null);
  const [guidedVisualStimuliIncludesWords, setGuidedVisualStimuliIncludesWords] = useState(true);
  const [guidedVisualStimuliIncludesColors, setGuidedVisualStimuliIncludesColors] = useState(false);

  const [showPostSessionErrorModal, setShowPostSessionErrorModal] = useState(false);
  const [openProSetting, setOpenProSetting] = useState<string | null>('workType');
  const [proSettingsTab, setProSettingsTab] = useState<'mode' | 'session' | 'intervals' | 'protocols' | 'app'>('mode');
  const [proTutorialStep, setProTutorialStep] = useState<number | null>(null);
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const settingsScrollRef = useRef<HTMLDivElement>(null);

  // While the Pro settings tutorial is active, block manual scrolling
  // (touch drag and mouse wheel) so someone unfamiliar with the app can't
  // scroll away from the highlighted section and lose track of what's
  // being explained. Our own scrollIntoView() calls between steps still
  // go through — this only blocks user-initiated gestures.
  useEffect(() => {
    const el = settingsScrollRef.current;
    if (!el || proTutorialStep === null) return;

    const block = (e: Event) => { e.preventDefault(); };
    el.addEventListener('touchmove', block, { passive: false });
    el.addEventListener('wheel', block, { passive: false });

    return () => {
      el.removeEventListener('touchmove', block);
      el.removeEventListener('wheel', block);
    };
  }, [proTutorialStep]);

  const proTutorialSteps = React.useMemo(() => ([
    {
      id: 'mode',
      title: appLanguage === 'en' ? 'Specific mode' : 'Mode spécifique',
      desc: appLanguage === 'en'
        ? 'Switch between Audio, Visual or Chaos right from here — no need to go back to the start screen.'
        : 'Change de mode Audio, Visuel ou Chaos directement ici — pas besoin de retourner à l\u2019écran de départ.'
    },
    {
      id: 'session',
      title: appLanguage === 'en' ? 'Session' : 'Session',
      desc: appLanguage === 'en'
        ? 'Continuous runs one steady block. Intermittent alternates work and rest, like interval training. Set the countdown and total length here too.'
        : 'Continu lance une séance d\u2019un seul bloc. Intermittent alterne travail et repos, façon fractionné. Règle aussi le compte à rebours et la durée totale ici.'
    },
    {
      id: 'intervals',
      title: appLanguage === 'en' ? 'Intervals' : 'Intervalles',
      desc: appLanguage === 'en'
        ? 'Min and max control how close together stimuli can appear. The dots preview the actual rhythm live.'
        : 'Min et max déterminent l\u2019écart entre deux stimulis. Les points en dessous donnent un aperçu du rythme en direct.'
    },
    {
      id: 'protocols',
      title: appLanguage === 'en' ? 'Protocols' : 'Protocoles',
      desc: appLanguage === 'en'
        ? 'Save your whole setup under a name to relaunch the exact same test later, or with someone else.'
        : 'Sauvegarde toute ta config sous un nom pour relancer exactement le même test plus tard, ou avec quelqu\u2019un d\u2019autre.'
    },
  ]), [appLanguage]);

  const startProTutorial = () => {
    setProTutorialStep(0);
    setProSettingsTab(proTutorialSteps[0].id as any);
  };

  const advanceProTutorial = (delta: number) => {
    setProTutorialStep(prev => {
      if (prev === null) return null;
      const next = prev + delta;
      if (next < 0) return prev;
      if (next >= proTutorialSteps.length) {
        return null;
      }
      setProSettingsTab(proTutorialSteps[next].id as any);
      return next;
    });
  };
  const [postSessionErrorCount, setPostSessionErrorCount] = useState(0);

  // In Pro mode, switching the specific mode (Audio/Visual/Mixed) mid-flow
  // must re-ask the error tracking question — otherwise a choice made for a
  // previous mode silently carries over and the modal never shows again.
  const prevAppModeForErrorResetRef = useRef(appMode);
  useEffect(() => {
    if (appProfile === 'PRO' && prevAppModeForErrorResetRef.current !== appMode) {
      setErrorMode(null);
    }
    prevAppModeForErrorResetRef.current = appMode;
  }, [appMode, appProfile]);

  const [voiceMaxInterval, setVoiceMaxInterval] = useState(5);
  const [colorMinInterval, setColorMinInterval] = useState(2);
  const [colorMaxInterval, setColorMaxInterval] = useState(5);
  
  const [chaosVisualMode, setChaosVisualMode] = useState<'NONE' | 'COLORS' | 'WORDS' | 'BOTH'>('BOTH');
  const [chaosAudioMode, setChaosAudioMode] = useState<'NONE' | 'WORDS'>('WORDS');
  const [chaosVisualWords, setChaosVisualWords] = useState<string[]>([]);
  const [chaosAudioWords, setChaosAudioWords] = useState<string[]>([]);
  const [chaosMinInterval, setChaosMinInterval] = useState(2);
  const [chaosMaxInterval, setChaosMaxInterval] = useState(5);
  const [newChaosVisualWord, setNewChaosVisualWord] = useState('');
  const [newChaosAudioWord, setNewChaosAudioWord] = useState('');

  const addChaosVisualWord = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newChaosVisualWord.trim()) {
      setChaosVisualWords(prev => [...new Set([...prev, newChaosVisualWord.trim()])]);
      setNewChaosVisualWord('');
    }
  };

  const addChaosAudioWord = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newChaosAudioWord.trim()) {
      setChaosAudioWords(prev => [...new Set([...prev, newChaosAudioWord.trim()])]);
      setNewChaosAudioWord('');
    }
  };

  const [isSpeakGlobal, setIsSpeakGlobal] = useState(false);

  const speak = useCallback((text: string) => {
    if (!isVoiceEnabled) return;
    // Aux vitesses 5-6 des Niveaux Standards, la voix accélère encore un
    // peu plus (jusqu'au plafond que permet le moteur natif) — un mot plus
    // vite prononcé libère de la marge dans un intervalle déjà serré.
    const isFastGuidedTier = appProfile === 'GUIDED' && guidedActivity === 'BOXING' && !neuroFlowActive && (guidedSpeedTier || 0) >= 5;
    const isMultiWord = text.length > 8 || text.includes(' ');
    const rate = isFastGuidedTier ? (isMultiWord ? 1.9 : 2.0) : (isMultiWord ? 1.7 : 1.4);
    setIsSpeakGlobal(true);
    stopNativeOrWebSpeech();
    speakNativeOrWeb(text, appLanguage, rate, () => setIsSpeakGlobal(false));
    setTimeout(() => setIsSpeakGlobal(false), 2200);
  }, [isVoiceEnabled, appLanguage, appProfile, guidedActivity, neuroFlowActive, guidedSpeedTier]);

  return {
    vocalThreshold, setVocalThreshold, words, setWords, voiceMinInterval,
    setVoiceMinInterval, movementErrorTrackingEnabled, setMovementErrorTrackingEnabled,
    errorMode, setErrorMode, showErrorModeModal, setShowErrorModeModal, guidedWords,
    setGuidedWords, guidedVoiceMinInterval, setGuidedVoiceMinInterval,
    guidedVoiceMaxInterval, setGuidedVoiceMaxInterval, guidedColorMinInterval,
    setGuidedColorMinInterval, guidedColorMaxInterval, setGuidedColorMaxInterval,
    guidedChaosMinInterval, setGuidedChaosMinInterval, guidedChaosMaxInterval,
    setGuidedChaosMaxInterval, guidedChaosVisualMode, setGuidedChaosVisualMode,
    guidedChaosAudioMode, setGuidedChaosAudioMode, guidedChaosVisualWords,
    setGuidedChaosVisualWords, guidedChaosAudioWords, setGuidedChaosAudioWords,
    guidedActiveRainbowColors, setGuidedActiveRainbowColors, guidedWorkDuration,
    setGuidedWorkDuration, guidedWorkType, setGuidedWorkType,
    guidedIntermittentRestDuration, setGuidedIntermittentRestDuration,
    guidedIntermittentRounds, setGuidedIntermittentRounds, guidedIntermittentSets,
    setGuidedIntermittentSets, guidedIntermittentWorkDuration,
    setGuidedIntermittentWorkDuration, guidedMovementErrorTrackingEnabled,
    setGuidedMovementErrorTrackingEnabled, guidedErrorMode, setGuidedErrorMode,
    guidedVisualStimuliIncludesWords, setGuidedVisualStimuliIncludesWords,
    guidedVisualStimuliIncludesColors, setGuidedVisualStimuliIncludesColors,
    showPostSessionErrorModal, setShowPostSessionErrorModal, openProSetting,
    setOpenProSetting, proSettingsTab, setProSettingsTab, proTutorialStep,
    setProTutorialStep, showLevelInfo, setShowLevelInfo, settingsScrollRef,
    proTutorialSteps, startProTutorial, advanceProTutorial, postSessionErrorCount,
    setPostSessionErrorCount, prevAppModeForErrorResetRef, voiceMaxInterval,
    setVoiceMaxInterval, colorMinInterval, setColorMinInterval, colorMaxInterval,
    setColorMaxInterval, chaosVisualMode, setChaosVisualMode, chaosAudioMode,
    setChaosAudioMode, chaosVisualWords, setChaosVisualWords, chaosAudioWords,
    setChaosAudioWords, chaosMinInterval, setChaosMinInterval, chaosMaxInterval,
    setChaosMaxInterval, newChaosVisualWord, setNewChaosVisualWord, newChaosAudioWord,
    setNewChaosAudioWord, addChaosVisualWord, addChaosAudioWord, isSpeakGlobal,
    setIsSpeakGlobal, speak,
  };
}
