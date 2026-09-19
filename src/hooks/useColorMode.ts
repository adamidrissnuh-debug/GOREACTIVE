import { useState, useEffect, useRef, useCallback } from 'react';
import { stopNativeOrWebSpeech } from '../lib/nativeSpeech';

interface ColorModeSettings {
  words: string[];
  activeRainbowColors: string[];
  rainbowColors: { id: string; hex: string; labels: Record<string, string> }[];
  minInterval: number;
  maxInterval: number;
  language: 'en' | 'fr';
  includesWords: boolean;
  includesColors: boolean;
  recordings?: Record<string, string>;
  sessionTimeRemaining?: number;
  errorTrackingEnabled?: boolean;
}

const STIMULUS_END_BUFFER = 3;

export const useColorMode = (isActive: boolean, settings: ColorModeSettings, resetKey?: any) => {
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
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

    // Handle success of PREVIOUS stimulus
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
    
    // Reset for the new stimulus
    hasErrorRef.current = false;
    stimuliCountRef.current += 1;

    const possibleTypes: ('WORDS' | 'COLORS')[] = [];
    if (s.includesWords && s.words.length > 0) possibleTypes.push('WORDS');
    if (s.includesColors && s.activeRainbowColors.length > 0) possibleTypes.push('COLORS');

    if (possibleTypes.length === 0) {
      const delay = (Math.random() * (s.maxInterval - s.minInterval) + s.minInterval) * 1000;
      timerRef.current = setTimeout(executeStimulus, delay);
      return;
    }

    const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

    let chosenText = '';
    if (type === 'WORDS' && s.words.length > 0) {
      const word = s.words[Math.floor(Math.random() * s.words.length)];
      chosenText = word;
      setCurrentWord(word);
      setCurrentColor(null);
    } else if (type === 'COLORS' && s.activeRainbowColors.length > 0) {
      const colorId = s.activeRainbowColors[Math.floor(Math.random() * s.activeRainbowColors.length)];
      const colorObj = s.rainbowColors.find(c => c.id === colorId);
      chosenText = '';
      setCurrentColor(colorObj?.hex || null);
      setCurrentWord(null);
    } else {
      // Re-schedule if something went wrong with selection
      const delay = (Math.random() * (s.maxInterval - s.minInterval) + s.minInterval) * 1000;
      timerRef.current = setTimeout(executeStimulus, delay);
      return;
    }

    setStimuliCount(prev => prev + 1);

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

    const displayDuration = Math.min(800, s.minInterval * 800);
    clearTimerRef.current = setTimeout(() => {
      setCurrentWord(null);
      setCurrentColor(null);
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
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
      setCurrentWord(null);
      setCurrentColor(null);
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

  return { currentWord, currentColor, stats, stimuliCount, isSpeaking, addError };
};
