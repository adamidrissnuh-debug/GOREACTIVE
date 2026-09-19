/**
 * useSpeechRecognition — v4 (native-first)
 *
 * Delegates to the shared VoiceEngine (CapacitorSpeechVoiceEngine on Android,
 * WebSpeechVoiceEngine in browser) so that this hook and useSpeechTrigger both
 * go through the same code-path and the same @capgo/capacitor-speech-recognition
 * plugin on device.
 *
 * The old implementation used window.SpeechRecognition directly, which is
 * unavailable inside an Android WebView — that was the root cause of the
 * microphone never working on device.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createVoiceEngine, VoiceEngine } from '../services/voiceEngine';

export type SpeechResult = {
  transcript: string;
  isFinal: boolean;
  alternatives: string[];
};

export const useSpeechRecognition = (active: boolean, language: 'en' | 'fr' = 'fr') => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);

  const engineRef = useRef<VoiceEngine | null>(null);
  const onResultCallback = useRef<((result: SpeechResult) => void) | null>(null);
  const activeRef = useRef(active);

  useEffect(() => { activeRef.current = active; }, [active]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    engineRef.current = null;
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    // Teardown any existing session first
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }

    const engine = createVoiceEngine();
    engineRef.current = engine;

    const langCode = language === 'fr' ? 'fr-FR' : 'en-US';
    engine.setLanguage(langCode);

    engine.onStart(() => setIsListening(true));

    engine.onTranscript((raw: string) => {
      setTranscript(raw);
      if (onResultCallback.current) {
        onResultCallback.current({
          transcript: raw,
          isFinal: true,       // VoiceEngine always emits final segments
          alternatives: [raw],
        });
      }
    });

    engine.onEnd(() => {
      // IMPORTANT Android:
      // le moteur natif continuousPTT garde la session ouverte lui-même.
      // Ne jamais redémarrer ici, sinon Android rejoue le son système micro on/off.
      setIsListening(false);
    });

    engine.onError((err: string) => {
      // Ignore benign errors; log the rest
      if (err !== 'no-speech' && err !== 'aborted') {
        console.error('useSpeechRecognition engine error:', err);
      }
    });

    engine.start();
  }, [language]);

  useEffect(() => {
    if (active) {
      start();
    } else {
      stop();
    }
    return () => stop();
  }, [active, start, stop]);

  const setOnResult = useCallback((cb: (result: SpeechResult) => void) => {
    onResultCallback.current = cb;
  }, []);

  return { transcript, isListening, setOnResult };
};
