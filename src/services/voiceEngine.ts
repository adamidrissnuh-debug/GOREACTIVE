import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';

export interface VoiceEngine {
  start(): Promise<void>;
  stop(): void;
  isStarted(): boolean;
  onTranscript(callback: (text: string) => void): void;
  onError(callback: (error: string) => void): void;
  onStart(callback: () => void): void;
  onEnd(callback: () => void): void;
  setLanguage(lang: string): void;
  setVocabularyMode?(mode: 'error' | 'error_calibration' | 'all'): void;
  setIASpeaking?(speaking: boolean): void;
}

type VocabularyMode = 'error' | 'error_calibration' | 'all';

declare global {
  interface Window {
    GoReactiveSpeech?: { status: () => string; setIAWords: (w: string[]) => void; clearIAWords: () => void; };
    GoReactiveAudio?: { muteRecognizerCues?: (muted: boolean) => void; };
    GoReactiveVosk?: { start(lang: string, mode: string): void; stop(): void; setVocabularyMode(mode: string): void; isRunning(): boolean; setIASpeaking(speaking: boolean): void; preload(lang: string): void; };
    __voskTranscript?: (text: string, isFinal: boolean) => void;
    __voskStatus?: (status: string) => void;
    __voskError?: (msg: string) => void;
    __goReactiveNativeSpeechDebug?: Record<string, any>;
  }
}

const normalizeSpeech = (value: string) =>
  (value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();

const tokenize = (value: string) => normalizeSpeech(value).split(/\s+/).filter(Boolean);

// ─────────────────────────────────────────────────────────────────────────────
// VoskVoiceEngine — micro CONTINU via AudioRecord natif Android + Vosk on-device
//
// Le micro est ouvert une seule fois via GoReactiveVosk.start() et ne se ferme
// qu'à GoReactiveVosk.stop(). Pas de cycles, pas de sons système, voyant vert
// permanent. Les callbacks JS sont enregistrés sur window.__voskTranscript,
// __voskStatus, __voskError — le Java les appelle via evaluateJavascript().
// ─────────────────────────────────────────────────────────────────────────────
class VoskVoiceEngine implements VoiceEngine {
  private transcriptCallback: ((text: string) => void) | null = null;
  private errorCallback: ((error: string) => void) | null = null;
  private startCallback: (() => void) | null = null;
  private endCallback: (() => void) | null = null;
  private started = false;
  private language = 'fr-FR';
  private mode: VocabularyMode = 'error';
  private lastEmittedText = '';
  private lastEmitTime = 0;

  private debug(patch: Record<string, any>) {
    if (typeof window === 'undefined') return;
    window.__goReactiveNativeSpeechDebug = {
      ...(window.__goReactiveNativeSpeechDebug || {}),
      ...patch,
      updatedAt: Date.now()
    };
  }

  onTranscript(cb: (text: string) => void) { this.transcriptCallback = cb; }
  onError(cb: (error: string) => void) { this.errorCallback = cb; }
  onStart(cb: () => void) { this.startCallback = cb; }
  onEnd(cb: () => void) { this.endCallback = cb; }
  setLanguage(lang: string) { this.language = lang || 'fr-FR'; }
  setVocabularyMode(mode: VocabularyMode) {
    this.mode = mode || 'error';
    if (window.GoReactiveVosk) {
      window.GoReactiveVosk.setVocabularyMode(this.mode);
    }
  }

  setIASpeaking(speaking: boolean) {
    try { window.GoReactiveVosk?.setIASpeaking(speaking); } catch {}
  }
  isStarted() { return this.started; }

  private emitTranscript(raw: string) {
    const tokens = tokenize(raw);
    if (!tokens.length) return;
    // Déduplication gérée côté Java (cooldown 600ms) — on émet directement
    this.transcriptCallback?.(tokens.join(' '));
  }

  private registerCallbacks() {
    window.__voskTranscript = (text: string, _isFinal: boolean) => {
      this.debug({ lastStatus: 'transcript-received', lastDetail: text });
      if (!this.started) return;
      this.emitTranscript(text);
    };
    window.__voskStatus = (status: string) => {
      this.debug({ lastStatus: `status-${status}` });
      if (status === 'listening' && !this.started) {
        this.started = true;
        this.startCallback?.();
      } else if (status === 'idle' && this.started) {
        this.started = false;
        this.endCallback?.();
      } else if (status === 'permission-granted') {
        const lang = this.language.startsWith('fr') ? 'fr' : 'en';
        window.GoReactiveVosk?.start(lang, this.mode);
      }
    };
    window.__voskError = (msg: string) => {
      this.debug({ lastStatus: 'error', lastDetail: msg });
      if (msg === 'permission-required') return;
      this.errorCallback?.(msg);
    };
  }

  private unregisterCallbacks() {
    window.__voskTranscript = undefined;
    window.__voskStatus = undefined;
    window.__voskError = undefined;
  }

  async start(): Promise<void> {
    // Android injecte les interfaces JS de façon asynchrone après le chargement
    // de la page. On attend jusqu'à 3 secondes que GoReactiveVosk soit disponible.
    let retries = 0;
    while (!window.GoReactiveVosk && retries < 30) {
      await new Promise(r => setTimeout(r, 100));
      retries++;
    }

    if (!window.GoReactiveVosk) {
      this.errorCallback?.('vosk-bridge-unavailable');
      this.debug({ lastStatus: 'bridge-unavailable' });
      return;
    }
    if (this.started) return;

    this.debug({ lastStatus: 'starting', lastDetail: `lang=${this.language} mode=${this.mode} retries=${retries}` });
    this.lastEmittedText = '';
    this.lastEmitTime = 0;
    this.registerCallbacks();

    const lang = this.language.startsWith('fr') ? 'fr' : 'en';
    try {
      window.GoReactiveVosk.start(lang, this.mode);
      this.debug({ lastStatus: 'start-called', lastDetail: `lang=${lang} mode=${this.mode}` });
    } catch (e: any) {
      this.debug({ lastStatus: 'start-error', lastDetail: String(e?.message || e) });
      this.errorCallback?.(String(e?.message || e));
    }
  }

  stop(): void {
    if (!window.GoReactiveVosk) return;
    window.GoReactiveVosk.stop();
    this.started = false;
    this.unregisterCallbacks();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CapacitorSpeechVoiceEngine — fallback si Vosk indisponible
// (conservé pour compatibilité, mais VoskVoiceEngine est préféré sur Android)
// ─────────────────────────────────────────────────────────────────────────────
class CapacitorSpeechVoiceEngine implements VoiceEngine {
  private transcriptCallback: ((text: string) => void) | null = null;
  private errorCallback: ((error: string) => void) | null = null;
  private startCallback: (() => void) | null = null;
  private endCallback: (() => void) | null = null;
  private started = false;
  private stopping = false;
  private language = 'fr-FR';
  private mode: VocabularyMode = 'all';
  private listenerHandles: Array<{ remove: () => Promise<void> | void }> = [];
  private lastEmittedText = '';
  private lastEmitTime = 0;
  private cycleRunning = false;

  onTranscript(cb: (text: string) => void) { this.transcriptCallback = cb; }
  onError(cb: (error: string) => void) { this.errorCallback = cb; }
  onStart(cb: () => void) { this.startCallback = cb; }
  onEnd(cb: () => void) { this.endCallback = cb; }
  setLanguage(lang: string) { this.language = lang || 'fr-FR'; }
  setVocabularyMode(mode: VocabularyMode) { this.mode = mode || 'all'; }
  isStarted() { return this.started; }

  private emitTranscript(raw: string) {
    const tokens = tokenize(raw);
    if (!tokens.length) return;
    const text = tokens.join(' ');
    const now = Date.now();
    if (text === this.lastEmittedText && now - this.lastEmitTime < 800) return;
    this.lastEmittedText = text;
    this.lastEmitTime = now;
    this.transcriptCallback?.(text);
  }

  private async ensureListeners() {
    if (this.listenerHandles.length) return;
    const add = async (event: string, cb: (e: any) => void) => {
      try {
        const h = await (SpeechRecognition as any).addListener(event, cb);
        if (h) this.listenerHandles.push(h);
      } catch {}
    };
    await add('partialResults', (e: any) => {
      if (!this.started || this.stopping || e?.isRestarting || e?.forced) return;
      const best = e?.accumulatedText || e?.accumulated || e?.matches?.[0] || '';
      if (best) this.emitTranscript(best);
    });
    await add('segmentResults', (e: any) => {
      const t = e?.matches?.[0];
      if (t) this.emitTranscript(String(t));
    });
  }

  private async recognitionLoop() {
    while (this.started && !this.stopping) {
      if (this.cycleRunning) { await new Promise(r => setTimeout(r, 0)); continue; }
      this.cycleRunning = true;
      try {
        const result = await (SpeechRecognition as any).start({
          language: this.language, maxResults: 5, popup: false,
          partialResults: true, continuousPTT: true, addPunctuation: false, allowForSilence: 2000
        });
        const best = result?.matches?.[0];
        if (best) this.emitTranscript(best);
      } catch (e: any) {
        const msg = String(e?.message || e || '');
        if (!msg.includes('already') && !msg.includes('running')) {
          this.errorCallback?.(msg);
          await new Promise(r => setTimeout(r, 150));
        }
      } finally { this.cycleRunning = false; }
    }
    this.endCallback?.();
  }

  async start(): Promise<void> {
    if (!Capacitor.isNativePlatform()) { this.errorCallback?.('native-only'); return; }
    if (this.started) return;
    this.stopping = false; this.cycleRunning = false;
    this.lastEmittedText = ''; this.lastEmitTime = 0;
    try {
      const perms = await (SpeechRecognition as any).checkPermissions().catch(() => null);
      if (!perms || perms.speechRecognition !== 'granted' || perms.microphone === 'denied') {
        await (SpeechRecognition as any).requestPermissions();
      }
      await this.ensureListeners();
      await (SpeechRecognition as any).setPTTState({ held: true });
      this.started = true;
      this.startCallback?.();
      this.recognitionLoop();
    } catch (e: any) {
      this.started = false;
      this.errorCallback?.(String(e?.message || e));
    }
  }

  stop(): void {
    this.stopping = true; this.started = false;
    try { (SpeechRecognition as any).setPTTState({ held: false }); } catch {}
    try { (SpeechRecognition as any).forceStop?.({ timeout: 500 }); } catch {}
    try { (SpeechRecognition as any).stop?.(); } catch {}
    this.endCallback?.();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WebSpeechVoiceEngine — navigateur desktop (inchangé)
// ─────────────────────────────────────────────────────────────────────────────
class WebSpeechVoiceEngine implements VoiceEngine {
  private recognition: any = null;
  private transcriptCallback: ((text: string) => void) | null = null;
  private errorCallback: ((error: string) => void) | null = null;
  private startCallback: (() => void) | null = null;
  private endCallback: (() => void) | null = null;
  private started = false;
  private language = 'fr-FR';

  onTranscript(cb: (text: string) => void) { this.transcriptCallback = cb; }
  onError(cb: (error: string) => void) { this.errorCallback = cb; }
  onStart(cb: () => void) { this.startCallback = cb; }
  onEnd(cb: () => void) { this.endCallback = cb; }
  setLanguage(lang: string) { this.language = lang || 'fr-FR'; if (this.recognition) this.recognition.lang = this.language; }
  setVocabularyMode(_: VocabularyMode) {}
  isStarted() { return this.started; }

  async start(): Promise<void> {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) { this.errorCallback?.('web-speech-unavailable'); return; }
    if (!this.recognition) {
      this.recognition = new Ctor();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 5;
      this.recognition.onstart = () => { this.started = true; this.startCallback?.(); };
      this.recognition.onend = () => { this.started = false; this.endCallback?.(); };
      this.recognition.onerror = (e: any) => this.errorCallback?.(e?.error || 'web-speech-error');
      this.recognition.onresult = (event: any) => {
        const result = event.results?.[event.results.length - 1];
        const text = result?.[0]?.transcript;
        if (text) this.transcriptCallback?.(text);
      };
    }
    this.recognition.lang = this.language;
    this.recognition.start();
  }

  stop(): void { try { this.recognition?.stop(); } catch {} this.started = false; }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory — Vosk sur Android natif (bridge injecté de manière asynchrone par
// Android, donc on ne vérifie pas window.GoReactiveVosk ici mais dans start()).
// Fallback Capacitor si Vosk échoue, fallback Web sur navigateur.
// ─────────────────────────────────────────────────────────────────────────────
export const createVoiceEngine = (): VoiceEngine => {
  if (Capacitor.isNativePlatform()) {
    return new VoskVoiceEngine();
  }
  return new WebSpeechVoiceEngine();
};

// Charge le modèle Vosk en mémoire sans ouvrir le micro — à appeler le plus
// tôt possible (dès que la langue est connue) pour que le premier vrai
// démarrage du micro (calibrage, entraînement) n'ait plus à payer le coût de
// lecture du modèle depuis le disque à ce moment-là.
export const preloadVoiceEngine = async (lang: string): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;
  let retries = 0;
  while (!window.GoReactiveVosk && retries < 30) {
    await new Promise(r => setTimeout(r, 100));
    retries++;
  }
  const normalized = lang?.startsWith('fr') ? 'fr' : 'en';
  try {
    window.GoReactiveVosk?.preload(normalized);
  } catch {}
};
