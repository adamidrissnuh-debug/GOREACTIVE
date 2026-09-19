/**
 * LOGIQUE — ZONE PROTÉGÉE (ne pas modifier pour du design).
 * Historique, évaluation post-séance, modales, toast, protocoles sauvegardés, progression, onboarding, enregistrements vocaux.
 * Code déplacé tel quel depuis l'ancien App.tsx.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { TrainingSession, AppMode, SavedProtocol, UserProgress } from '../types';
import type { useCoreState } from './useCoreState';
import type { useGuidedFlowState } from './useGuidedFlowState';

export function useHistoryAndModalsState(prev: ReturnType<typeof useCoreState> & ReturnType<typeof useGuidedFlowState>) {
  const {
    appLanguage, guidedStep, setGuidedStep, setSelectedClass,
  } = prev;

  const [sessionHistory, setSessionHistory] = useState<TrainingSession[]>(() => {
    const saved = localStorage.getItem('goreactive_history');
    return saved ? JSON.parse(saved) : [];
  });

  // "In Motion" is now the only class, so the class-selection screen is a
  // dead click — auto-select it and jump straight to activity choice
  // (Boxing / Sprint), which is the real next step.
  useEffect(() => {
    if (guidedStep === 'CLASS_CHOICE') {
      setSelectedClass('MOTION');
      setGuidedStep('ACTIVITY_CHOICE');
    }
  }, [guidedStep]);

  const [showEvaluation, setShowEvaluation] = useState(false);
  const [lastSessionStats, setLastSessionStats] = useState<{ 
    mode: AppMode; 
    volume: number; 
    duration: number; 
    successes: number; 
    failures: number; 
    bestStreak: number; 
    errorTrackingEnabled?: boolean;
    errorMode?: 'live' | 'post' | 'none' | null;
    neuroFlowActive?: boolean;
    neuroFlowFinalLevel?: number;
    neuroFlowHighestLevelReached?: number;
    guidedActivity?: string;
    sprintWorkSeconds?: number;
    sprintRestSeconds?: number;
    sprintRounds?: number;
    sprintSets?: number;
  } | null>(null);
  const [isSuccessTrackingEnabled, setIsSuccessTrackingEnabled] = useState(true);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  // Brief, non-blocking confirmation ("Protocol saved", etc.) — auto-dismisses.
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2200);
  }, []);
  const [showNoStimuliWarning, setShowNoStimuliWarning] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Handle Pause Effects
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [useSpeechFilter, setUseSpeechFilter] = useState(true);
  const [vocalTranscript, setVocalTranscript] = useState('');
  // Réglages Guidé (Boxe) : changer de mode ou de format sans repasser par
  // tout l'assistant depuis le début.
  const [showGuidedModePicker, setShowGuidedModePicker] = useState(false);
  const [pendingGuidedMode, setPendingGuidedMode] = useState<AppMode | null>(null);
  const [showGuidedFormatPicker, setShowGuidedFormatPicker] = useState(false);
    useEffect(() => {
    localStorage.setItem('goreactive_history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // Language choice must survive an app restart — without this, every
  // relaunch fell back to the language-select screen (appLanguage starting
  // null), which then also forced the whole onboarding flow to replay.
  useEffect(() => {
    if (appLanguage) {
      localStorage.setItem('goreactive_language', appLanguage);
    }
  }, [appLanguage]);

  // Saved Pro protocols — a named, reloadable snapshot of mode + stimuli +
  // intervals + duration, for repeating an identical test across sessions
  // or people.
  const [savedProtocols, setSavedProtocols] = useState<SavedProtocol[]>(() => {
    const saved = localStorage.getItem('goreactive_protocols');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('goreactive_protocols', JSON.stringify(savedProtocols));
  }, [savedProtocols]);
  const [showProtocolRecap, setShowProtocolRecap] = useState(false);
  const [protocolNameDraft, setProtocolNameDraft] = useState('');

  const [recordingWord, setRecordingWord] = useState<string | null>(null);
  // ... existing states ...
  // Performance stats and progression
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('goreactive_progress');
      const base: UserProgress = { streak: 0, lastTrainingDate: null };
      if (!saved) return base;
      const parsed = JSON.parse(saved);
      return { ...base, ...parsed };
    } catch (e) {
      return { streak: 0, lastTrainingDate: null };
    }
  });
    const [onboardingStep, setOnboardingStep] = useState<'LANGUAGE' | 'TUTORIAL' | 'PROFILE_SELECTION' | 'MANIFESTO' | 'DONE'>(() => {
    const savedLanguage = localStorage.getItem('goreactive_language');
    const savedProfile = localStorage.getItem('goreactive_profile');
    if (!savedLanguage) return 'LANGUAGE';
    if (!savedProfile) return 'PROFILE_SELECTION';
    return 'DONE';
  });
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [isRecordingTrigger, setIsRecordingTrigger] = useState<boolean>(false);
    
    const isSpeakingRef = useRef<boolean>(false);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

  const [voiceRecordings, setVoiceRecordings] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('goreactive_recordings');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load recordings", e);
      return {};
    }
  });

  return {
    sessionHistory, setSessionHistory, showEvaluation, setShowEvaluation,
    lastSessionStats, setLastSessionStats, isSuccessTrackingEnabled,
    setIsSuccessTrackingEnabled, showClearHistoryModal, setShowClearHistoryModal,
    showAboutModal, setShowAboutModal, showExitConfirm, setShowExitConfirm, toastMessage,
    setToastMessage, toastTimeoutRef, showToast, showNoStimuliWarning,
    setShowNoStimuliWarning, expandedSessionId, setExpandedSessionId, isVoiceEnabled,
    setIsVoiceEnabled, useSpeechFilter, setUseSpeechFilter, vocalTranscript,
    setVocalTranscript, showGuidedModePicker, setShowGuidedModePicker, pendingGuidedMode,
    setPendingGuidedMode, showGuidedFormatPicker, setShowGuidedFormatPicker,
    savedProtocols, setSavedProtocols, showProtocolRecap, setShowProtocolRecap,
    protocolNameDraft, setProtocolNameDraft, recordingWord, setRecordingWord,
    userProgress, setUserProgress, onboardingStep, setOnboardingStep, activeTooltip,
    setActiveTooltip, isLocked, setIsLocked, isRecordingTrigger, setIsRecordingTrigger,
    isSpeakingRef, recorderRef, audioChunksRef, voiceRecordings, setVoiceRecordings,
  };
}
