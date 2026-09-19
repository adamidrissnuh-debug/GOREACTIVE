import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, User, Compass, X } from 'lucide-react';

export type TrainingClass = 'MOTION' | null;
export type Profile = 'PRO' | 'GUIDED' | null;

interface ContextSwitcherProps {
  profile: Profile;
  trainingClass: TrainingClass;
  appLanguage: 'en' | 'fr' | null;
  onChangeProfile: () => void;
  /** Visual accent for the pill. */
  variant?: 'light' | 'dark';
}

// Small persistent pill showing "who you are" (Profile),
// tappable to open a one-tap quick-switch sheet — so changing context never
// requires going back through the full language/manifesto onboarding.
export const ContextSwitcher: React.FC<ContextSwitcherProps> = ({
  profile,
  trainingClass,
  appLanguage,
  onChangeProfile,
  variant = 'dark'
}) => {
  const [open, setOpen] = useState(false);
  const lang = appLanguage || 'fr';

  const classLabel = trainingClass === 'MOTION'
    ? (lang === 'en' ? 'Motion' : 'Mouvement')
    : null;

  const profileLabel = profile === 'PRO'
    ? (lang === 'en' ? 'Athlete' : 'Athlète')
    : profile === 'GUIDED'
      ? (lang === 'en' ? 'Guided' : 'Guidé')
      : null;

  const accent = 'text-[var(--acc-primary)] border-[var(--acc-primary)]/20 bg-[var(--acc-primary)]/5';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-md active:scale-95 transition-transform ${accent}`}
      >
        <Activity className="w-3 h-3" />
        {profileLabel}{profileLabel && classLabel ? ' · ' : ''}{classLabel}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="context-switcher-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2500]"
            />
            <motion.div
              key="context-switcher-sheet"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-[2600] bg-[var(--bg-secondary)] border-t border-[var(--border-color)] rounded-t-[2rem] p-6 pb-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  {lang === 'en' ? 'Switch Context' : 'Changer de Contexte'}
                </h3>
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center active:scale-90 hover:bg-white/10 transition-all">
                  <X className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { setOpen(false); onChangeProfile(); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--acc-primary)]/40 active:scale-[0.98] transition-all text-left"
                >
                  <div className="w-11 h-11 rounded-xl bg-[var(--acc-primary)]/10 flex items-center justify-center text-[var(--acc-primary)] shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[var(--text-primary)] uppercase italic">
                      {lang === 'en' ? 'Change Profile' : 'Changer de Profil'}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">
                      {lang === 'en' ? 'Switch between Athlete and Guided' : 'Basculer Athlète / Guidé'}
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContextSwitcher;
