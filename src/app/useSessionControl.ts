/**
 * LOGIQUE — ZONE PROTÉGÉE (ne pas modifier pour du design).
 * Contrôle de séance : démarrage, compte à rebours, déclenchement vocal, stats en direct.
 * Code déplacé tel quel depuis l'ancien App.tsx.
 */
import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { speakNativeOrWeb } from '../lib/nativeSpeech';
import { normalizeSpeech, matchMovementCommand } from '../lib/voiceUtils';
import { getAppModeClass } from '../lib/utils';
import { useSpeechTrigger } from '../hooks/useSpeechTrigger';
import { WordLog } from '../types';
import type { useCoreState } from './useCoreState';
import type { useGuidedFlowState } from './useGuidedFlowState';
import type { useHistoryAndModalsState } from './useHistoryAndModalsState';
import type { useSettingsState } from './useSettingsState';
import type { useGuidedActions } from './useGuidedActions';
import type { useTrainingEngine } from './useTrainingEngine';

export function useSessionControl(prev: ReturnType<typeof useCoreState> & ReturnType<typeof useGuidedFlowState> & ReturnType<typeof useHistoryAndModalsState> & ReturnType<typeof useSettingsState> & ReturnType<typeof useGuidedActions> & ReturnType<typeof useTrainingEngine>) {
  const {
    setHasMovementCalibrationPassed, isRunning, setIsRunning, isPaused,
    countdownTimerRef, isRunningRef, isPausedRef, appModeRef, setCurrentPhase,
    setPhaseTimeRemaining, sessionStartTime, setSessionStartTime,
    setAccumulatedPauseTime, appMode, appLanguage, neuroFlowActive, guidedActivity,
    countdownDuration, countdownRemaining, setCountdownRemaining, setIsResumeCountdown,
    setColorLanguage, sessionHistory, setVocalTranscript, vocalThreshold, isSpeakGlobal,
    speak, activeModeDataRef, effectiveAppMode, effectiveWorkDuration, effectiveWorkType,
    effectiveMovementErrorTrackingEnabled, effectiveErrorMode, endSessionWithStats,
    activeModeData, displayPhase, playError, view, setView,
  } = prev;

  const [showMicTestModal, _setShowMicTestModal] = useState(false);
  const [showMovementCalibrationModal, _setShowMovementCalibrationModal] = useState(false);

  const setShowMicTestModal = (val: boolean) => {
    _setShowMicTestModal(val);
  };
  const setShowMovementCalibrationModal = (val: boolean) => {
    _setShowMovementCalibrationModal(val);
  };


  const [movementCalibrationCount, setMovementCalibrationCount] = useState(0);
  const movementCalibrationCountRef = useRef(0);

  const lastMovementValidationRef = useRef(0);

  const startTrainingFlow = useCallback(() => {
    // Audio unlock for Web Speech / native Android TTS when available.
    speakNativeOrWeb(' ', appLanguage, 1, undefined);
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
    silentAudio.play().catch(() => {});

    setView('training');
    setIsResumeCountdown(false);

    if (countdownDuration > 0) {
      setCountdownRemaining(countdownDuration);
    } else {
      const now = Date.now();
      setSessionStartTime(now);
      setAccumulatedPauseTime(0);
      setIsRunning(true);

      if (effectiveWorkType === 'CONTINUOUS') {
        setCurrentPhase('WORK');
        setPhaseTimeRemaining(effectiveWorkDuration * 60);
      }
    }
  }, [effectiveWorkDuration, effectiveWorkType, countdownDuration]);

  // Tabata Phase Engine removed - handled by useIntermittentMode hook

  // Countdown Timer Engine
  useEffect(() => {
    if (countdownRemaining === null || isPaused) {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    if (!countdownTimerRef.current) {
      countdownTimerRef.current = setInterval(() => {
        setCountdownRemaining(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(countdownTimerRef.current!);
            countdownTimerRef.current = null;
            
            // Only initialize session if it's not already running (for initial start)
            if (sessionStartTime === null) {
              const now = Date.now();
              setSessionStartTime(now);
              setAccumulatedPauseTime(0);
              setIsRunning(true);
              
              if (effectiveWorkType === 'CONTINUOUS') {
                setCurrentPhase('WORK');
                setPhaseTimeRemaining(effectiveWorkDuration * 60);
              }
            } else {
              // We are resuming, just ensure isRunning is true (it should be)
              setIsRunning(true);
            }
            setIsResumeCountdown(false);
            
            return null;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [countdownRemaining, isPaused, effectiveWorkType, effectiveWorkDuration]);

  const lastVocalSoundRef = useRef(0);

  const handleVoiceTrigger = useCallback((word: string, volume: number) => {
    const now = Date.now();
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    
    if (!word) return;

    const normalized = normalizeSpeech(word);
    const lang = appLanguage === 'en' ? 'en' : 'fr';
    const matchedMovement = matchMovementCommand(word, lang);
    const errorCommands = new Set(appLanguage === 'en' ? ['no', 'false', 'wrong'] : ['faux', 'non']);
    const finishCommands = new Set(['fin', 'finish']);
    const safeMatchedMovement = matchedMovement && (errorCommands.has(matchedMovement) || finishCommands.has(matchedMovement)) ? matchedMovement : null;

    // LOG COMPLET pour diagnostiquer
    console.log("[VOICE DEBUG]", {
      raw: word,
      normalized,
      matchedMovement,
      safeMatchedMovement,
      isRunning,
      isPaused,
      countdownRemaining,
      appMode: effectiveAppMode,
      modeClass: effectiveAppMode ? getAppModeClass(effectiveAppMode) : null,
      movementErrorTrackingEnabled: effectiveMovementErrorTrackingEnabled,
      errorCommandsHas: matchedMovement ? errorCommands.has(matchedMovement) : false
    });

    // NEURO-FLOW STOP COMMAND
    const stopKeywords = ['fin', 'faim', 'frein', 'arrêter', 'arreter', 'terminer', 'finish', 'faine', 'fain', 'fein', 'fing', 'faing'];
    const words_in_trans = word.toLowerCase().split(/\s+/);
    const isStopWord = stopKeywords.some(k => words_in_trans.includes(k) || normalized.includes(k)) || safeMatchedMovement === 'fin';
    
    if (isRunning && neuroFlowActive && guidedActivity === 'BOXING' && view === 'training' && isStopWord) {
      console.log("[App] Neuro-Flow Stop Command detected:", word);
      endSessionWithStats();
      return;
    }

    // Finish words end the relevant session; they never count as training errors.
    if (isStopWord && view === 'training') {
      if (safeMatchedMovement === 'fin' || safeMatchedMovement === 'finish') return;
    }

    // 1. MIC TEST MODAL - Update transcript
    if (showMicTestModal) {
      setVocalTranscript(word);
      return; 
    }

    // 2. MOVEMENT CALIBRATION
    if (showMovementCalibrationModal && safeMatchedMovement && errorCommands.has(safeMatchedMovement)) {
      if (now - lastMovementValidationRef.current < 400) return;
      
      lastMovementValidationRef.current = now;
      movementCalibrationCountRef.current += 1;
      const nextProgress = movementCalibrationCountRef.current;
      setMovementCalibrationCount(nextProgress);

      if (nextProgress >= 3) {
        setHasMovementCalibrationPassed(true);
        setShowMovementCalibrationModal(false);
        startTrainingFlow();
        speak(appLanguage === 'en' ? 'Calibrated' : 'Calibré');
      } else {
        // Melodic short sound (Ping)
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
      return; 
    }

    // 3. TRAINING LOGIC
    if (!isRunning || isPaused || countdownRemaining !== null) return;

    if (getAppModeClass(effectiveAppMode!) === 'MOVEMENT' && safeMatchedMovement) {
      if (!effectiveMovementErrorTrackingEnabled) return;
      if (!errorCommands.has(safeMatchedMovement)) return;
      if (effectiveErrorMode === 'post') return; // en mode post, on ne compte pas les erreurs en live
      if (effectiveWorkType === 'INTERMITTENT' && displayPhase !== 'WORK') return;

      console.log("[App] Training Error detected via target word:", safeMatchedMovement);

      if (now - lastVocalSoundRef.current > 600) {
        lastVocalSoundRef.current = now;
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          playError(audioCtx);
        } catch (e) {}
      }
      
      if (activeModeDataRef.current?.addError) {
        activeModeDataRef.current.addError();
      }
      return;
    }

  }, [showMicTestModal, showMovementCalibrationModal, isRunning, isPaused, countdownRemaining, effectiveAppMode, effectiveMovementErrorTrackingEnabled, effectiveErrorMode, effectiveWorkType, startTrainingFlow, appLanguage, playError, activeModeData, displayPhase, neuroFlowActive, guidedActivity, view, endSessionWithStats, speak]);

  // Whether this session (once running) will actually need the mic — same
  // check used for both "already running" and "counting down to start", so
  // the mic gets its 400ms native warm-up during the 3-2-1 instead of eating
  // into the first stimulus after training visibly begins.
  const sessionWillNeedMic = !!effectiveAppMode && (
    neuroFlowActive ||
    (getAppModeClass(effectiveAppMode) === 'MOVEMENT' && effectiveMovementErrorTrackingEnabled && (effectiveErrorMode === 'live' || effectiveErrorMode === null)) ||
    (getAppModeClass(effectiveAppMode) === 'MOVEMENT' && effectiveErrorMode === 'post') // pour "fin/stop"
  );

  const voiceTrigger = useSpeechTrigger({
    isActive: showMicTestModal || showMovementCalibrationModal || 
              (!isPaused && view === 'training' && (isRunning || countdownRemaining !== null) && sessionWillNeedMic),
    onTrigger: () => {}, 
    onWordRecognized: (word, vol) => handleVoiceTrigger(word, vol),
    language: appLanguage === 'en' ? 'en-US' : 'fr-FR',
    triggerWords: [],
    threshold: vocalThreshold,
    iaSpeaking: !!(activeModeData as any)?.isSpeaking || isSpeakGlobal
  });

  // Native microphone vocabulary bridge removed.

  const currentWord = activeModeData ? (activeModeData as any).currentWord : null;
  const currentColor = activeModeData ? (activeModeData as any).currentColor : null;
  const isOppositeAction = activeModeData ? (activeModeData as any).isOppositeAction : false;
  const stats = activeModeData?.stats || { success: 0, errors: 0, bestStreak: 0, currentStreak: 0 };
  const [feedbackFlash, setFeedbackFlash] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (stats.success > 0) {
      setFeedbackFlash('success');
      const t = setTimeout(() => setFeedbackFlash(null), 200);
      return () => clearTimeout(t);
    }
  }, [stats.success]);

  useEffect(() => {
    if (stats.errors > 0) {
      setFeedbackFlash('error');
      const t = setTimeout(() => setFeedbackFlash(null), 200);
      return () => clearTimeout(t);
    }
  }, [stats.errors]);
  const currentRoundVal = (activeModeData as any)?.currentRound || 1;

  // Meilleur niveau Neuro-Flow jamais atteint (toutes séances confondues) —
  // sert de repère personnel visible en direct pendant l'entraînement.
  const bestNeuroFlowLevelEver = React.useMemo(() => {
    return sessionHistory.reduce((max, s) => {
      const lvl = s.neuroFlowActive ? (s.neuroFlowHighestLevelReached || 0) : 0;
      return lvl > max ? lvl : max;
    }, 0);
  }, [sessionHistory]);

    // State
  const [newWord, setNewWord] = useState('');

  const viewRef = useRef(view);
  const countdownRemainingRef = useRef(countdownRemaining);

  useEffect(() => {
    isRunningRef.current = isRunning;
    isPausedRef.current = isPaused;
    appModeRef.current = appMode;
    viewRef.current = view;
    countdownRemainingRef.current = countdownRemaining;
  }, [isPaused, isRunning, appMode, view, countdownRemaining]);

  // Helper to categorize modes

  useEffect(() => {
    if (appLanguage === 'fr') {
      setColorLanguage('fr');
    } else if (appLanguage === 'en') {
      setColorLanguage('en');
    }
  }, [appLanguage]);
  const [log, setLog] = useState<WordLog[]>([]);

  return {
    showMicTestModal, _setShowMicTestModal, showMovementCalibrationModal,
    _setShowMovementCalibrationModal, setShowMicTestModal,
    setShowMovementCalibrationModal, movementCalibrationCount,
    setMovementCalibrationCount, movementCalibrationCountRef, lastMovementValidationRef,
    startTrainingFlow, lastVocalSoundRef, handleVoiceTrigger, sessionWillNeedMic,
    voiceTrigger, currentWord, currentColor, isOppositeAction, stats, feedbackFlash,
    setFeedbackFlash, currentRoundVal, bestNeuroFlowLevelEver, newWord, setNewWord,
    viewRef, countdownRemainingRef, log, setLog,
  };
}
