/**
 * LOGIQUE — ZONE PROTÉGÉE (ne pas modifier pour du design).
 * État de base : lancement, séance en cours (play/pause), phases, mode, langue.
 * Code déplacé tel quel depuis l'ancien App.tsx.
 */
import { useState, useRef, useEffect } from 'react';
import { AppMode, WorkType, WorkPhase } from '../types';
import { RAINBOW_COLORS } from '../constants/colors';
import { preloadVoiceEngine } from '../services/voiceEngine';

export function useCoreState() {
  // (déplacé ici depuis plus bas dans App.tsx : cet état est utilisé par des fonctions déclarées plus haut)
  const [view, setView] = useState<'training' | 'library' | 'settings' | 'history' | 'progress'>('training');
  // (déplacé ici depuis plus bas dans App.tsx : cet état est utilisé par des fonctions déclarées plus haut)
  const [nextActionTime, setNextActionTime] = useState<number | null>(null);
  const [showLaunchSplash, setShowLaunchSplash] = useState(true);
  const [launchMicrophoneChecked, setLaunchMicrophoneChecked] = useState(true);
  const [hasMovementCalibrationPassed, setHasMovementCalibrationPassed] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseStartTimeRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const appModeRef = useRef<AppMode>('VOICE');
  const [workType, setWorkType] = useState<WorkType>('CONTINUOUS');
  const [intermittentWorkDuration, setIntermittentWorkDuration] = useState(30);
  const [intermittentRestDuration, setIntermittentRestDuration] = useState(15);
  const [intermittentRounds, setIntermittentRounds] = useState(8);
  const [intermittentSets, setIntermittentSets] = useState(1);
  const [intermittentSetRest, setIntermittentSetRest] = useState(60);

  // Timer Internal State
  const [currentPhase, setCurrentPhase] = useState<WorkPhase>('WORK');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSet, setCurrentSet] = useState(1);
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(0);

  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [accumulatedPauseTime, setAccumulatedPauseTime] = useState(0);
  const [appMode, setAppMode] = useState<AppMode | null>(null);
  const [visualStimuliIncludesColors, setVisualStimuliIncludesColors] = useState(true);
  const [visualStimuliIncludesWords, setVisualStimuliIncludesWords] = useState(false);
  const [activeRainbowColors, setActiveRainbowColors] = useState<string[]>(RAINBOW_COLORS.map(c => c.id));
  const [appLanguage, setAppLanguage] = useState<'en' | 'fr' | null>(() => {
    const saved = localStorage.getItem('goreactive_language');
    return saved === 'en' || saved === 'fr' ? saved : null;
  });

  // Charge le modèle de reconnaissance vocale en mémoire dès que la langue
  // est connue — sans ouvrir le micro. Sans ça, le tout premier démarrage du
  // micro (calibrage ou entraînement) doit d'abord lire le modèle depuis le
  // disque, ce qui peut prendre plusieurs secondes et donne l'impression que
  // le micro "ne se lance pas".
  useEffect(() => {
    if (appLanguage) {
      preloadVoiceEngine(appLanguage);
    }
  }, [appLanguage]);

  return {
    showLaunchSplash, setShowLaunchSplash, launchMicrophoneChecked,
    setLaunchMicrophoneChecked, hasMovementCalibrationPassed,
    setHasMovementCalibrationPassed, isRunning, setIsRunning, isPaused, setIsPaused,
    timerRef, phaseTimerRef, countdownTimerRef, pauseStartTimeRef, isRunningRef,
    isPausedRef, appModeRef, workType, setWorkType, intermittentWorkDuration,
    setIntermittentWorkDuration, intermittentRestDuration, setIntermittentRestDuration,
    intermittentRounds, setIntermittentRounds, intermittentSets, setIntermittentSets,
    intermittentSetRest, setIntermittentSetRest, currentPhase, setCurrentPhase,
    currentRound, setCurrentRound, currentSet, setCurrentSet, phaseTimeRemaining,
    setPhaseTimeRemaining, sessionStartTime, setSessionStartTime, accumulatedPauseTime,
    setAccumulatedPauseTime, appMode, setAppMode, visualStimuliIncludesColors,
    setVisualStimuliIncludesColors, visualStimuliIncludesWords,
    setVisualStimuliIncludesWords, activeRainbowColors, setActiveRainbowColors,
    appLanguage, setAppLanguage, view, setView, nextActionTime, setNextActionTime,
  };
}
