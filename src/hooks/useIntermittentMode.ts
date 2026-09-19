import { useState, useEffect, useRef, useCallback } from 'react';
import { speakNativeOrWeb, stopNativeOrWebSpeech } from '../lib/nativeSpeech';

type IntermittentPhase = 'WORK' | 'REST' | 'SET_REST' | 'COMPLETE';

interface IntermittentModeSettings {
  words: string[];
  chaosVisualMode: 'NONE' | 'COLORS' | 'WORDS' | 'BOTH';
  chaosVisualWords: string[];
  chaosAudioMode: 'NONE' | 'WORDS' | 'RECORDS';
  chaosAudioWords: string[];
  activeRainbowColors: string[];
  rainbowColors: { id: string; hex: string; labels: Record<string, string> }[];
  workPhaseDuration: number;
  restPhaseDuration: number;
  totalRounds: number;
  totalSets: number;
  interRoundRestDuration: number;
  stimuliType: 'VOICE' | 'BEATS' | 'PING' | 'COLOR' | 'CHAOS';
  language: 'en' | 'fr';
  includesWords: boolean;
  includesColors: boolean;
  minInterval: number;
  maxInterval: number;
  recordings?: Record<string, string>;
  errorTrackingEnabled?: boolean;
  switchingMode?: boolean;
  opposites?: Record<string, string>;
}

const STIMULUS_END_BUFFER = 3;

export const useIntermittentMode = (isActive: boolean, settings: IntermittentModeSettings, onComplete?: () => void, resetKey?: any) => {
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [isOppositeAction, setIsOppositeAction] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<IntermittentPhase>('WORK');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(settings.workPhaseDuration);
  const [stats, setStats] = useState({ success: 0, errors: 0, bestStreak: 0, currentStreak: 0 });
  const [stimuliCount, setStimuliCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stimuliTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const phaseTimeRemainingRef = useRef(settings.workPhaseDuration);
  const currentPhaseRef = useRef<IntermittentPhase>('WORK');
  const currentRoundRef = useRef(1);
  const currentSetRef = useRef(1);
  
  const settingsRef = useRef(settings);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stimuliCountRef = useRef(0);
  const hasErrorRef = useRef(false);

  const stopAllStimuli = useCallback(() => {
    if (stimuliTimerRef.current) {
      clearTimeout(stimuliTimerRef.current);
      stimuliTimerRef.current = null;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    setCurrentWord(null);
    setCurrentColor(null);
    setIsOppositeAction(false);
    stopNativeOrWebSpeech();
    setIsSpeaking(false);
  }, []);

  const resetAll = useCallback(() => {
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    stopAllStimuli();
    
    phaseTimeRemainingRef.current = settingsRef.current.workPhaseDuration;
    currentPhaseRef.current = 'WORK';
    currentRoundRef.current = 1;
    currentSetRef.current = 1;
    stimuliCountRef.current = 0;
    hasErrorRef.current = false;

    setPhaseTimeRemaining(settingsRef.current.workPhaseDuration);
    setCurrentPhase('WORK');
    setCurrentRound(1);
    setCurrentSet(1);
    setStats({ success: 0, errors: 0, bestStreak: 0, currentStreak: 0 });
    setStimuliCount(0);
    setIsSpeaking(false);
  }, [stopAllStimuli]);

  useEffect(() => {
    resetAll();
  }, [resetKey, resetAll]);

  const addError = useCallback(() => {
    if (!settingsRef.current.errorTrackingEnabled) return;
    if (hasErrorRef.current || currentPhaseRef.current !== 'WORK') return;
    hasErrorRef.current = true;
    setStats(prev => ({
      ...prev,
      errors: prev.errors + 1,
      currentStreak: 0
    }));
  }, []);

  const executeStimulus = useCallback(() => {
    if (!isActive || currentPhaseRef.current !== 'WORK') return;
    if (phaseTimeRemainingRef.current <= STIMULUS_END_BUFFER) return;
    
    const s = settingsRef.current;

    // Handle stats for previous stimulus
    if (s.errorTrackingEnabled && stimuliCountRef.current > 0 && !hasErrorRef.current) {
      setStats(prev => {
        const newSuccess = prev.success + 1;
        const newStreak = prev.currentStreak + 1;
        return {
          ...prev,
          success: newSuccess,
          currentStreak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak)
        };
      });
    }
    
    hasErrorRef.current = false;
    stimuliCountRef.current += 1;
    setStimuliCount(stimuliCountRef.current);

    let visualWord: string | null = null;
    let visualColor: string | null = null;
    let audioWordForSpeech: string | null = null;
    let isOpposite = false;

    const isChaos = s.stimuliType === 'CHAOS';
    const isBoxing = s.switchingMode; // Guided Boxing flag

    // 1. Audio Channel
    const isAudio = s.stimuliType === 'VOICE' || (isChaos && s.chaosAudioMode !== 'NONE');

    if (isAudio) {
      const audioWordList = isChaos ? s.chaosAudioWords : s.words;
      if (audioWordList.length > 0) {
        audioWordForSpeech = audioWordList[Math.floor(Math.random() * audioWordList.length)];
        setIsSpeaking(true);
        
        // Cancel any ongoing speech to maintain strict rhythm
        stopNativeOrWebSpeech();

        const getSpeechWord = (word: string) => {
          const w = word.toUpperCase();
          if (s.language === 'fr') {
            const frMap: Record<string, string> = { 'G': 'G ', 'D': 'D ', 'CG': 'C G', 'CD': 'C D', 'UG': 'U G', 'UD': 'U D' };
            return frMap[w] || word;
          }
          const enMap: Record<string, string> = { 'J': 'J ', 'C': 'C ', 'LH': 'L H', 'RH': 'R H', 'LU': 'L U', 'RU': 'R U' };
          return enMap[w] || word;
        };

        const playSpeechFallback = () => {
          speakNativeOrWeb(getSpeechWord(audioWordForSpeech!), s.language, 1.6, () => setIsSpeaking(false));
        };

        const normalizedWord = audioWordForSpeech.toLowerCase().trim();
        const recordingKey = Object.keys(s.recordings || {}).find(k => k.toLowerCase().trim() === normalizedWord);

        if (s.recordings && recordingKey && s.recordings[recordingKey]) {
          const audio = new Audio(s.recordings[recordingKey]);
          currentAudioRef.current = audio;
          audio.onended = () => { setIsSpeaking(false); currentAudioRef.current = null; };
          audio.onerror = () => { playSpeechFallback(); currentAudioRef.current = null; };
          audio.play().catch(() => playSpeechFallback());
        } else {
          playSpeechFallback();
        }
      }
    }

    // 2. Visual Channel
    const isVisual = s.stimuliType === 'COLOR' || (isChaos && s.chaosVisualMode !== 'NONE') || (!isChaos && s.includesWords);

    if (isVisual) {
      let chosenType: 'COLORS' | 'WORDS' | null = null;
      
      if (isChaos) {
        if (s.chaosVisualMode === 'COLORS') {
          chosenType = 'COLORS';
        } else if (s.chaosVisualMode === 'WORDS') {
          chosenType = 'WORDS';
        } else if (s.chaosVisualMode === 'BOTH') {
          const canUseWords = s.chaosVisualWords.length > 0;
          const canUseColors = s.activeRainbowColors.length > 0;

          if (canUseWords && canUseColors) {
            chosenType = Math.random() > 0.5 ? 'WORDS' : 'COLORS';
          } else if (canUseWords) {
            chosenType = 'WORDS';
          } else if (canUseColors) {
            chosenType = 'COLORS';
          }
        }
      } else {
        const possibleVisuals: ('COLORS' | 'WORDS')[] = [];
        if (s.includesColors || s.stimuliType === 'COLOR') possibleVisuals.push('COLORS');
        if (s.includesWords || s.stimuliType === 'VOICE') possibleVisuals.push('WORDS');
        
        if (s.stimuliType === 'VOICE') {
          chosenType = s.includesWords ? 'WORDS' : null;
        } else if (s.stimuliType === 'COLOR') {
          chosenType = s.includesColors ? 'COLORS' : 'WORDS';
        }
      }

      if (chosenType === 'COLORS') {
        const colorId = s.activeRainbowColors[Math.floor(Math.random() * s.activeRainbowColors.length)];
        const colorObj = s.rainbowColors.find(c => c.id === colorId);

        visualColor = colorObj?.hex || null;
        visualWord = colorObj?.labels[s.language] || '';

        if (isBoxing && colorId === 'red') {
          isOpposite = true;
        }
      } else if (chosenType === 'WORDS') {
        const visualWordList = isChaos ? s.chaosVisualWords : s.words;
        if (visualWordList.length > 0) {
          visualWord = visualWordList[Math.floor(Math.random() * visualWordList.length)];
        }
      }
    }

    // Synchronized Display
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    setIsOppositeAction(isOpposite);
    setCurrentWord(visualWord);
    setCurrentColor(visualColor);
    
    // Clear display after a duration, but no more than 80% of the minimum possible interval to avoid overlap
    const displayDuration = Math.min(800, s.minInterval * 800);
    clearTimerRef.current = setTimeout(() => {
      setCurrentWord(null);
      setCurrentColor(null);
      setIsOppositeAction(false);
      clearTimerRef.current = null;
    }, displayDuration);

    const delay = (Math.random() * (s.maxInterval - s.minInterval) + s.minInterval) * 1000;
    
    const timeRemaining = phaseTimeRemainingRef.current;
    if (timeRemaining <= STIMULUS_END_BUFFER) return;
    if (delay / 1000 >= timeRemaining - STIMULUS_END_BUFFER) return;

    if (currentPhaseRef.current === 'WORK') {
      stimuliTimerRef.current = setTimeout(executeStimulus, delay);
    }
  }, [isActive]);

  const goToPhase = useCallback((phase: IntermittentPhase, duration: number) => {
    currentPhaseRef.current = phase;
    phaseTimeRemainingRef.current = duration;
    
    setCurrentPhase(phase);
    setPhaseTimeRemaining(duration);

    if (phase !== 'WORK') {
      stopAllStimuli();
      const lang = settingsRef.current.language;
      if (phase === 'REST') {
        speakNativeOrWeb(lang === 'fr' ? 'Repos' : 'Rest', lang, 1.1);
      } else if (phase === 'SET_REST') {
        speakNativeOrWeb(lang === 'fr' ? 'Série terminée. Repos.' : 'Set complete. Rest.', lang, 1.1);
      }
    } else {
      if (!stimuliTimerRef.current) {
        stimuliTimerRef.current = setTimeout(executeStimulus, 1000);
      }
    }
  }, [stopAllStimuli, executeStimulus]);

  const tickIntermittentTimer = useCallback(() => {
    if (currentPhaseRef.current === 'COMPLETE') return;

    if (phaseTimeRemainingRef.current > 0) {
      phaseTimeRemainingRef.current -= 1;
      setPhaseTimeRemaining(Math.max(0, phaseTimeRemainingRef.current));

      // Heads-up before the next round kicks back in, so the person isn't
      // caught off guard mid-rest.
      if (
        phaseTimeRemainingRef.current === 10 &&
        (currentPhaseRef.current === 'REST' || currentPhaseRef.current === 'SET_REST')
      ) {
        const lang = settingsRef.current.language;
        speakNativeOrWeb(lang === 'fr' ? 'Encore 10 secondes' : '10 seconds left', lang, 1.2);
      }
    }

    if (phaseTimeRemainingRef.current <= 0) {
      const s = settingsRef.current;
      const isLastRound = currentRoundRef.current >= s.totalRounds;
      const isLastSet = currentSetRef.current >= s.totalSets;

      if (currentPhaseRef.current === 'WORK') {
        if (isLastRound && isLastSet) {
          stopAllStimuli();
          goToPhase('COMPLETE', 0);
          if (onCompleteRef.current) onCompleteRef.current();
          return;
        }
        
        if (isLastRound && !isLastSet) {
          goToPhase('SET_REST', s.interRoundRestDuration);
          return;
        }

        goToPhase('REST', s.restPhaseDuration);
      } else if (currentPhaseRef.current === 'REST') {
        currentRoundRef.current += 1;
        setCurrentRound(currentRoundRef.current);
        goToPhase('WORK', s.workPhaseDuration);
      } else if (currentPhaseRef.current === 'SET_REST') {
        currentSetRef.current += 1;
        setCurrentSet(currentSetRef.current);
        currentRoundRef.current = 1;
        setCurrentRound(1);
        goToPhase('WORK', s.workPhaseDuration);
      }
    }
  }, [goToPhase]);


  const executeStimulusRef = useRef(executeStimulus);
  useEffect(() => {
    executeStimulusRef.current = executeStimulus;
  }, [executeStimulus]);

  useEffect(() => {
    if (!isActive) {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      if (stimuliTimerRef.current) clearTimeout(stimuliTimerRef.current);
      phaseTimerRef.current = null;
      stimuliTimerRef.current = null;
      stopAllStimuli();
      return;
    }

    if (!phaseTimerRef.current) {
      phaseTimerRef.current = setInterval(tickIntermittentTimer, 1000);
    }

    if (currentPhaseRef.current === 'WORK' && !stimuliTimerRef.current) {
      stimuliTimerRef.current = setTimeout(() => executeStimulusRef.current(), 1000);
    }

    return () => {
      // Cleanup timers on effect destruction (prevents leaks if dependencies change)
      if (phaseTimerRef.current) {
        clearInterval(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
      if (stimuliTimerRef.current) {
        clearTimeout(stimuliTimerRef.current);
        stimuliTimerRef.current = null;
      }
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
    };
  }, [isActive, tickIntermittentTimer, executeStimulus, stopAllStimuli]);

  return { 
    currentWord, 
    currentColor, 
    isOppositeAction,
    currentRound, 
    currentSet,
    currentPhase, 
    phaseTimeRemaining, 
    stats, 
    stimuliCount, 
    isSpeaking, 
    addError,
    totalRounds: settings.totalRounds,
    totalSets: settings.totalSets
  };
};

