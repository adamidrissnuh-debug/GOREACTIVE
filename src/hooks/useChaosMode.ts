import { useState, useEffect, useRef, useCallback } from 'react';
import { speakNativeOrWeb, stopNativeOrWebSpeech } from '../lib/nativeSpeech';

interface ChaosModeSettings {
  visualMode: 'NONE' | 'COLORS' | 'WORDS' | 'BOTH';
  visualWords: string[];
  activeRainbowColors: string[];
  rainbowColors: { id: string; hex: string; labels: Record<string, string> }[];
  
  audioMode: 'NONE' | 'WORDS';
  audioWords: string[];
  
  minInterval: number;
  maxInterval: number;
  language: 'en' | 'fr';
  recordings?: Record<string, string>;
  sessionTimeRemaining?: number;
  errorTrackingEnabled?: boolean;
  
  // New properties for switching logic
  switchingMode?: boolean;
  opposites?: Record<string, string>;
}

const STIMULUS_END_BUFFER = 3;

export const useChaosMode = (isActive: boolean, settings: ChaosModeSettings, resetKey?: any) => {
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [isOppositeAction, setIsOppositeAction] = useState(false);
  const [stats, setStats] = useState({ success: 0, errors: 0, bestStreak: 0, currentStreak: 0 });
  const [stimuliCount, setStimuliCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stimuliCountRef = useRef(0);
  const hasErrorRef = useRef(false);

  useEffect(() => {
    setStats({ success: 0, errors: 0, bestStreak: 0, currentStreak: 0 });
    setStimuliCount(0);
    stimuliCountRef.current = 0;
    hasErrorRef.current = false;
  }, [resetKey]);

  const addError = useCallback(() => {
    if (!settings.errorTrackingEnabled) return;
    if (hasErrorRef.current) return;
    hasErrorRef.current = true;
    setStats(prev => ({
      ...prev,
      errors: prev.errors + 1,
      currentStreak: 0
    }));
  }, [settings.errorTrackingEnabled]);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const executeStimulus = useCallback(() => {
    if (!isActive) return;
    const s = settingsRef.current;

    if (s.errorTrackingEnabled && stimuliCountRef.current > 0) {
      if (!hasErrorRef.current) {
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
    }
    
    hasErrorRef.current = false;
    stimuliCountRef.current += 1;
    setStimuliCount(prev => prev + 1);

    let visualWord: string | null = null;
    let visualColor: string | null = null;
    let audioWordForSpeech: string | null = null;
    let isOpposite = false;

    // 1. VISUAL CHANNEL
    if (s.visualMode !== 'NONE') {
      let type: 'WORDS' | 'COLORS' = 'WORDS';
      if (s.visualMode === 'COLORS') {
        type = 'COLORS';
      } else if (s.visualMode === 'WORDS') {
        type = 'WORDS';
      } else if (s.visualMode === 'BOTH') {
        const canDoWords = s.visualWords.length > 0;
        const canDoColors = s.activeRainbowColors.length > 0;
        if (canDoWords && canDoColors) {
          type = Math.random() > 0.5 ? 'WORDS' : 'COLORS';
        } else if (canDoWords) {
          type = 'WORDS';
        } else if (canDoColors) {
          type = 'COLORS';
        }
      }

      if (type === 'WORDS' && s.visualWords.length > 0) {
        visualWord = s.visualWords[Math.floor(Math.random() * s.visualWords.length)];
      } else if (type === 'COLORS' && s.activeRainbowColors.length > 0) {
        const colorId = s.activeRainbowColors[Math.floor(Math.random() * s.activeRainbowColors.length)];
        const colorObj = s.rainbowColors.find(c => c.id === colorId);
        visualColor = colorObj?.hex || null;
        visualWord = null;
        
        // Switching logic: Red indicates opposite
        if (s.switchingMode && colorId === 'red') {
          isOpposite = true;
        }
      }
    }

    // 2. AUDIO CHANNEL
    if (s.audioMode !== 'NONE' && s.audioWords.length > 0) {
      audioWordForSpeech = s.audioWords[Math.floor(Math.random() * s.audioWords.length)];
      
      setIsSpeaking(true);
      const normalizedWord = audioWordForSpeech.toLowerCase().trim();
      const recordingKey = Object.keys(s.recordings || {}).find(k => k.toLowerCase().trim() === normalizedWord);

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

      if (s.recordings && recordingKey && s.recordings[recordingKey]) {
        try {
          const audio = new Audio(s.recordings[recordingKey]);
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => playSpeechFallback();
          audio.play().catch(() => playSpeechFallback());
        } catch (e) {
          playSpeechFallback();
        }
      } else {
        playSpeechFallback();
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
    timerRef.current = setTimeout(executeStimulus, delay);
  }, [isActive]);

  const executeStimulusRef = useRef(executeStimulus);
  useEffect(() => {
    executeStimulusRef.current = executeStimulus;
  }, [executeStimulus]);

  useEffect(() => {
    if (isActive) {
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => executeStimulusRef.current(), 1000);
      }
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setCurrentWord(null);
      setCurrentColor(null);
      setIsOppositeAction(false);
      setIsSpeaking(false);
      stopNativeOrWebSpeech();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
    };
  }, [isActive]);

  return { currentWord, currentColor, isOppositeAction, stats, stimuliCount, isSpeaking, addError };
};

