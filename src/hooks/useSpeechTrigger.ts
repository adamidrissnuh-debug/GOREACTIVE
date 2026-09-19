import { useState, useEffect, useRef, useCallback } from 'react';
import { createVoiceEngine, VoiceEngine } from '../services/voiceEngine';
import { normalizeSpeech } from '../lib/voiceUtils';

interface UseSpeechTriggerOptions {
  isActive: boolean;
  onTrigger: () => void;
  onWordRecognized?: (word: string, volume: number) => void;
  language?: string;
  triggerWords?: string[];
  threshold?: number;
  enableVolumeState?: boolean;
  iaSpeaking?: boolean;
}

export const useSpeechTrigger = ({ 
  isActive, 
  onTrigger,
  onWordRecognized,
  language = 'fr-FR',
  triggerWords = ['check', 'non', 'no'],
  threshold = 0.2,
  enableVolumeState = true,
  iaSpeaking = false
}: UseSpeechTriggerOptions) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'error' | 'unsupported'>('idle');
  const [lastTranscript, setLastTranscript] = useState('');
  const [isHit, setIsHit] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const engineRef = useRef<VoiceEngine | null>(null);
  const previousActiveRef = useRef(false);
  const isActiveRef = useRef(isActive);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number>(0);
  const volumeRef = useRef(0);
  
  const onTriggerRef = useRef(onTrigger);
  const onWordRecognizedRef = useRef(onWordRecognized);
  const thresholdRef = useRef(threshold);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { onTriggerRef.current = onTrigger; }, [onTrigger]);

  // Signaler à Vosk quand l'IA parle pour filtrer son audio
  useEffect(() => {
    engineRef.current?.setIASpeaking?.(iaSpeaking);
  }, [iaSpeaking]);
  useEffect(() => { onWordRecognizedRef.current = onWordRecognized; }, [onWordRecognized]);
  useEffect(() => { thresholdRef.current = threshold; }, [threshold]);

  const stopAudioMonitoring = useCallback(() => {
    if (isAndroid) {
      setVolume(0);
      volumeRef.current = 0;
      return;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setVolume(0);
    volumeRef.current = 0;
  }, []);


  const startAudioMonitoring = useCallback(async () => {
    // Microphone monitoring intentionally disabled for a clean baseline.
    setVolume(0);
    volumeRef.current = 0;
  }, []);


  const handleTrigger = useCallback(() => {
    if (!isActiveRef.current) return;
    const threshold_val = Math.max(5, 150 * (1 - thresholdRef.current));
    const isVolumeValid = isAndroid ? true : volumeRef.current >= threshold_val;
    if (!isVolumeValid) return;

    onTriggerRef.current();
    setIsHit(true);
    setTimeout(() => setIsHit(false), 1200);
  }, []);

  const startListening = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = createVoiceEngine();
      engineRef.current.onTranscript((raw) => {
        const normalized = normalizeSpeech(raw);
        setLastTranscript(normalized);
        onWordRecognizedRef.current?.(normalized, volumeRef.current);
        handleTrigger();
      });
      engineRef.current.onStart(() => setStatus('listening'));
      engineRef.current.onEnd(() => {
        // IMPORTANT Android:
        // pas d'auto-restart JS. Le restart JS provoque le son système micro
        // on/off à chaque cycle. Le moteur native continuousPTT gère la continuité.
        setStatus('idle');
      });
      engineRef.current.onError((err) => {
        console.warn("Voice engine error:", err);
        setStatus('error');
      });
    }

    const langCode = language.startsWith('fr') ? 'fr-FR' : (language.startsWith('en') ? 'en-US' : language);
    engineRef.current.setLanguage(langCode);
    
    // Explicitly stop then start to ensure fresh state if possible
    // though start() usually handles this.
    engineRef.current.start();
  }, [language, handleTrigger]);

  const stopListening = useCallback(() => {
    engineRef.current?.stop();
    setStatus('idle');
    setLastTranscript('');
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isActive && (status === 'idle' || status === 'error')) {
      // Small cooldown to ensure previous session is closed
      timeoutId = setTimeout(() => {
        if (isActiveRef.current) {
          startListening();
          startAudioMonitoring();
        }
      }, 400);
    } else if (!isActive && (status === 'listening' || status === 'error')) {
      stopListening();
      stopAudioMonitoring();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isActive, status, startListening, startAudioMonitoring]);

  return { isHit, status, lastTranscript, volume, startListening, stopListening };
};

