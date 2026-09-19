import * as React from 'react';
import { ChevronLeft } from 'lucide-react';

// Collapsible section for the Pro settings screen — turns the long flat
// list of cards into a proper accordion (one open at a time), name and
// order untouched, nothing removed, just tucked away until tapped.
// Consistent header for every screen of the Guided setup flow: a back
// arrow always in the same spot (top-left), and a "Step X/Y" indicator so
// someone unfamiliar with the app always knows how much is left before
// training actually starts.
export const GuidedHeader: React.FC<{
  onBack?: () => void;
  step?: number;
  total?: number;
  appLanguage: 'en' | 'fr' | null;
  onSkip?: () => void;
}> = ({ onBack, step, total, appLanguage, onSkip }) => (
  <div
    className="flex items-center justify-between mb-6"
    style={{ paddingTop: 'max(28px, var(--safe-top))' }}
  >
    {onBack ? (
      <button
        onClick={onBack}
        aria-label={appLanguage === 'en' ? 'Back' : 'Retour'}
        className="w-9 h-9 rounded-full bg-white/5 border border-[var(--acc-primary)]/10 flex items-center justify-center text-[var(--acc-primary)] active:scale-90 hover:bg-white/10 transition-all shrink-0"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    ) : <div className="w-9 h-9 shrink-0" />}
    {step && total ? (
      <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
        {appLanguage === 'en' ? 'Step' : 'Étape'} {step}/{total}
      </span>
    ) : <span />}
    {onSkip ? (
      <button
        onClick={onSkip}
        className="text-[9px] font-black text-[var(--acc-primary)] uppercase tracking-widest active:opacity-70 hover:opacity-80 transition-opacity shrink-0 px-1"
      >
        {appLanguage === 'en' ? 'Skip' : 'Passer'}
      </button>
    ) : <div className="w-9 h-9 shrink-0" />}
  </div>
);
