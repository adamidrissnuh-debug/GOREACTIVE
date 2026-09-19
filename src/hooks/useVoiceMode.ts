import { useState, useEffect, useRef, useCallback } from 'react';
import { speakNativeOrWeb, stopNativeOrWebSpeech } from '../lib/nativeSpeech';

interface VoiceModeSettings {
  words: string[];
  minInterval: number;
  maxInterval: number;
  language: 'en' | 'fr';
  recordings?: Record<string, string>;
  sessionTimeRemaining?: number;
  errorTrackingEnabled?: boolean;
  includesWords?: boolean;
}

const STIMULUS_END_BUFFER = 3;

export const useVoiceMode = (isActive: boolean, settings: VoiceModeSettings, resetKey?: any) => {
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [stats, setStats] = useState({ success: 0, errors: 0, bestStreak: 0, currentStreak: 0 });
  const [stimuliCount, setStimuliCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stimuliCountRef = useRef(0);
  // Sert uniquement à savoir si le stimulus précédent était "propre" (aucune erreur déclarée)
  // pour incrémenter le streak de succès. N'est JAMAIS utilisé pour bloquer addError.
  const intervalHadErrorRef = useRef(false);

  useEffect(() => {
    setStats({ success: 0, errors: 0, bestStreak: 0, currentStreak: 0 });
    setStimuliCount(0);
    stimuliCountRef.current = 0;
    intervalHadErrorRef.current = false;
  }, [resetKey]);

  // Fenêtre d'erreur TOUJOURS ouverte — du début à la fin de l'entraînement.
  // Un seul mot d'erreur compte par intervalle, peu importe combien de fois
  // il est prononcé (ou détecté) avant le stimulus suivant — sinon un simple
  // doublon de détection microphone gonfle artificiellement le nombre
  // d'erreurs, sans rapport avec le nombre réel de stimulis ratés.
  // La voix IA ne dit jamais "erreur/raté/non/faux" → canal étanche par conception.
  const addError = useCallback(() => {
    if (!settings.errorTrackingEnabled) return;
    if (intervalHadErrorRef.current) return; // déjà compté pour ce stimulus
    intervalHadErrorRef.current = true; // marque l'intervalle courant comme raté (pour le streak)
    setStats(prev => ({
      ...prev,
      errors: prev.errors + 1,
      currentStreak: 0,
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
      if (!intervalHadErrorRef.current) {
        setStats(prev => {
          const newStreak = prev.currentStreak + 1;
          return {
            ...prev,
            success: prev.success + 1,
            currentStreak: newStreak,
            bestStreak: Math.max(prev.bestStreak, newStreak),
          };
        });
      }
    }

    // Reset du marqueur d'intervalle pour le nouveau stimulus
    intervalHadErrorRef.current = false;

    if (s.words.length === 0) {
      const delay = (Math.random() * (s.maxInterval - s.minInterval) + s.minInterval) * 1000;
      timerRef.current = setTimeout(executeStimulus, delay);
      return;
    }

    const chosenWord = s.words[Math.floor(Math.random() * s.words.length)];

    if (s.includesWords) {
      setCurrentWord(chosenWord);
    }
    setStimuliCount(prev => prev + 1);
    stimuliCountRef.current += 1;

    setIsSpeaking(true);
    const normalizedWord = chosenWord.toLowerCase().trim();
    const recordingKey = Object.keys(s.recordings || {}).find(k => k.toLowerCase().trim() === normalizedWord);

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
      speakNativeOrWeb(getSpeechWord(chosenWord), s.language, 1.6, () => setIsSpeaking(false));
    };

    if (s.recordings && recordingKey && s.recordings[recordingKey]) {
      try {
        const audio = new Audio(s.recordings[recordingKey]);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => { playSpeechFallback(); };
        audio.play().catch(() => { playSpeechFallback(); });
      } catch (e) {
        playSpeechFallback();
      }
      setTimeout(() => setIsSpeaking(false), 3000);
    } else {
      playSpeechFallback();
      setTimeout(() => setIsSpeaking(false), 3000);
    }

    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    const displayDuration = Math.min(800, s.minInterval * 800);
    clearTimerRef.current = setTimeout(() => {
      setCurrentWord(null);
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
        speakNativeOrWeb(' ', settingsRef.current.language, 1, undefined);
        timerRef.current = setTimeout(() => executeStimulusRef.current(), 1000);
      }
    } else {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      if (clearTimerRef.current) { clearTimeout(clearTimerRef.current); clearTimerRef.current = null; }
      setCurrentWord(null);
      setIsSpeaking(false);
      stopNativeOrWebSpeech();
    }
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      if (clearTimerRef.current) { clearTimeout(clearTimerRef.current); clearTimerRef.current = null; }
    };
  }, [isActive]);

  return { currentWord, stats, stimuliCount, isSpeaking, addError };
};
