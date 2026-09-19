import { AppMode } from '../types';

export const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const min = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
};

export const getAppModeClass = (_mode: AppMode): 'MOVEMENT' => 'MOVEMENT';

export const translateMode = (mode: string, lang: string) => {
  if (lang === 'en') return mode;
  switch (mode) {
    case 'VOICE': return 'VOCAL';
    case 'VISUAL': return 'VISUEL';
    case 'COLOR': return 'COULEUR';
    case 'CHAOS': return 'CHAOS';
    case 'INTERMITTENT': return 'INTERMITTENT';
    default: return mode;
  }
};

// Shared copy — reused verbatim everywhere it's needed instead of being
// retyped (and inevitably reworded slightly differently) at each call site.
export const fastIntervalWarning = (lang: string | null) =>
  lang === 'en'
    ? 'Fast interval → prefer digits/letters. A full word may get cut off if the next stimulus fires before it finishes.'
    : 'Intervalle rapide → privilégie chiffres/lettres. Un mot entier risque d\u2019être coupé si le stimulus suivant arrive avant la fin.';

export const earphonesRequiredWarning = (lang: string | null) =>
  lang === 'en'
    ? 'Wireless earphones are required — without them, the AI voice mixes with your own and the microphone can\u2019t tell them apart.'
    : 'Des écouteurs sans fil sont obligatoires — sans eux, la voix de l\u2019IA se mélange à la tienne et le micro n\u2019arrive plus à les distinguer.';

