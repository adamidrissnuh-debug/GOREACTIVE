export type AppLanguage = 'fr' | 'en' | string | null | undefined;

declare global {
  interface Window {
    GoReactiveTTS?: {
      speak?: (text: string, language: string, rate: number) => void;
      cancel?: () => void;
    };
    GoReactiveSpeech?: {
      status: () => string;
      setIAWords: (words: string[]) => void;
      clearIAWords: () => void;
    };
  }
}

const normalizeLanguage = (language: AppLanguage) => language === 'en' ? 'en-US' : 'fr-FR';

const estimateDuration = (text: string, rate: number) => {
  const base = Math.max(450, Math.min(2200, text.length * 75));
  return Math.max(350, Math.round(base / Math.max(0.75, rate)));
};

const buildIAWords = (text: string) => {
  const normalized = (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const compact = normalized.replace(/\s+/g, '');
  return Array.from(new Set([normalized, compact, ...normalized.split(/\s+/)].filter(Boolean)));
};

const markIAWords = (text: string, durationMs: number) => {
  try {
    window.GoReactiveSpeech?.setIAWords?.(buildIAWords(text));
    window.setTimeout(() => window.GoReactiveSpeech?.clearIAWords?.(), Math.max(450, durationMs + 250));
  } catch {}
};

export const stopNativeOrWebSpeech = () => {
  try {
    if (window.GoReactiveTTS?.cancel) {
      window.GoReactiveTTS.cancel();
      return;
    }
  } catch {}
  try {
    window.speechSynthesis?.cancel?.();
  } catch {}
};

export const speakNativeOrWeb = (
  text: string,
  language: AppLanguage = 'fr',
  rate = 1.6,
  onDone?: () => void
) => {
  if (!text) {
    onDone?.();
    return false;
  }

  const normalizedLanguage = normalizeLanguage(language);
  const estimatedMs = estimateDuration(text, rate);
  markIAWords(text, estimatedMs);

  try {
    if (window.GoReactiveTTS?.speak) {
      window.GoReactiveTTS.speak(text, normalizedLanguage, rate);
      if (onDone) window.setTimeout(onDone, estimatedMs);
      return true;
    }
  } catch {
    // Continue with Web Speech fallback below.
  }

  const SpeechUtterance = (window as any).SpeechSynthesisUtterance;
  if (!window.speechSynthesis || !SpeechUtterance) {
    onDone?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechUtterance(text);
    utterance.lang = normalizedLanguage;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => { window.GoReactiveSpeech?.clearIAWords?.(); onDone?.(); };
    utterance.onerror = () => { window.GoReactiveSpeech?.clearIAWords?.(); onDone?.(); };
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    onDone?.();
    return false;
  }
};
