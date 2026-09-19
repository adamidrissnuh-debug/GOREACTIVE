/**
 * LOGIQUE — ZONE PROTÉGÉE (ne pas modifier pour du design).
 * Micro, écran verrouillé, sauvegarde de séance, protocoles, presets, toggleTraining.
 * Code déplacé tel quel depuis l'ancien App.tsx.
 */
import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TrainingSession, SavedProtocol } from '../types';
import { getAppModeClass } from '../lib/utils';
import type { useCoreState } from './useCoreState';
import type { useGuidedFlowState } from './useGuidedFlowState';
import type { useHistoryAndModalsState } from './useHistoryAndModalsState';
import type { useSettingsState } from './useSettingsState';
import type { useGuidedActions } from './useGuidedActions';
import type { useTrainingEngine } from './useTrainingEngine';
import type { useSessionControl } from './useSessionControl';

export function useSessionPersistence(prev: ReturnType<typeof useCoreState> & ReturnType<typeof useGuidedFlowState> & ReturnType<typeof useHistoryAndModalsState> & ReturnType<typeof useSettingsState> & ReturnType<typeof useGuidedActions> & ReturnType<typeof useTrainingEngine> & ReturnType<typeof useSessionControl>) {
  const {
    setLaunchMicrophoneChecked, hasMovementCalibrationPassed, isRunning, isPaused,
    workType, setWorkType, setPhaseTimeRemaining, sessionStartTime, accumulatedPauseTime,
    appMode, setAppMode, visualStimuliIncludesColors, setVisualStimuliIncludesColors,
    visualStimuliIncludesWords, setVisualStimuliIncludesWords, activeRainbowColors,
    setActiveRainbowColors, appLanguage, appProfile, guidedStep, neuroFlowActive,
    countdownRemaining, workDuration, setWorkDuration, setSessionHistory, showEvaluation,
    setShowEvaluation, lastSessionStats, setLastSessionStats, showClearHistoryModal,
    setShowClearHistoryModal, showAboutModal, setShowAboutModal, showExitConfirm,
    setShowExitConfirm, showToast, setShowNoStimuliWarning, setSavedProtocols,
    setRecordingWord, setUserProgress, recorderRef, voiceRecordings, setVoiceRecordings,
    words, setWords, voiceMinInterval, setVoiceMinInterval, showErrorModeModal,
    setShowErrorModeModal, showPostSessionErrorModal, setShowPostSessionErrorModal,
    voiceMaxInterval, setVoiceMaxInterval, colorMinInterval, setColorMinInterval,
    colorMaxInterval, setColorMaxInterval, chaosVisualMode, setChaosVisualMode,
    chaosAudioMode, setChaosAudioMode, chaosVisualWords, setChaosVisualWords,
    chaosAudioWords, setChaosAudioWords, chaosMinInterval, setChaosMinInterval,
    chaosMaxInterval, setChaosMaxInterval, speak, stopTraining, resetToProfileSelection,
    effectiveAppMode, effectiveWorkDuration, effectiveWorkType, effectiveErrorMode,
    endSessionWithStats, resumeTraining, view, setView, showMovementCalibrationModal,
    setShowMicTestModal, setShowMovementCalibrationModal, setMovementCalibrationCount,
    movementCalibrationCountRef, startTrainingFlow, newWord, setNewWord, setLog,
  } = prev;

  const [micStatus, setMicStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');

    useEffect(() => {
    try {
      localStorage.setItem('goreactive_recordings', JSON.stringify(voiceRecordings));
    } catch (e) {
      // LocalStorage might be full if recordings are large
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        console.warn("LocalStorage full, recordings might not be saved.");
      }
    }
  }, [voiceRecordings]);
    useEffect(() => {
    setMicStatus('denied');
  }, []);
  const lockTimerRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Android hardware/gesture back button: close the topmost overlay, then
  // step back through the view/wizard, and only offer to quit the app once
  // there is truly nothing left to unwind — instead of the default behavior
  // of closing the app immediately from anywhere.
  const saveSessionRef = useRef<((rating: number) => void) | null>(null);
  useEffect(() => {
    let handle: { remove: () => void } | undefined;
    let cancelled = false;

    import('@capacitor/app').then(({ App: CapacitorApp }) => {
      if (cancelled) return;
      CapacitorApp.addListener('backButton', () => {
        if (showExitConfirm) { setShowExitConfirm(false); return; }
        if (showAboutModal) { setShowAboutModal(false); return; }
        if (showClearHistoryModal) { setShowClearHistoryModal(false); return; }
        if (showErrorModeModal) { setShowErrorModeModal(false); return; }
        if (showPostSessionErrorModal) { setShowPostSessionErrorModal(false); return; }
        if (showMovementCalibrationModal) {
          setShowMovementCalibrationModal(false);
          setMovementCalibrationCount(0);
          movementCalibrationCountRef.current = 0;
          return;
        }
        if (showEvaluation) { saveSessionRef.current?.(0); return; }
        if (countdownRemaining !== null) { stopTraining(); return; }
        if (isPaused) { resumeTraining(); return; }
        if (isRunning) { endSessionWithStats(); return; }

        if (view !== 'training') { setView('training'); return; }

        if (appProfile === 'GUIDED' && guidedStep) { resetToProfileSelection(); return; }

        // Nothing left to unwind — ask before closing the app.
        setShowExitConfirm(true);
      }).then(h => { handle = h; });
    });

    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, [
    showExitConfirm, showAboutModal, showClearHistoryModal, showErrorModeModal,
    showPostSessionErrorModal, showMovementCalibrationModal, showEvaluation,
    countdownRemaining, isPaused, isRunning, view, appProfile, guidedStep,
    resumeTraining, stopTraining, resetToProfileSelection, endSessionWithStats
  ]);

    const requestMicrophonePermission = async () => {
    setMicStatus('denied');
    return false;
  };
    // Recording Functions
  const startRecording = async (_word: string) => {
    // Microphone recording intentionally disabled for a clean baseline.
    setMicStatus('denied');
    return;
  };

    const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
      setRecordingWord(null);
      if ('vibrate' in navigator) navigator.vibrate([30, 20]);
    }
  };
    const deleteRecording = (word: string) => {
    setVoiceRecordings(prev => {
      const next = { ...prev };
      delete next[word];
      return next;
    });
  };
    // Wake Lock Implementation
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isRunning) {
        try {
          // Check if document is visible before requesting
          if (document.visibilityState === 'visible') {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            console.log('Wake Lock is active');
            
            wakeLockRef.current.addEventListener('release', () => {
              console.log('Wake Lock was released');
            });
          }
        } catch (err) {
          // Squelch this error specifically as it depends on environment policy
          if (err instanceof Error && err.name === 'NotAllowedError') {
            console.warn('Wake Lock disallowed by policy. Screen may dim during session.');
          } else {
            console.error(`Wake Lock error: ${err}`);
          }
        }
      }
    };
    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible' && isRunning) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (isRunning) {
      requestWakeLock();
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, [isRunning]);
const saveSession = useCallback((rating: number) => {
    if (!lastSessionStats) return;

    let newHistoryEntry: TrainingSession | null = null;
    
    // Update User Progress (streak) and build the history entry
    setUserProgress(prev => {
      const today = new Date().toLocaleDateString();
      let newStreak = prev.streak;
      
      if (prev.lastTrainingDate) {
        const lastDate = new Date(prev.lastTrainingDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate.toLocaleDateString() === yesterday.toLocaleDateString()) {
          newStreak += 1;
        } else if (lastDate.toLocaleDateString() !== today) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

        // Create history entry
        newHistoryEntry = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleString(appLanguage === 'en' ? 'en-US' : 'fr-FR', { 
            weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
          }),
          timestamp: Date.now(),
          mode: lastSessionStats.mode,
          volume: lastSessionStats.volume,
          successes: lastSessionStats.successes,
          failures: lastSessionStats.failures,
          bestStreak: lastSessionStats.bestStreak,
          errorMode: lastSessionStats.errorMode,
          duration: lastSessionStats.duration,
          rating,
          isEvaluated: lastSessionStats.errorTrackingEnabled !== false,
          neuroFlowActive: lastSessionStats.neuroFlowActive,
          neuroFlowFinalLevel: lastSessionStats.neuroFlowFinalLevel,
          neuroFlowHighestLevelReached: lastSessionStats.neuroFlowHighestLevelReached,
          guidedActivity: lastSessionStats.guidedActivity,
          sprintWorkSeconds: lastSessionStats.sprintWorkSeconds,
          sprintRestSeconds: lastSessionStats.sprintRestSeconds,
          sprintRounds: lastSessionStats.sprintRounds,
          sprintSets: lastSessionStats.sprintSets,
          profile: appProfile || undefined
        };
      
      return {
        ...prev,
        streak: newStreak,
        lastTrainingDate: new Date().toISOString()
      };
    });

    // Side effect outside of setUserProgress to avoid double calls
    if (newHistoryEntry) {
      setSessionHistory(prevH => [newHistoryEntry as TrainingSession, ...prevH].slice(0, 50));
    }

    setShowEvaluation(false);
    setLastSessionStats(null);
  }, [lastSessionStats, appLanguage, appProfile]);
  saveSessionRef.current = saveSession;

  // Saved Pro protocols: capture the exact current config (mode, stimuli,
  // intervals, duration) under a name, and reload it later identically.
  const saveCurrentAsProtocol = useCallback((name: string) => {
    if (!appMode) return;
    const minInterval = appMode === 'COLOR' ? colorMinInterval : appMode === 'CHAOS' ? chaosMinInterval : voiceMinInterval;
    const maxInterval = appMode === 'COLOR' ? colorMaxInterval : appMode === 'CHAOS' ? chaosMaxInterval : voiceMaxInterval;
    const protocol: SavedProtocol = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      mode: appMode,
      minInterval,
      maxInterval,
      workDuration,
      workType,
      words: [...words],
      chaosAudioMode: appMode === 'CHAOS' ? chaosAudioMode : undefined,
      chaosAudioWords: appMode === 'CHAOS' ? [...chaosAudioWords] : undefined,
      chaosVisualMode: appMode === 'CHAOS' ? chaosVisualMode : undefined,
      chaosVisualWords: appMode === 'CHAOS' ? [...chaosVisualWords] : undefined,
      activeRainbowColors: [...activeRainbowColors],
      visualStimuliIncludesWords,
      visualStimuliIncludesColors,
      createdAt: new Date().toISOString(),
    };
    setSavedProtocols(prev => [protocol, ...prev].slice(0, 30));
    showToast(appLanguage === 'en' ? 'Protocol saved' : 'Protocole sauvegardé');
  }, [
    appMode, colorMinInterval, colorMaxInterval, chaosMinInterval, chaosMaxInterval,
    voiceMinInterval, voiceMaxInterval, workDuration, workType, words,
    chaosAudioMode, chaosAudioWords, chaosVisualMode, chaosVisualWords,
    activeRainbowColors, visualStimuliIncludesWords, visualStimuliIncludesColors, appLanguage, showToast
  ]);

  const loadProtocol = useCallback((p: SavedProtocol) => {
    setAppMode(p.mode);
    setWorkDuration(p.workDuration);
    setWorkType(p.workType);
    setWords(p.words || []);
    if (p.mode === 'COLOR') {
      setColorMinInterval(p.minInterval);
      setColorMaxInterval(p.maxInterval);
    } else if (p.mode === 'CHAOS') {
      setChaosMinInterval(p.minInterval);
      setChaosMaxInterval(p.maxInterval);
      if (p.chaosAudioMode) setChaosAudioMode(p.chaosAudioMode as any);
      if (p.chaosAudioWords) setChaosAudioWords(p.chaosAudioWords);
      if (p.chaosVisualMode) setChaosVisualMode(p.chaosVisualMode as any);
      if (p.chaosVisualWords) setChaosVisualWords(p.chaosVisualWords);
    } else {
      setVoiceMinInterval(p.minInterval);
      setVoiceMaxInterval(p.maxInterval);
    }
    if (p.activeRainbowColors) setActiveRainbowColors(p.activeRainbowColors);
    if (p.visualStimuliIncludesWords !== undefined) setVisualStimuliIncludesWords(p.visualStimuliIncludesWords);
    if (p.visualStimuliIncludesColors !== undefined) setVisualStimuliIncludesColors(p.visualStimuliIncludesColors);
    setView('training');
    showToast(appLanguage === 'en' ? 'Protocol loaded' : 'Protocole chargé');
  }, [appLanguage, showToast]);

  const deleteProtocol = useCallback((id: string) => {
    setSavedProtocols(prev => prev.filter(p => p.id !== id));
    showToast(appLanguage === 'en' ? 'Protocol deleted' : 'Protocole supprimé');
  }, [appLanguage, showToast]);

    const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  // Unified High-frequency UI Timer Update Loop
  useEffect(() => {
    if (!isRunning || isPaused || !sessionStartTime) return;
    if (effectiveWorkType !== 'CONTINUOUS') return;

    let rafId: number;
    let lastDisplayedSecond = -1;

    const updateContinuousTimer = () => {
      const now = Date.now();
      const elapsedSeconds = (now - sessionStartTime - accumulatedPauseTime) / 1000;

      if (neuroFlowActive) {
        // Neuro-Flow n'a pas de durée fixe — dure jusqu'à la perte des 3
        // vies. Le chrono compte donc le temps écoulé (vers le haut),
        // jamais un compte à rebours vers une limite qui n'existe pas.
        const roundedSecond = Math.floor(elapsedSeconds);
        if (roundedSecond !== lastDisplayedSecond) {
          lastDisplayedSecond = roundedSecond;
          setPhaseTimeRemaining(elapsedSeconds);
        }
        rafId = requestAnimationFrame(updateContinuousTimer);
        return;
      }

      const totalDurationSeconds = effectiveWorkDuration * 60;
      const remaining = Math.max(0, totalDurationSeconds - elapsedSeconds);

      // Only push a state update when the displayed whole second actually
      // changes — the UI only ever shows whole seconds, so updating on
      // every animation frame (up to 60x/sec) just re-renders the entire
      // app for no visible difference, which is what caused the stutter.
      const roundedSecond = Math.ceil(remaining);
      if (roundedSecond !== lastDisplayedSecond) {
        lastDisplayedSecond = roundedSecond;
        setPhaseTimeRemaining(remaining);
      }

      if (remaining <= 0) {
        endSessionWithStats();
        speak(appLanguage === 'en' ? 'Training session finished' : 'Session d\'entraînement terminée');
        return;
      }

      rafId = requestAnimationFrame(updateContinuousTimer);
    };

    rafId = requestAnimationFrame(updateContinuousTimer);

    return () => cancelAnimationFrame(rafId);
  }, [isRunning, isPaused, sessionStartTime, effectiveWorkType, effectiveWorkDuration, accumulatedPauseTime, endSessionWithStats, speak, appLanguage, neuroFlowActive]);
    const addWord = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newWord.trim()) {
      if (newWord.includes(',')) {
        const splitWords = newWord.split(',').map(w => w.trim()).filter(w => w !== '');
        setWords(prev => [...new Set([...prev, ...splitWords])]);
      } else {
        setWords(prev => [...new Set([...prev, newWord.trim()])]);
      }
      setNewWord('');
    }
  };
    const clearLog = () => {
    setLog([]);
  };
    const clearWords = () => {
    const msg = appLanguage === 'en' ? 'Clear all words from the library?' : 'Vider tous les mots de la bibliothèque ?';
    if (confirm(msg)) {
      setWords([]);
    }
  };
    const removeWord = (word: string) => {
    setWords(prev => prev.filter(w => w !== word));
  };
    const PRESETS = [
    {
      name: 'GOD MODE',
      min: 0.5,
      max: 1.5,
      description: 'Zero latency. Absolute speed.'
    },
    {
      name: 'TRYHARD',
      min: 0.8,
      max: 2.0,
      description: 'Intense reaction training.'
    },
    {
      name: 'SPEEDRUN',
      min: 1.5,
      max: 3.5,
      description: 'Fast paced sequences.'
    },
    {
      name: 'WARMUP',
      min: 3.5,
      max: 7.0,
      description: 'Steady engagement.'
    }
  ];
    const COLOR_PRESETS = [
    {
      name: 'Visual Blitz',
      min: 0.3,
      max: 1.0,
      description: 'High frequency flashes'
    },
    {
      name: 'Reaction Step',
      min: 1.5,
      max: 3.0,
      description: 'Standard visual response training'
    },
    {
      name: 'Focus Flow',
      min: 4.0,
      max: 8.0,
      description: 'Low frequency awareness'
    }
  ];
    const applyPreset = (preset: typeof PRESETS[0]) => {
    stopTraining();
    if (appMode === 'VOICE') {
      setVoiceMinInterval(preset.min);
      setVoiceMaxInterval(preset.max);
    } else if (appMode === 'COLOR') {
      setColorMinInterval(preset.min);
      setColorMaxInterval(preset.max);
    } else if (appMode === 'CHAOS') {
      setChaosMinInterval(preset.min);
      setChaosMaxInterval(preset.max);
    }
    setView('training');
  };
    const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    stopTraining();
    setColorMinInterval(preset.min);
    setColorMaxInterval(preset.max);
    setView('training');
  };
    const toggleTraining = () => {
    if (isRunning || countdownRemaining !== null) {
      if (isRunning) {
        endSessionWithStats();
      } else {
        stopTraining();
      }
      return;
    }

    // Pro mode lets you clear every stimulus manually — catch that before
    // starting rather than launching a session with nothing to react to.
    if (appProfile === 'PRO' && appMode) {
      let missingStimuli = false;
      if (appMode === 'VOICE') {
        missingStimuli = words.length === 0;
      } else if (appMode === 'COLOR') {
        const hasWords = visualStimuliIncludesWords && words.length > 0;
        const hasColors = visualStimuliIncludesColors && activeRainbowColors.length > 0;
        missingStimuli = !hasWords && !hasColors;
      } else if (appMode === 'CHAOS') {
        const audioHasContent = chaosAudioMode === 'WORDS' && chaosAudioWords.length > 0;
        const visualHasContent =
          (chaosVisualMode === 'WORDS' && chaosVisualWords.length > 0) ||
          (chaosVisualMode === 'COLORS' && activeRainbowColors.length > 0) ||
          (chaosVisualMode === 'BOTH' && (chaosVisualWords.length > 0 || activeRainbowColors.length > 0));
        missingStimuli = !audioHasContent && !visualHasContent;
      }
      if (missingStimuli) {
        setShowNoStimuliWarning(true);
        return;
      }
    }

    // Neuro-Flow is always live-tracked by design — never ask live/post here,
    // just go straight to calibration (if needed) or training, same as the
    // original "ENTER THE FLOW" entry point.
    if (neuroFlowActive && !isRunning) {
      setShowMicTestModal(false);
      if (!hasMovementCalibrationPassed) {
        movementCalibrationCountRef.current = 0;
        setMovementCalibrationCount(0);
        setShowMovementCalibrationModal(true);
      } else {
        startTrainingFlow();
      }
      return;
    }

    if (getAppModeClass(effectiveAppMode!) === 'MOVEMENT' && !isRunning) {
      // Afficher le modal de choix du mode d'erreur si pas encore choisi
      if (effectiveErrorMode === null) {
        setShowMicTestModal(false);
        setShowErrorModeModal(true);
        return;
      }

      // Mode post-session ou sans suivi : pas de calibrage vocal, on lance directement
      if (effectiveErrorMode === 'post' || effectiveErrorMode === 'none') {
        setShowMicTestModal(false);
        startTrainingFlow();
        return;
      }
      
      // Mode live : calibrage vocal obligatoire
      if (!hasMovementCalibrationPassed) {
        setShowMicTestModal(false);
        movementCalibrationCountRef.current = 0;
        setMovementCalibrationCount(0);
        setShowMovementCalibrationModal(true);
        return;
      }
    }

    setShowMicTestModal(false);
    startTrainingFlow();
  };

  useEffect(() => {
    setLaunchMicrophoneChecked(true);
    setMicStatus('denied');
  }, []);
    const startDictation = () => {
    // Voice dictation intentionally disabled for a clean baseline.
    return;
  };

  return {
    micStatus, setMicStatus, lockTimerRef, wakeLockRef, saveSessionRef,
    requestMicrophonePermission, startRecording, stopRecording, deleteRecording,
    saveSession, saveCurrentAsProtocol, loadProtocol, deleteProtocol, toggleFullScreen,
    addWord, clearLog, clearWords, removeWord, PRESETS, COLOR_PRESETS, applyPreset,
    applyColorPreset, toggleTraining, startDictation,
  };
}
